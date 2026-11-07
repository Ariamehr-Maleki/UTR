begin;
create table public.certificate_rules(kind text primary key check(kind in ('membership','attendance','participation')),approved boolean not null default false,minimum_events integer check(minimum_events>0),policy_id uuid not null references public.policies);
alter table public.certificate_rules enable row level security;
grant select on public.certificate_rules to authenticated;
create policy cert_rules_read on public.certificate_rules for select using(approved);
create unique index one_certificate on public.certificates(student_id,kind,coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid));
create function public.sync_points(p_event uuid,p_student uuid) returns void language plpgsql security definer set search_path='' as $$ declare ev public.events;sem uuid;rule public.points_rules;eligible boolean;prior public.points_ledger;begin
 select * into ev from public.events where id=p_event for share;
 if p_student<>auth.uid() and not public.is_admin(ev.department_id) then raise exception 'points forbidden';end if;
 if not exists(select 1 from public.policies where id=ev.policy_id and approved and points_enabled) then return;end if;
 select id into sem from public.semesters where (ev.starts_at at time zone 'Asia/Tehran')::date between starts_on and ends_on order by starts_on desc limit 1;if sem is null then raise exception 'semester required';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student::text||p_event::text,0));
 for rule in select * from public.points_rules where approved and activity in ('attendance','summary_assessed') loop
  eligible:=ev.status='published' and exists(select 1 from public.attendance where event_id=p_event and student_id=p_student and confirmed);
  if rule.activity='summary_assessed' then eligible:=eligible and exists(select 1 from public.submissions s join public.referrals r on r.submission_id=s.id join public.assessments a on a.referral_id=r.id where s.event_id=p_event and s.student_id=p_student and s.state in ('zero','positive','completed') and a.outcome='score');end if;
  select * into prior from public.points_ledger where student_id=p_student and activity=rule.activity and source_id=p_event and reversal_of is null;
  if eligible and not found then insert into public.points_ledger(student_id,semester_id,activity,source_id,points,reason) values(p_student,sem,rule.activity,p_event,rule.points,'Approved eligible activity');
  elsif not eligible and found then insert into public.points_ledger(student_id,semester_id,activity,source_id,points,reversal_of,reason) values(p_student,sem,rule.activity,p_event,-prior.points,prior.id,'Activity invalidated') on conflict(reversal_of) do nothing;end if;
 end loop;
end; $$;
create function public.revoke_activity_points() returns trigger language plpgsql security definer set search_path='' as $$ declare ev uuid;student uuid;begin
 if TG_TABLE_NAME='attendance' and not new.confirmed then ev:=new.event_id;student:=new.student_id;
 elsif TG_TABLE_NAME='submissions' and new.state in ('invalidated','suspended','administrative_review') then ev:=new.event_id;student:=new.student_id;
 else return new;end if;
 insert into public.points_ledger(student_id,semester_id,activity,source_id,points,reversal_of,reason) select student_id,semester_id,activity,source_id,-points,id,'Eligibility revoked' from public.points_ledger where source_id=ev and student_id=student and reversal_of is null on conflict(reversal_of) do nothing;return new;
end; $$;
create trigger points_attendance after update on public.attendance for each row execute function public.revoke_activity_points();
create trigger points_submission after update on public.submissions for each row execute function public.revoke_activity_points();
create function public.leaderboard(p_semester uuid) returns table(display_name text,participation_points bigint,rank_position bigint) language sql stable security definer set search_path='' as $$ select p.display_name,sum(l.points),dense_rank() over(order by sum(l.points) desc) from public.points_ledger l join public.profiles p on p.id=l.student_id where l.semester_id=p_semester and p.leaderboard_consent and p.membership='approved' group by p.id,p.display_name having sum(l.points)>0; $$;
create function public.issue_certificate(p_kind text,p_event uuid default null) returns uuid language plpgsql security definer set search_path='' as $$ declare rule public.certificate_rules;profile public.profiles;cid uuid;begin
 select * into profile from public.profiles where id=auth.uid() and membership='approved';if not found then raise exception 'approved membership required';end if;
 select * into rule from public.certificate_rules where kind=p_kind and approved;if not found or not exists(select 1 from public.policies where id=rule.policy_id and approved and certificates_enabled) then raise exception 'certificate policy pending';end if;
 if p_kind='attendance' and not exists(select 1 from public.attendance a join public.events e on e.id=a.event_id where a.student_id=auth.uid() and a.event_id=p_event and a.confirmed and e.status='published') then raise exception 'attendance required';end if;
 if p_kind='participation' and (rule.minimum_events is null or (select count(distinct event_id) from public.submissions where student_id=auth.uid() and state in ('zero','positive','completed'))<rule.minimum_events) then raise exception 'participation criteria unmet';end if;
 if p_kind<>'attendance' then p_event:=null;end if;
 insert into public.certificates(student_id,kind,event_id,public_name) values(auth.uid(),p_kind,p_event,profile.display_name) on conflict do nothing;
 select id into cid from public.certificates where student_id=auth.uid() and kind=p_kind and event_id is not distinct from p_event;return cid;
end; $$;
create function public.verify_certificate(p_verification uuid) returns table(kind text,public_name text,issued_at timestamptz,revoked boolean) language sql stable security definer set search_path='' as $$ select kind,public_name,issued_at,revoked_at is not null from public.certificates where verification_id=p_verification; $$;
create function public.revoke_certificate(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$ declare dep uuid;begin select p.department_id into dep from public.certificates c join public.profiles p on p.id=c.student_id where c.id=p_id;if not public.is_admin(dep) or length(p_reason)<5 then raise exception 'scoped authority and reason required';end if;perform set_config('utr.reason',p_reason,true);update public.certificates set revoked_at=now(),revocation_reason=p_reason where id=p_id;end; $$;
revoke all on function public.sync_points(uuid,uuid),public.revoke_activity_points(),public.leaderboard(uuid),public.issue_certificate(text,uuid),public.verify_certificate(uuid),public.revoke_certificate(uuid,text) from public,anon,authenticated;
grant execute on function public.sync_points(uuid,uuid),public.leaderboard(uuid),public.issue_certificate(text,uuid),public.revoke_certificate(uuid,text) to authenticated;
grant execute on function public.verify_certificate(uuid) to anon,authenticated;
commit;

