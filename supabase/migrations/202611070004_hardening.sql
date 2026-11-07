begin;
create or replace function public.revoke_activity_points() returns trigger language plpgsql security definer set search_path='' as $$ declare ev uuid;student uuid;begin
 if TG_TABLE_NAME='attendance' then
  if new.confirmed then return new;end if;
 elsif TG_TABLE_NAME='submissions' then
  if new.state not in ('invalidated','suspended','administrative_review') then return new;end if;
 else return new;end if;
 ev:=new.event_id;student:=new.student_id;
 insert into public.points_ledger(student_id,semester_id,activity,source_id,points,reversal_of,reason) select student_id,semester_id,activity,source_id,-points,id,'Eligibility revoked' from public.points_ledger where source_id=ev and student_id=student and reversal_of is null on conflict(reversal_of) do nothing;return new;
end; $$;
-- A final assessment requires attendance and an uncancelled event at decision time.
create function public.guard_assessment() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if not exists(select 1 from public.referrals r join public.submissions s on s.id=r.submission_id join public.events e on e.id=s.event_id where r.id=new.referral_id and e.status='published' and e.club_approved) then raise exception 'event no longer eligible';end if;return new;end; $$;
create trigger assessment_event_guard before insert on public.assessments for each row execute function public.guard_assessment();
revoke all on function public.guard_assessment() from public,anon,authenticated;
commit;
