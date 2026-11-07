begin;
create function public.admin_action(p_action text,p_data jsonb,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid:=coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid());scope uuid;old_scope uuid;sid uuid;ev public.events;sub public.submissions;
begin
 if auth.uid() is null or length(trim(p_reason))<5 then raise exception 'reason required';end if;
 perform set_config('utr.reason',p_reason,true);
 if p_action in ('role','department') then
  if not public.has_role('superadmin') then raise exception 'superadmin required';end if;
 else
  scope:=nullif(p_data->>'department_id','')::uuid;
  if p_action in ('attendance','relevance','event') and p_data->>'event_id' is not null then select department_id into scope from public.events where id=(p_data->>'event_id')::uuid;end if;
  if p_action in ('membership','enrollment','certificate') then select department_id into scope from public.profiles where id=(p_data->>'user_id')::uuid;end if;
  if p_action='appeal' then select p.department_id into scope from public.appeals a join public.profiles p on p.id=a.student_id where a.id=target;end if;
  if p_action='correction' then select * into sub from public.submissions where id=target for update;select department_id into scope from public.events where id=sub.event_id;end if;
  if not public.is_admin(scope) then raise exception 'scoped academic authority required';end if;
 end if;
 case p_action
 when 'role' then
  insert into public.roles(user_id,role,department_id,approved) values((p_data->>'user_id')::uuid,(p_data->>'role')::public.app_role,nullif(p_data->>'department_id','')::uuid,(p_data->>'approved')::boolean) on conflict(user_id,role,department_id) do update set approved=excluded.approved returning id into target;
 when 'department' then insert into public.departments(id,name) values(target,p_data->>'name') on conflict(id) do update set name=excluded.name;
 when 'policy' then
  -- Policies are immutable versions. Changes never rewrite submitted policy snapshots.
  insert into public.policies(id,name,approved,revision_hours,referral_hours,max_alternatives,unlimited_alternatives,review_hours,attendance_exceptions,points_enabled,certificates_enabled) values(target,p_data->>'name',coalesce((p_data->>'approved')::boolean,false),nullif(p_data->>'revision_hours','')::integer,nullif(p_data->>'referral_hours','')::integer,nullif(p_data->>'max_alternatives','')::integer,coalesce((p_data->>'unlimited_alternatives')::boolean,false),nullif(p_data->>'review_hours','')::integer,coalesce((p_data->>'attendance_exceptions')::boolean,false),coalesce((p_data->>'points_enabled')::boolean,false),coalesce((p_data->>'certificates_enabled')::boolean,false));
 when 'instructor' then
  insert into public.roles(user_id,role,department_id,approved) values((p_data->>'user_id')::uuid,'instructor',scope,(p_data->>'approved')::boolean) on conflict(user_id,role,department_id) do update set approved=excluded.approved;
 when 'membership' then
  if p_data->>'membership'='approved' and not exists(select 1 from public.profiles p where p.id=(p_data->>'user_id')::uuid and length(p.display_name)>1 and ((p.student_number is not null and p.student_number<>'' and p.degree is not null and p.department_id is not null) or exists(select 1 from public.roles r where r.user_id=p.id and r.role<>'student' and r.approved))) then raise exception 'complete verified academic profile or approved staff role required';end if;
  update public.profiles set membership=(p_data->>'membership')::public.membership_state where id=(p_data->>'user_id')::uuid;
  update public.roles set approved=exists(select 1 from public.profiles p where p.id=user_id and p.membership='approved' and p.student_number is not null and p.student_number<>'' and p.degree is not null and p.department_id is not null) where user_id=(p_data->>'user_id')::uuid and role='student';
 when 'semester' then insert into public.semesters(id,title,starts_on,ends_on) values(target,p_data->>'title',(p_data->>'starts_on')::date,(p_data->>'ends_on')::date);
 when 'offering' then
  select department_id into old_scope from public.offerings where id=target;
  if found and not public.is_admin(old_scope) then raise exception 'scope change forbidden';end if;
  insert into public.offerings(id,title,department_id,semester_id,instructor_id,approved) values(target,p_data->>'title',scope,(p_data->>'semester_id')::uuid,(p_data->>'instructor_id')::uuid,coalesce((p_data->>'approved')::boolean,false)) on conflict(id) do update set title=excluded.title,approved=excluded.approved;
 when 'enrollment' then
  if not exists(select 1 from public.offerings where id=(p_data->>'offering_id')::uuid and public.is_admin(department_id)) then raise exception 'offering scope forbidden';end if;
  insert into public.enrollments(student_id,offering_id,approved) values((p_data->>'user_id')::uuid,(p_data->>'offering_id')::uuid,(p_data->>'approved')::boolean) on conflict(student_id,offering_id) do update set approved=excluded.approved;
 when 'event' then
  select * into ev from public.events where id=target for update;
  if found and not public.is_admin(ev.department_id) then raise exception 'scope change forbidden';end if;
  if p_data->>'status'='published' and coalesce((p_data->>'club_approved')::boolean,false) and (not exists(select 1 from public.policies where id=(p_data->>'policy_id')::uuid and approved) or not exists(select 1 from public.forms where id=(p_data->>'form_id')::uuid and approved) or p_data->>'summary_deadline' is null) then raise exception 'approved policy, form and explicit deadline required';end if;
  insert into public.events(id,title,description,speaker,organizer,starts_at,ends_at,venue,online_url,capacity,registration_opens,registration_closes,club_approved,summary_deadline,form_id,policy_id,department_id,responsible_id,status) values(target,p_data->>'title',coalesce(p_data->>'description',''),p_data->>'speaker',p_data->>'organizer',(p_data->>'starts_at')::timestamptz,(p_data->>'ends_at')::timestamptz,p_data->>'venue',p_data->>'online_url',nullif(p_data->>'capacity','')::integer,nullif(p_data->>'registration_opens','')::timestamptz,nullif(p_data->>'registration_closes','')::timestamptz,coalesce((p_data->>'club_approved')::boolean,false),nullif(p_data->>'summary_deadline','')::timestamptz,nullif(p_data->>'form_id','')::uuid,nullif(p_data->>'policy_id','')::uuid,scope,auth.uid(),coalesce(p_data->>'status','draft')) on conflict(id) do update set title=excluded.title,description=excluded.description,speaker=excluded.speaker,organizer=excluded.organizer,starts_at=excluded.starts_at,ends_at=excluded.ends_at,venue=excluded.venue,online_url=excluded.online_url,capacity=excluded.capacity,registration_opens=excluded.registration_opens,registration_closes=excluded.registration_closes,club_approved=excluded.club_approved,summary_deadline=excluded.summary_deadline,form_id=excluded.form_id,policy_id=excluded.policy_id,status=excluded.status;
  if p_data->>'status'='cancelled' then update public.submissions set state='administrative_review' where event_id=target and state not in ('completed','invalidated');end if;
 when 'relevance' then insert into public.event_offerings(event_id,offering_id) values((p_data->>'event_id')::uuid,(p_data->>'offering_id')::uuid) on conflict do nothing;
 when 'attendance' then
  insert into public.attendance(event_id,student_id,confirmed,reason,recorded_by) values((p_data->>'event_id')::uuid,(p_data->>'user_id')::uuid,(p_data->>'confirmed')::boolean,p_reason,auth.uid()) on conflict(event_id,student_id) do update set confirmed=excluded.confirmed,reason=excluded.reason,recorded_by=excluded.recorded_by,updated_at=now();
  if not (p_data->>'confirmed')::boolean then update public.submissions set state='administrative_review' where event_id=(p_data->>'event_id')::uuid and student_id=(p_data->>'user_id')::uuid;end if;
 when 'content' then
  select department_id into old_scope from public.content where id=target;
  if found and not public.is_admin(old_scope) then raise exception 'scope change forbidden';end if;
  insert into public.content(id,kind,title,description,external_url,status,department_id) values(target,p_data->>'kind',p_data->>'title',p_data->>'description',nullif(p_data->>'external_url',''),coalesce(p_data->>'status','draft'),scope) on conflict(id) do update set kind=excluded.kind,title=excluded.title,description=excluded.description,external_url=excluded.external_url,status=excluded.status;
 when 'form' then insert into public.forms(id,version,title,object_path,approved) values(target,p_data->>'version',p_data->>'title',p_data->>'object_path',coalesce((p_data->>'approved')::boolean,false));
 when 'appeal' then update public.appeals set status=p_data->>'status',resolution=p_data->>'resolution' where id=target;
 when 'correction' then
  if p_data->>'state' not in ('invalidated','suspended','administrative_review','completed') then raise exception 'correction cannot unlock referral';end if;
  update public.submissions set state=(p_data->>'state')::public.submission_state where id=target;
  update public.referrals set active=false,closed_at=now() where submission_id=target and active;
  -- Positive lock and original scores remain immutable historical evidence.
 when 'points_rule' then insert into public.points_rules(id,activity,points,approved) values(target,p_data->>'activity',(p_data->>'points')::integer,coalesce((p_data->>'approved')::boolean,false));
 when 'badge' then insert into public.badges(id,title,minimum_points,approved) values(target,p_data->>'title',(p_data->>'minimum_points')::integer,coalesce((p_data->>'approved')::boolean,false));
 when 'certificate' then raise exception 'certificate eligibility policy must be configured before issuance';
 else raise exception 'unsupported action';
 end case;
 return target;
