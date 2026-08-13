-- Afterparty V4 prompt history hardening.
-- Run in the existing demo Supabase project after the room/player tables exist.

alter table rooms
  add column if not exists content_schema_version text,
  add column if not exists party_id uuid default gen_random_uuid(),
  add column if not exists turn_counter integer not null default 0,
  add column if not exists session_started_at timestamptz,
  add column if not exists session_duration_minutes integer,
  add column if not exists current_prompt_id text;

create table if not exists prompt_history (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  party_id uuid not null,
  content_schema_version text not null,
  game_mode text not null,
  category text not null,
  prompt_type text not null,
  prompt_id text not null,
  player_id uuid references players(id) on delete set null,
  turn_counter integer not null default 0,
  created_at timestamptz not null default now(),
  unique (party_id, prompt_id)
);

alter table prompt_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prompt_history'
      and policyname = 'public read prompt history'
  ) then
    create policy "public read prompt history" on prompt_history for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prompt_history'
      and policyname = 'public write prompt history'
  ) then
    create policy "public write prompt history" on prompt_history for insert with check (true);
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table prompt_history;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
