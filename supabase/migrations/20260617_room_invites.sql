-- Truth/Dare demo invite tracking migration
-- Run in the existing demo Supabase project.

create table if not exists room_invites (
  id uuid primary key default gen_random_uuid(),
  room_code text references rooms(code) on delete cascade,
  token text unique not null,
  status text not null default 'pending',
  created_by uuid references players(id) on delete set null,
  used_by uuid references players(id) on delete set null,
  created_at timestamp default now(),
  used_at timestamp,
  canceled_at timestamp
);

alter table room_invites enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'room_invites'
      and policyname = 'public read room invites'
  ) then
    create policy "public read room invites" on room_invites for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'room_invites'
      and policyname = 'public write room invites'
  ) then
    create policy "public write room invites" on room_invites for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'room_invites'
      and policyname = 'public update room invites'
  ) then
    create policy "public update room invites" on room_invites for update using (true);
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table room_invites;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
