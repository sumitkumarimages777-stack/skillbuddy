-- Which part of a mentor's photo shows in the cropped card: 0 = top, 50 = centre, 100 = bottom.
alter table public.mentors
  add column photo_position_y smallint not null default 50
  check (photo_position_y between 0 and 100);