end; $$;
create function public.open_appeal(p_submission uuid,p_subject text,p_body text) returns uuid language plpgsql security definer set search_path='' as $$ declare aid uuid;begin if auth.uid() is null or length(p_subject)<3 or length(p_subject)>200 or length(p_body)<10 or length(p_body)>10000 then raise exception 'invalid appeal';end if;if p_submission is not null and not exists(select 1 from public.submissions where id=p_submission and student_id=auth.uid()) then raise exception 'not owner';end if;insert into public.appeals(student_id,submission_id,subject,body) values(auth.uid(),p_submission,p_subject,p_body) returning id into aid;return aid;end; $$;
create function public.read_notification(p_id uuid) returns void language sql security definer set search_path='' as $$ update public.notifications set read_at=now() where id=p_id and user_id=auth.uid(); $$;
-- Only the trusted server-side scanner can mark a stored file clean.
create function public.finalize_attachment(p_id uuid,p_hash text,p_clean boolean) returns void language plpgsql security definer set search_path='' as $$ begin update public.attachments set safety=case when p_clean then 'clean' else 'rejected' end where id=p_id and sha256=p_hash and safety='pending';end; $$;
revoke all on function public.finalize_attachment(uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.finalize_attachment(uuid,text,boolean) to service_role;
revoke all on function public.admin_action(text,jsonb,text),public.open_appeal(uuid,text,text),public.read_notification(uuid) from public,anon;
grant execute on function public.admin_action(text,jsonb,text),public.open_appeal(uuid,text,text),public.read_notification(uuid) to authenticated;
commit;


