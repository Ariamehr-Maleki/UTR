begin;

alter table public.profiles
  add column requested_role text not null default 'student'
  check (requested_role in ('student', 'instructor'));

update public.profiles p set requested_role = 'instructor'
where exists (
  select 1 from public.roles r
  where r.user_id = p.id and r.role = 'instructor' and r.approved
);

create or replace function public.on_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare requested text;
begin
  requested := case when new.raw_user_meta_data->>'requested_role' = 'instructor'
    then 'instructor' else 'student' end;
  insert into public.profiles(id, requested_role) values (new.id, requested);
  insert into public.roles(user_id, role, approved) values (new.id, 'student', false);
  return new;
end;
$$;

-- A pending academic profile must not disable a separately approved staff role.
-- Suspended and inactive membership still blocks all roles.
create or replace function public.has_role(wanted public.app_role, scope uuid default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.roles r join public.profiles p on p.id = r.user_id
    where r.user_id = auth.uid() and r.role = wanted and r.approved
      and (p.membership = 'approved' or (p.membership = 'pending' and wanted <> 'student'))
      and (r.department_id is null or r.department_id = scope)
  );
$$;

create or replace function public.can_read_submission(sid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.submissions s
    join public.events e on e.id = s.event_id
    join public.profiles p on p.id = auth.uid()
    where s.id = sid and p.membership in ('approved', 'pending')
      and (
        (s.student_id = auth.uid() and p.membership = 'approved')
        or public.is_admin(e.department_id)
        or exists (
          select 1 from public.referrals r join public.offerings o on o.id = r.offering_id
          where r.submission_id = s.id and r.instructor_id = auth.uid()
            and o.approved and public.has_role('instructor', o.department_id)
        )
      )
  );
$$;

create or replace function public.can_read_attachment(aid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.attachments a
    join public.submissions s on s.id = a.submission_id
    join public.events e on e.id = s.event_id
    join public.profiles p on p.id = auth.uid()
    where a.id = aid and p.membership in ('approved', 'pending')
      and (
        (s.student_id = auth.uid() and p.membership = 'approved')
        or public.is_admin(e.department_id)
        or exists (
          select 1 from public.referrals r join public.offerings o on o.id = r.offering_id
          where r.submission_id = s.id and r.instructor_id = auth.uid()
            and (r.attachment_id = a.id or exists (
              select 1 from public.assessments aa
              where aa.referral_id = r.id and aa.attachment_id = a.id
            ))
            and o.approved and public.has_role('instructor', o.department_id)
        )
      )
  );
$$;

