begin;
-- Read-only role predicates are safe for anonymous public-content policies.
grant execute on function public.has_role(public.app_role,uuid),public.is_admin(uuid) to anon;
alter table public.events add column publicly_listed boolean not null default false;
update public.events set publicly_listed=true where status='published';
alter table public.events add constraint online_url_https check(online_url is null or online_url ~ '^https://');
create function public.record_event_publication() returns trigger language plpgsql set search_path='' as $$ begin if new.status='published' then new.publicly_listed:=true;elsif tg_op='UPDATE' then new.publicly_listed:=old.publicly_listed;end if;return new;end; $$;
create trigger record_publication before insert or update on public.events for each row execute function public.record_event_publication();
drop policy events_read on public.events;
create policy events_read on public.events for select using(status='published' or (status='cancelled' and publicly_listed) or public.is_admin(department_id));
revoke all on function public.record_event_publication() from public,anon,authenticated;
commit;
