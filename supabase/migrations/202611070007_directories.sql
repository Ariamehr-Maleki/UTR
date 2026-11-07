begin;
create function public.student_offerings() returns table(offering_id uuid,title text,instructor_name text,instructor_id uuid,semester_id uuid) language sql stable security definer set search_path='' as $$ select o.id,o.title,p.display_name,o.instructor_id,o.semester_id from public.enrollments e join public.offerings o on o.id=e.offering_id join public.profiles p on p.id=o.instructor_id join public.semesters sem on sem.id=o.semester_id where e.student_id=auth.uid() and e.approved and o.approved and p.membership='approved' and (now() at time zone 'Asia/Tehran')::date between sem.starts_on and sem.ends_on; $$;
revoke all on function public.student_offerings() from public,anon;
grant execute on function public.student_offerings() to authenticated;
commit;
