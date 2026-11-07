begin;
-- Claim abandoned uploads before touching Storage. Rejected metadata is retained
-- so retries cannot resurrect a cleaned object or erase its history.
create function public.claim_abandoned_uploads() returns table(id uuid,object_path text,original_path text)
language plpgsql security definer set search_path='' as $$
begin
 return query
 with candidates as (
  select a.id from public.attachments a
  where a.safety='pending' and a.created_at<now()-interval '24 hours'
  and not exists(select 1 from public.referrals r where r.attachment_id=a.id)
  and not exists(select 1 from public.assessments e where e.attachment_id=a.id)
  for update of a skip locked
 ), claimed as (
  update public.attachments a set safety='rejected' from candidates c
  where a.id=c.id and a.safety='pending' returning a.id,a.object_path,a.original_path
 ) select * from claimed;
end; $$;
revoke all on function public.claim_abandoned_uploads() from public,anon,authenticated;
grant execute on function public.claim_abandoned_uploads() to service_role;
-- Finalization must acknowledge a successful transition, including a safe retry.
create or replace function public.finalize_attachment(p_id uuid,p_hash text,p_clean boolean) returns void
language plpgsql security definer set search_path='' as $$
declare a public.attachments;
begin
 select * into a from public.attachments where id=p_id for update;
 if not found or a.sha256<>p_hash or a.safety='rejected' then raise exception 'attachment unavailable';end if;
 if a.safety='clean' and p_clean then return;end if;
 update public.attachments set safety=case when p_clean then 'clean' else 'rejected' end where id=p_id;
end; $$;
commit;
