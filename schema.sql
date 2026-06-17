-- ============================================================
-- Truth or Dare / Questions party game — Supabase schema (v3)
-- Adds: game_mode support ('truth_dare' | 'questions')
-- Run this in Supabase SQL Editor on a fresh project.
-- If re-running on an existing project, drop old tables first:
--   drop table if exists players cascade;
--   drop table if exists rooms cascade;
-- ============================================================

create table rooms (
  code text primary key,
  game_mode text not null default 'truth_dare',   -- 'truth_dare' or 'questions'
  category text default 'mild',                    -- mild | bold | couples
  current_player_index int default 0,
  current_prompt text,
  current_type text,                                -- 'truth' | 'dare' | 'question' | null
  status text default 'lobby',                      -- 'lobby' | 'playing'
  created_at timestamp default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  room_code text references rooms(code) on delete cascade,
  name text not null,
  join_order int not null,
  created_at timestamp default now()
);

create table room_invites (
  id uuid primary key default gen_random_uuid(),
  room_code text references rooms(code) on delete cascade,
  token text unique not null,
  status text not null default 'pending',          -- pending | used | canceled
  created_by uuid references players(id) on delete set null,
  used_by uuid references players(id) on delete set null,
  created_at timestamp default now(),
  used_at timestamp,
  canceled_at timestamp
);

alter table rooms enable row level security;
alter table players enable row level security;
alter table room_invites enable row level security;

create policy "public read rooms" on rooms for select using (true);
create policy "public write rooms" on rooms for insert with check (true);
create policy "public update rooms" on rooms for update using (true);

create policy "public read players" on players for select using (true);
create policy "public write players" on players for insert with check (true);
create policy "public update players" on players for update using (true);
create policy "public delete players" on players for delete using (true);

create policy "public read room invites" on room_invites for select using (true);
create policy "public write room invites" on room_invites for insert with check (true);
create policy "public update room invites" on room_invites for update using (true);

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table room_invites;
