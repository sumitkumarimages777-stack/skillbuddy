-- Categories (tracks) become admin-managed instead of a hard-coded list.
create table public.categories (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text not null check (char_length(label) between 1 and 60),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

insert into public.categories (id, label, sort_order) values
  ('product', 'Product', 1),
  ('design', 'Design', 2),
  ('data', 'Data', 3),
  ('marketing', 'Marketing', 4),
  ('ai', 'AI', 5)
on conflict (id) do nothing;

-- Replace the fixed check constraints with foreign keys. A category that is
-- still used by a mentor or course can't be deleted.
alter table public.mentors drop constraint if exists mentors_track_check;
alter table public.courses drop constraint if exists courses_category_check;
alter table public.mentors
  add constraint mentors_track_fkey foreign key (track) references public.categories (id) on update cascade on delete restrict;
alter table public.courses
  add constraint courses_category_fkey foreign key (category) references public.categories (id) on update cascade on delete restrict;

alter table public.categories enable row level security;
create policy "categories: read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
