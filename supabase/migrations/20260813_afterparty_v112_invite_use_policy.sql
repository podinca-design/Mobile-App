-- Afterparty 1.1.2: allow an invited authenticated room member to
-- consume a pending invite for their own player record.

drop policy if exists invites_host_update on room_invites;
drop policy if exists invites_member_use on room_invites;

create policy invites_host_update on room_invites for update to authenticated using (
  afterparty_is_room_host(room_code)
) with check (
  afterparty_is_room_host(room_code)
);

create policy invites_member_use on room_invites for update to authenticated using (
  status = 'pending' and afterparty_is_room_member(room_code)
) with check (
  status = 'used'
  and exists (
    select 1
    from players p
    where p.id = room_invites.used_by
      and p.room_code = room_invites.room_code
      and p.user_id = auth.uid()
  )
);
