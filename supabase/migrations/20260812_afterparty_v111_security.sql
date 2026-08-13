-- Afterparty 1.1.1 authoritative identity, lifecycle, team, Tiptoe, and RLS hardening.

alter table rooms
  add column if not exists owner_user_id uuid,
  add column if not exists current_player_id uuid,
  add column if not exists active_team_id text,
  add column if not exists active_pair_id text,
  add column if not exists round_number integer not null default 1,
  add column if not exists pair_mode boolean not null default false,
  add column if not exists state_version bigint not null default 1;

alter table players
  add column if not exists user_id uuid,
  add column if not exists pair_id text;

create unique index if not exists players_room_client_session_unique
  on players(room_code, client_session_id) where client_session_id is not null;

create table if not exists tiptoe_rounds (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  round_number integer not null,
  team_id text not null,
  clue_giver_id uuid not null references players(id),
  guesser_id uuid not null references players(id),
  started_at timestamptz,
  deadline_at timestamptz,
  paused_at timestamptz,
  paused_remaining_ms integer,
  ended_at timestamptz,
  round_score integer not null default 0,
  state_version bigint not null default 1,
  unique(room_code, round_number),
  check (clue_giver_id <> guesser_id)
);

create table if not exists tiptoe_card_events (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  round_id uuid not null references tiptoe_rounds(id) on delete cascade,
  card_id text not null,
  target_normalized text not null,
  outcome text not null check (outcome in ('correct','pass','forbidden','expired')),
  points integer not null,
  action_nonce text not null,
  created_at timestamptz not null default now(),
  unique(round_id, card_id),
  unique(round_id, action_nonce)
);

alter table rooms enable row level security;
alter table players enable row level security;
alter table room_invites enable row level security;
alter table prompt_history enable row level security;
alter table tiptoe_rounds enable row level security;
alter table tiptoe_card_events enable row level security;

create or replace function afterparty_is_room_member(p_room_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from players where room_code = p_room_code and user_id = auth.uid());
$$;

create or replace function afterparty_is_room_host(p_room_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from rooms r join players p on p.id = r.host_player_id
    where r.code = p_room_code and (r.owner_user_id = auth.uid() or p.user_id = auth.uid())
  );
$$;

create or replace function afterparty_room_for_join(p_code text)
returns setof rooms language sql stable security definer set search_path = public as $$
  select * from rooms where code = upper(trim(p_code)) limit 1;
$$;

create or replace function afterparty_invite_for_join(p_room_code text, p_token text)
returns setof room_invites language sql stable security definer set search_path = public as $$
  select * from room_invites where room_code = upper(trim(p_room_code)) and token = p_token limit 1;
$$;

revoke all on function afterparty_room_for_join(text) from public;
revoke all on function afterparty_invite_for_join(text, text) from public;
grant execute on function afterparty_room_for_join(text) to authenticated;
grant execute on function afterparty_invite_for_join(text, text) to authenticated;

drop policy if exists "public read rooms" on rooms;
drop policy if exists "public write rooms" on rooms;
drop policy if exists "public update rooms" on rooms;
drop policy if exists "public read players" on players;
drop policy if exists "public write players" on players;
drop policy if exists "public update players" on players;
drop policy if exists "public delete players" on players;
drop policy if exists "public read room invites" on room_invites;
drop policy if exists "public write room invites" on room_invites;
drop policy if exists "public update room invites" on room_invites;
drop policy if exists "public read prompt history" on prompt_history;
drop policy if exists "public write prompt history" on prompt_history;
drop policy if exists truth_dare_public_delete_players on players;
drop policy if exists truth_dare_public_insert_players on players;
drop policy if exists truth_dare_public_read_players on players;
drop policy if exists truth_dare_public_update_players on players;
drop policy if exists truth_dare_public_insert_rooms on rooms;
drop policy if exists truth_dare_public_read_rooms on rooms;
drop policy if exists truth_dare_public_update_rooms on rooms;
drop policy if exists rooms_authenticated_read on rooms;
drop policy if exists rooms_owner_insert on rooms;
drop policy if exists rooms_host_update on rooms;
drop policy if exists players_room_read on players;
drop policy if exists players_self_insert on players;
drop policy if exists players_self_or_host_update on players;
drop policy if exists players_host_remove on players;
drop policy if exists invites_member_read on room_invites;
drop policy if exists invites_host_insert on room_invites;
drop policy if exists invites_host_update on room_invites;
drop policy if exists prompt_history_member_read on prompt_history;
drop policy if exists prompt_history_member_insert on prompt_history;
drop policy if exists prompt_history_host_delete on prompt_history;
drop policy if exists tiptoe_round_member_read on tiptoe_rounds;
drop policy if exists tiptoe_round_host_write on tiptoe_rounds;
drop policy if exists tiptoe_event_member_read on tiptoe_card_events;
drop policy if exists tiptoe_event_host_write on tiptoe_card_events;

create policy rooms_authenticated_read on rooms for select to authenticated using (
  owner_user_id = auth.uid() or afterparty_is_room_member(code)
);
create policy rooms_owner_insert on rooms for insert to authenticated with check (owner_user_id = auth.uid());
create policy rooms_host_update on rooms for update to authenticated using (
  owner_user_id = auth.uid() or exists (
    select 1 from players p where p.id = rooms.host_player_id and p.user_id = auth.uid() and p.lifecycle_status = 'active'
  )
) with check (owner_user_id = auth.uid() or exists (
  select 1 from players p where p.id = rooms.host_player_id and p.user_id = auth.uid() and p.lifecycle_status = 'active'
));

create policy players_room_read on players for select to authenticated using (
  user_id = auth.uid() or afterparty_is_room_member(room_code)
);
create policy players_self_insert on players for insert to authenticated with check (user_id = auth.uid());
create policy players_self_or_host_update on players for update to authenticated using (
  user_id = auth.uid() or afterparty_is_room_host(room_code)
);
create policy players_host_remove on players for delete to authenticated using (
  user_id = auth.uid() or afterparty_is_room_host(room_code)
);

create policy invites_member_read on room_invites for select to authenticated using (
  afterparty_is_room_member(room_code)
);
create policy invites_host_insert on room_invites for insert to authenticated with check (
  afterparty_is_room_host(room_code)
);
create policy invites_host_update on room_invites for update to authenticated using (
  afterparty_is_room_host(room_code)
  or exists (select 1 from players p where p.id = room_invites.used_by and p.user_id = auth.uid())
);

create policy prompt_history_member_read on prompt_history for select to authenticated using (
  afterparty_is_room_member(room_code)
);
create policy prompt_history_member_insert on prompt_history for insert to authenticated with check (
  afterparty_is_room_member(room_code)
);
create policy prompt_history_host_delete on prompt_history for delete to authenticated using (
  afterparty_is_room_host(room_code)
);

create policy tiptoe_round_member_read on tiptoe_rounds for select to authenticated using (
  afterparty_is_room_member(room_code)
);
create policy tiptoe_round_host_write on tiptoe_rounds for all to authenticated using (
  afterparty_is_room_host(room_code)
) with check (
  afterparty_is_room_host(room_code)
);
create policy tiptoe_event_member_read on tiptoe_card_events for select to authenticated using (
  afterparty_is_room_member(room_code)
);
create policy tiptoe_event_host_write on tiptoe_card_events for insert to authenticated with check (
  afterparty_is_room_host(room_code)
);