create function public.admin_user_directory(
  p_status text default 'pending',
  p_role text default 'all',
  p_search text default '',
  p_limit integer default 20,
  p_offset integer default 0,
  p_user uuid default null
)
returns table (
  total_count bigint, pending_count bigint, approved_count bigint,
  id uuid, email text, display_name text, student_number text, degree text,
  department_id uuid, department_name text, membership text, requested_role text,
  role_approved boolean, created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.roles ar join public.profiles ap on ap.id = ar.user_id
    where ar.user_id = auth.uid() and ar.role in ('admin', 'superadmin')
      and ar.approved and ap.membership in ('approved', 'pending')
  ) then
    raise exception 'administration required';
  end if;
  if p_status not in ('pending', 'approved') or p_role not in ('all', 'student', 'instructor')
    or p_limit not between 1 and 50 or p_offset < 0 or length(p_search) > 120 then
    raise exception 'invalid directory query';
  end if;
  return query
  with visible as (
    select p.id, u.email::text, p.display_name, p.student_number, p.degree,
      p.department_id, d.name as department_name, p.membership::text,
      case when p.requested_role = 'instructor' or exists (
        select 1 from public.roles rr where rr.user_id = p.id and rr.role = 'instructor' and rr.approved
      ) then 'instructor' else 'student' end as requested_role,
      p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.departments d on d.id = p.department_id
    where (public.has_role('superadmin') or public.is_admin(p.department_id))
      and exists (
        select 1 from public.roles identity_role
        where identity_role.user_id = p.id
          and identity_role.role in ('student', 'instructor')
      )
      and not (
        exists (
          select 1 from public.roles staff_role
          where staff_role.user_id = p.id and staff_role.approved
            and staff_role.role in ('admin', 'superadmin')
        )
        and not exists (
          select 1 from public.roles academic_role
          where academic_role.user_id = p.id and academic_role.approved
            and academic_role.role in ('student', 'instructor')
        )
      )
      and (p_user is null or p.id = p_user)
      and (p_search = '' or p.display_name ilike '%' || p_search || '%'
        or coalesce(p.student_number, '') ilike '%' || p_search || '%'
        or coalesce(u.email, '') ilike '%' || p_search || '%')
  ), candidates as (
    select v.*,
      exists (
        select 1 from public.roles r
        where r.user_id = v.id and r.role::text = v.requested_role and r.approved
      ) as role_approved
    from visible v
    where p_role = 'all' or v.requested_role = p_role
  ), classified as (
    select c.*,
      (c.membership = 'approved' and c.role_approved) as fully_approved
    from candidates c
  ), stats as (
    select count(*) filter (where not c.fully_approved and c.membership not in ('suspended', 'inactive')) as pending_count,
      count(*) filter (where c.fully_approved) as approved_count
    from classified c
  ), page as (
    select c.* from classified c
    where (p_status = 'pending' and not c.fully_approved and c.membership not in ('suspended', 'inactive'))
      or (p_status = 'approved' and c.fully_approved)
    order by c.created_at desc, c.id
    limit p_limit offset p_offset
  )
  select case when p_status = 'pending' then s.pending_count else s.approved_count end,
    s.pending_count, s.approved_count,
    page.id, page.email, page.display_name, page.student_number, page.degree,
    page.department_id, page.department_name, page.membership, page.requested_role,
    page.role_approved, page.created_at
  from stats s left join page on true;
end;
$$;

create function public.review_user(p_user uuid, p_role text, p_reason text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare member public.profiles; already_approved boolean;
begin
  if auth.uid() is null or p_role not in ('student', 'instructor')
    or length(trim(p_reason)) < 5 or length(p_reason) > 2000 then
    raise exception 'invalid review';
  end if;
  select * into member from public.profiles where id = p_user for update;
  if not found or not public.is_admin(member.department_id) then
    raise exception 'scoped academic authority required';
  end if;
  if member.membership in ('suspended', 'inactive') then
    raise exception 'membership is not reviewable';
  end if;
  if length(trim(member.display_name)) < 2 or member.department_id is null then
    raise exception 'name and department required';
  end if;
  if p_role = 'student' and (nullif(trim(member.student_number), '') is null or member.degree is null) then
    raise exception 'student number and degree required';
  end if;
  if p_role = 'instructor' and member.requested_role <> 'instructor' and not exists (
    select 1 from public.roles where user_id = p_user and role = 'instructor'
  ) then
    raise exception 'instructor request required';
  end if;
  select exists (
    select 1 from public.roles where user_id = p_user and role::text = p_role and approved
  ) and member.membership = 'approved' into already_approved;
  if already_approved then return false; end if;
  perform set_config('utr.reason', p_reason, true);
  update public.profiles set membership = 'approved' where id = p_user and membership <> 'approved';
  if p_role = 'student' then
    insert into public.roles(user_id, role, approved) values (p_user, 'student', true)
      on conflict (user_id, role, department_id) do update set approved = true;
  else
    insert into public.roles(user_id, role, department_id, approved)
      values (p_user, 'instructor', member.department_id, true)
      on conflict (user_id, role, department_id) do update set approved = true;
    if member.student_number is null or member.degree is null then
      update public.roles set approved = false where user_id = p_user and role = 'student';
    end if;
  end if;
  return true;
end;
$$;

revoke all on function public.admin_user_directory(text,text,text,integer,integer,uuid),
  public.review_user(uuid,text,text) from public, anon;
grant execute on function public.admin_user_directory(text,text,text,integer,integer,uuid),
  public.review_user(uuid,text,text) to authenticated;

commit;
