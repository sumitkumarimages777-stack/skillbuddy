-- SkillBuddy initial schema
-- Public site reads published content; admins (profiles.role = 'admin') manage everything.
-- Visitors can only INSERT leads / applications, never read them.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles & roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Site settings (single row)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  announcement_html text default 'From the team behind <strong>DUBuddy</strong> — trusted by 2 lakh+ students every year.',
  announcement_link_label text default 'Visit DUBuddy',
  announcement_link_url text default 'https://dubuddy.in/',
  admissions_badge text default 'Admissions open for upcoming cohorts',
  hero_title text default 'Learn job-ready skills in live cohorts, not recorded videos.',
  hero_highlight text default 'live cohorts',
  hero_subtitle text default 'Small-batch, mentor-led programs in Product, Design, Data, Marketing and AI. Learn live on weekends, build real projects, and get interview-ready while you''re still in college.',
  max_batch_size int,
  company_name text default 'Cyberflow Tech Private Limited',
  contact_email text,
  contact_phone text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Mentors
-- ---------------------------------------------------------------------------
create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  company text not null default '',
  track text not null default 'product' check (track in ('product', 'design', 'data', 'marketing', 'ai')),
  bio text not null default '',
  photo_url text,
  linkedin_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger mentors_updated_at before update on public.mentors
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Courses (cohort programs) and their child lists
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  short_title text not null default '',
  short_code text not null default '',
  category text not null default 'product' check (category in ('product', 'design', 'data', 'marketing', 'ai')),
  blurb text not null default '',
  description text not null default '',
  duration_weeks int,
  format text not null default 'Live online, weekends',
  mode text not null default 'Live · Weekends',
  effort text not null default '8–10 hrs / week',
  batch_size int,
  start_date date,
  applications_close date,
  price int,          -- in rupees
  emi_from int,       -- in rupees / month
  dubuddy_discount int check (dubuddy_discount between 0 and 100),
  seats_left int,
  outcomes text[] not null default '{}',
  syllabus_url text,
  lead_mentor_id uuid references public.mentors (id) on delete set null,
  guest_mentors_note text not null default '',
  featured boolean not null default false,  -- shows in "Upcoming cohorts"
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_published_idx on public.courses (published, sort_order);
create index courses_lead_mentor_idx on public.courses (lead_mentor_id);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null default 0,
  weeks_label text not null default '',
  title text not null,
  topics text not null default '',
  assignment text not null default ''
);
create index course_modules_course_idx on public.course_modules (course_id, position);

create table public.course_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null default 0,
  title text not null,
  description text not null default '',
  accent text not null default 'blue' check (accent in ('blue', 'yellow', 'green')),
  image_url text
);
create index course_projects_course_idx on public.course_projects (course_id, position);

create table public.course_batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null default 0,
  name text not null,
  schedule text not null default ''
);
create index course_batches_course_idx on public.course_batches (course_id, position);

create table public.course_week_plan (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null default 0,
  day_label text not null,
  activity text not null default '',
  detail text not null default ''
);
create index course_week_plan_course_idx on public.course_week_plan (course_id, position);

-- ---------------------------------------------------------------------------
-- Reviews & FAQs
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  learner_name text not null,
  college text not null default '',
  outcome_role text not null default '',
  outcome_company text not null default '',
  course_id uuid references public.courses (id) on delete set null,
  quote text not null,
  photo_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index reviews_course_idx on public.reviews (course_id);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inbound: call-back leads and cohort applications
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 7 and 20),
  source text not null default 'home' check (source in ('home', 'course')),
  course_id uuid references public.courses (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index leads_created_idx on public.leads (created_at desc);
create index leads_course_idx on public.leads (course_id);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  batch_id uuid references public.course_batches (id) on delete set null,
  batch_name text not null default '',
  full_name text not null check (char_length(full_name) between 1 and 120),
  college_year text not null default '' check (char_length(college_year) <= 200),
  phone text not null check (char_length(phone) between 7 and 20),
  status text not null default 'new' check (status in ('new', 'contacted', 'accepted', 'enrolled', 'rejected')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index applications_created_idx on public.applications (created_at desc);
create index applications_course_idx on public.applications (course_id);
create index applications_batch_idx on public.applications (batch_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.site_settings    enable row level security;
alter table public.mentors          enable row level security;
alter table public.courses          enable row level security;
alter table public.course_modules   enable row level security;
alter table public.course_projects  enable row level security;
alter table public.course_batches   enable row level security;
alter table public.course_week_plan enable row level security;
alter table public.reviews          enable row level security;
alter table public.faqs             enable row level security;
alter table public.leads            enable row level security;
alter table public.applications     enable row level security;

-- profiles: users see their own row, admins see and manage all
create policy "profiles: own row" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: admin update" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- site settings: world-readable, admin-writable
create policy "settings: read" on public.site_settings for select using (true);
create policy "settings: admin update" on public.site_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- published content: anyone reads published rows, admins do everything
create policy "mentors: read published" on public.mentors for select using (published or (select public.is_admin()));
create policy "mentors: admin write" on public.mentors for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "courses: read published" on public.courses for select using (published or (select public.is_admin()));
create policy "courses: admin write" on public.courses for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "modules: read" on public.course_modules for select using (
  exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin())))
);
create policy "modules: admin write" on public.course_modules for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "projects: read" on public.course_projects for select using (
  exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin())))
);
create policy "projects: admin write" on public.course_projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "batches: read" on public.course_batches for select using (
  exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin())))
);
create policy "batches: admin write" on public.course_batches for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "week plan: read" on public.course_week_plan for select using (
  exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin())))
);
create policy "week plan: admin write" on public.course_week_plan for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "reviews: read published" on public.reviews for select using (published or (select public.is_admin()));
create policy "reviews: admin write" on public.reviews for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "faqs: read published" on public.faqs for select using (published or (select public.is_admin()));
create policy "faqs: admin write" on public.faqs for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- leads/applications: anyone may submit a fresh row; only admins read or change them
create policy "leads: public insert" on public.leads for insert to anon, authenticated
  with check (status = 'new' and notes = '');
create policy "leads: admin read" on public.leads for select to authenticated using ((select public.is_admin()));
create policy "leads: admin update" on public.leads for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "leads: admin delete" on public.leads for delete to authenticated using ((select public.is_admin()));

create policy "applications: public insert" on public.applications for insert to anon, authenticated
  with check (status = 'new' and notes = '');
create policy "applications: admin read" on public.applications for select to authenticated using ((select public.is_admin()));
create policy "applications: admin update" on public.applications for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "applications: admin delete" on public.applications for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: public "media" bucket for mentor / review / project images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
