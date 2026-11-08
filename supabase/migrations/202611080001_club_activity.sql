begin;

-- Legacy activity points have no approved values. Keep their ledger for history,
-- but derive the club table from verified activity and actual assessments.
revoke execute on function public.issue_certificate(text,uuid) from authenticated;
drop function public.leaderboard(uuid);

create function public.club_metric_totals(p_semester uuid)
returns table(student_id uuid, attended_events bigint, submitted_summaries bigint, club_credit numeric)
language sql stable security definer set search_path = '' as $$
  with semester_events as (
    select e.id from public.events e join public.semesters sem on sem.id = p_semester
    where e.status = 'published'
      and (e.starts_at at time zone 'Asia/Tehran')::date between sem.starts_on and sem.ends_on
  ), attended as (
    select a.student_id, count(*)::bigint as events
    from public.attendance a join semester_events e on e.id = a.event_id
    where a.confirmed group by a.student_id
  ), submitted as (
    select s.student_id, count(*)::bigint as summaries
    from public.submissions s join semester_events e on e.id = s.event_id
    where s.state not in ('draft','suspended','invalidated','administrative_review')
      and exists (select 1 from public.attendance a where a.event_id = s.event_id and a.student_id = s.student_id and a.confirmed)
    group by s.student_id
  ), scored as (
    select s.student_id, coalesce(sum(per_event.score),0)::numeric(10,2) as credit
    from public.submissions s join semester_events e on e.id = s.event_id
    join lateral (
      select max(a.score) as score from public.referrals r
      join public.assessments a on a.referral_id = r.id and a.outcome = 'score'
      where r.submission_id = s.id
    ) per_event on per_event.score is not null
    where s.state not in ('draft','suspended','invalidated','administrative_review')
      and exists (select 1 from public.attendance a where a.event_id = s.event_id and a.student_id = s.student_id and a.confirmed)
    group by s.student_id
  )
  select p.id, coalesce(a.events,0), coalesce(s.summaries,0), coalesce(c.credit,0)::numeric(10,2)
  from public.profiles p
  left join attended a on a.student_id = p.id
  left join submitted s on s.student_id = p.id
  left join scored c on c.student_id = p.id
  where p.membership = 'approved' and exists (
    select 1 from public.roles r where r.user_id = p.id and r.role = 'student' and r.approved
  );
$$;
revoke all on function public.club_metric_totals(uuid) from public, anon, authenticated;

create function public.my_club_metrics(p_semester uuid)
returns table(attended_events bigint, submitted_summaries bigint, club_credit numeric)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  return query select m.attended_events, m.submitted_summaries, m.club_credit
    from public.club_metric_totals(p_semester) m where m.student_id = auth.uid();
end;
$$;

create function public.leaderboard(p_semester uuid, p_metric text default 'attendance')
returns table(display_name text, attended_events bigint, submitted_summaries bigint, club_credit numeric, rank_position bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_metric not in ('attendance','summaries','credit') then raise exception 'invalid ranking measure'; end if;
  return query
    select p.display_name, m.attended_events, m.submitted_summaries, m.club_credit,
      dense_rank() over (order by
        case p_metric when 'attendance' then m.attended_events::numeric
          when 'summaries' then m.submitted_summaries::numeric
          else m.club_credit end desc)
    from public.club_metric_totals(p_semester) m
    join public.profiles p on p.id = m.student_id
    where p.leaderboard_consent
      and (m.attended_events > 0 or m.submitted_summaries > 0 or m.club_credit > 0)
    order by 5, p.display_name;
end;
$$;
revoke all on function public.my_club_metrics(uuid), public.leaderboard(uuid,text) from public, anon, authenticated;
grant execute on function public.my_club_metrics(uuid), public.leaderboard(uuid,text) to authenticated;

-- Certificates are administrative decisions, with a stated reason and an audit entry.
create function public.issue_certificate_for(p_student uuid, p_kind text, p_event uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare recipient public.profiles; existing public.certificates; cid uuid;
begin
  select * into recipient from public.profiles where id = p_student for share;
  if not found or recipient.membership <> 'approved' then raise exception 'approved member required'; end if;
  if not public.is_admin(recipient.department_id) then raise exception 'scoped academic authority required'; end if;
  if length(trim(coalesce(p_reason,''))) < 5 then raise exception 'decision reason required'; end if;
  if p_kind not in ('membership','attendance','participation') then raise exception 'invalid certificate kind'; end if;
  if p_kind = 'attendance' then
    if p_event is null or not exists (
      select 1 from public.attendance a join public.events e on e.id = a.event_id
      where a.student_id = p_student and a.event_id = p_event and a.confirmed and e.status = 'published'
    ) then raise exception 'confirmed attendance required'; end if;
  elsif p_event is not null then
    raise exception 'event only applies to attendance certificates';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_student::text || p_kind || coalesce(p_event::text,''),0));
  select * into existing from public.certificates
    where student_id = p_student and kind = p_kind and event_id is not distinct from p_event for update;
  if found then
    if existing.revoked_at is not null then raise exception 'revoked certificate requires administrative review'; end if;
    return existing.id;
  end if;
  perform set_config('utr.reason',p_reason,true);
  insert into public.certificates(student_id,kind,event_id,public_name)
    values(p_student,p_kind,p_event,recipient.display_name) returning id into cid;
  return cid;
end;
$$;
revoke all on function public.issue_certificate_for(uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.issue_certificate_for(uuid,text,uuid,text) to authenticated;

commit;
