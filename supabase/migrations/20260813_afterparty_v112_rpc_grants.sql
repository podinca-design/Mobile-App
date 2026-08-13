-- Afterparty 1.1.2: remove unnecessary anon/raw public execute grants
-- from SECURITY DEFINER helper RPCs while preserving authenticated app flow.

revoke all on function afterparty_room_for_join(text) from public;
revoke all on function afterparty_room_for_join(text) from anon;
revoke all on function afterparty_invite_for_join(text, text) from public;
revoke all on function afterparty_invite_for_join(text, text) from anon;

grant execute on function afterparty_room_for_join(text) to authenticated;
grant execute on function afterparty_invite_for_join(text, text) to authenticated;
