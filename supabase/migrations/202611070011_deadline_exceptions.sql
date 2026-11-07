begin;
create table public.deadline_exceptions(
 id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.submissions,
 previous_deadline timestamptz not null,new_deadline timestamptz not null,reason text not null,
 actor_id uuid not null references public.profiles,created_at timestamptz not null default now());
alter table public.deadline_exceptions enable row level security;
revoke all on public.deadline_exceptions from anon,authenticated;
grant select on public.deadline_exceptions to authenticated;
create policy exception_read on public.deadline_exceptions for select to authenticated using(public.can_read_submission(submission_id));
create trigger exception_audit after insert on public.deadline_exceptions for each row execute function public.audit_change();
create function public.extend_submission_deadline(p_submission uuid,p_deadline timestamptz,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare s public.submissions;result uuid;
begin
 select * into s from public.submissions where id=p_submission for update;
 if not found or not public.is_admin((select department_id from public.events where id=s.event_id)) or length(trim(p_reason))<5 then raise exception 'academic authority and reason required';end if;
 if s.positive_locked or s.state in ('invalidated','suspended','completed','positive','administrative_review') or p_deadline<=s.deadline_snapshot or p_deadline<=now() then raise exception 'deadline exception forbidden';end if;
 perform set_config('utr.reason',p_reason,true);
 insert into public.deadline_exceptions(submission_id,previous_deadline,new_deadline,reason,actor_id) values(s.id,s.deadline_snapshot,p_deadline,p_reason,auth.uid()) returning id into result;
 update public.submissions set deadline_snapshot=p_deadline where id=s.id;
 insert into public.notifications(user_id,title,body) values(s.student_id,'تمدید مستند مهلت پرونده','مهلت پرونده با تصمیم اداره پژوهشی تمدید شد. تاریخ دقیق در پرونده نمایش داده می‌شود.');
 return result;
end; $$;
revoke all on function public.extend_submission_deadline(uuid,timestamptz,text) from public,anon;
grant execute on function public.extend_submission_deadline(uuid,timestamptz,text) to authenticated;
commit;
