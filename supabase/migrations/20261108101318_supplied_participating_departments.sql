begin;
select set_config('utr.reason','Initialize the three participating groups explicitly supplied by the institution representative',true);
insert into public.departments(name) values
('گروه کامپیوتر دانشکده مهندسی'),
('گروه مدیریت دولتی دانشکده مدیریت و حسابداری'),
('گروه صنایع دانشکده مهندسی')
on conflict(name) do nothing;
commit;
