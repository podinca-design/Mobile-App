-- Add host-visible invite labels without exposing invite links in the pending list.

alter table room_invites
  add column if not exists invitee_name text;
