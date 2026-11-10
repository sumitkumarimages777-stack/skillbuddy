-- Covering indexes for the category foreign keys.
create index if not exists mentors_track_idx on public.mentors (track);
create index if not exists courses_category_idx on public.courses (category);
