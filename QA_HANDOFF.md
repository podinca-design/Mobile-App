# QA & Hardening Handoff — Truth/Dare Party App

You're picking up QA and stabilization on a multiplayer Truth-or-Dare /
Questions party game. It's a Vite + React app using Supabase (Postgres +
Realtime) for shared game state. No native iOS/Android — it's a mobile web
app meant to be opened in a phone browser and optionally "Add to Home
Screen."

## Where things stand

The app is functionally complete (room creation, join by code, lobby with
live player list, turn rotation, two game modes) but has only been verified
by static review and a local JSX build check (no `npm install` was possible
in the environment it was built in — no network access). **It has never
actually been run in a browser or on a real device.** Treat it as untested
in the literal sense.

## Config / credentials

- Supabase URL and anon key are provided through `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY`. Point this branch at the existing demo Supabase
  project, not a new project and not production. The anon key is meant to be
  public and is governed by the RLS policies in `schema.sql`, not secrecy.
  Don't add the service-role key anywhere in this repo; it's never needed for
  this app.
- The schema (`schema.sql`) should be verified against the existing demo
  project. Don't re-run it blindly — check current table structure first
  (`select * from rooms limit 1;` in the SQL editor) since it may have
  drifted from the file if manual tweaks were made.

## Already fixed (don't re-litigate unless you find it's incomplete)

- Keyboard focus visibility (`:focus-visible` ring), reduced-motion support,
  pinch-zoom re-enabled, WCAG AA contrast on muted text, labeled form
  inputs, `aria-live` on the prompt card and turn indicator, `aria-pressed`
  on toggle buttons.
- A specific race condition: rapid double-tapping "Truth/Dare/Done" could
  previously fire two writes before state caught up, potentially skipping a
  player's turn or double-drawing a prompt. Fixed via a client-side
  in-flight guard (`actionInFlight` state in `App.jsx`) plus conditional
  Supabase updates (`.is("current_prompt", null)` / `.eq("current_player_index", expectedIndex)`)
  so a stale write becomes a no-op instead of corrupting turn order. Verify
  this actually holds under real concurrent taps from two physical devices,
  not just code review — that's exactly the kind of thing that looks fixed
  on paper and isn't.

## Known open issues — please address or explicitly triage

1. **No host failover / room cleanup.** If the host (player at
   `join_order: 0`) closes the tab or loses connection, no one else can
   start the game and the room lingers in the database forever. Decide on
   and implement a reasonable behavior (e.g. host-leaves reassigns to next
   player; rooms older than N hours get purged via a cron/Edge Function).
2. **No reconnect/offline handling beyond sessionStorage.** If a player's
   phone loses signal mid-game, there's no visible "reconnecting…" state or
   retry logic on the Supabase Realtime subscription — confirm what
   actually happens (does the channel auto-resubscribe? does the UI hang?).
3. **Players list has no removal mechanism.** Once joined, a player can't
   leave gracefully (closing the tab just abandons their `players` row).
   Confirm whether this causes any visible bug (e.g. turn order math against
   `players.length` if someone's gone) and decide if it matters for v1.
4. **No max player limit and no duplicate-name handling.** Two people can
   join with the same name, which is confusing in the player list and turn
   announcements. Decide whether to block, append a number, or leave it.
5. **Romantic 4-letter room codes can collide in pathological ways** (e.g.
   spelling real words) — purely cosmetic, not a bug, just flag if it
   matters to the product.

## What "QA" should actually mean here

### Functional / device testing (needs real hardware — please do this, I
could not)
- Run `npm install && npm run dev -- --host`, get the LAN URL, open it on at
  least one real iPhone (Safari) and one real Android phone (Chrome)
  simultaneously, on the same wifi.
- Full flow: host creates room → second device joins with the code → host
  starts game → take several turns across both devices → confirm card flip,
  prompt text, and turn handoff all sync correctly and promptly.
- Background one phone mid-game (press home button, wait 30s, reopen) —
  confirm sessionStorage-based session restore actually works and the
  player doesn't get dropped from the game.
- Test with iOS VoiceOver and Android TalkBack on for at least the
  create-room and in-game flows — confirm the `aria-live` additions
  actually announce sensibly and aren't either silent or overly chatty.
- Test in landscape orientation and on a small screen (e.g. iPhone SE size)
  for any layout breakage — `screenWrap` is capped at `maxWidth: 480` so it
  should be fine, but verify.
- Once deployed to Vercel, repeat the above against the real production URL
  over cellular data (not just local wifi) to catch any latency-dependent
  bugs in the realtime sync.

### Stress / concurrency testing
- Simulate 6–10 players in one room. Realtime subscription fan-out and the
  player-list re-fetch-on-any-change pattern (see the `players` channel
  listener in `App.jsx` — it refetches the *entire* player list on every
  insert/update/delete rather than patching incrementally) may not scale
  gracefully; profile it.
- Hammer the "Done — next player" button rapidly from two physical devices
  at the same moment (not in code — actually do this with two thumbs on two
  phones) to confirm the optimistic-concurrency fix above holds in practice.
- Create and abandon ~20 rooms in a row to confirm there's no unbounded
  growth issue or quota concern on Supabase's free/current tier.

### Code-level hardening you're free to do without device access
- Add basic error boundaries / toast feedback for failed Supabase writes
  (currently several `await supabase...` calls swallow errors silently).
- Consider replacing the "refetch all players on any change" pattern with
  incremental state updates from the realtime payload, for both
  performance and to reduce read load.
- Add a lightweight automated test (Playwright is fine, headless) for the
  core room-create → join → start → draw → next loop against a test
  Supabase project, if one can be stood up, so this doesn't regress
  silently on future edits.

## Source of truth for content

All Truth/Dare/Question prompts live in the `CONTENT` object near the top
of `src/App.jsx`. `questions.json` in the repo root is a non-authoritative
reference copy — if you edit prompts, edit `App.jsx`, not the JSON file.

Report back with: a plain list of what you tested, what passed, what
failed, and what you fixed vs. what still needs a product decision (not
just a code fix) before shipping.
