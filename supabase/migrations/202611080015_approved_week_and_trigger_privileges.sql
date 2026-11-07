begin;
-- User approved this weekly boundary explicitly on 2026-11-08 (Asia/Tehran).
-- Unresolved revision/referral, engagement and certificate rules stay disabled.
select set_config('utr.reason','User confirmed Saturday-Friday 23:59:59 Asia/Tehran weekly deadline',true);
insert into public.policies(name,approved,week_start_dow,week_cutoff,timezone)
select 'UTR weekly deadline v1',true,6,'23:59:59'::time,'Asia/Tehran'
where not exists(select 1 from public.policies where name='UTR weekly deadline v1');
-- Trigger entry points are internal, not callable application RPC endpoints.
revoke execute on function public.check_maintenance(),public.guard_event_deadline() from authenticated;
commit;
