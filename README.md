# Truth or Dare — Party App

A multiplayer Truth/Dare and Questions game. One person hosts a room and gets
a 4-letter code; everyone else joins from their own phone using that code.
Turn order, the current prompt, and the player list are all synced live
through Supabase.

## 1. Database setup (Supabase)

Run `schema.sql` in your Supabase project's SQL Editor. If you already ran an
older version of this schema, drop the old tables first — the commented-out
lines at the top of the file show how.

## 2. Run it locally (optional, to test before deploying)

```
npm install
npm run dev
```

Open the printed local URL. To test multiplayer locally, open it in two
browser tabs (or your phone on the same wifi, using your computer's local IP
instead of localhost).

## 3. Deploy to Vercel (so you get a real link to share)

1. Push this folder to a GitHub repo (or use Vercel's CLI / drag-and-drop
   deploy if you don't want to use git).
2. In Vercel: New Project → import the repo → it auto-detects Vite → Deploy.
3. No environment variables needed — the Supabase URL and anon key are
   already in `src/App.jsx` (the anon key is safe to expose publicly; it's
   protected by your Supabase row-level security policies, not secrecy).
4. Vercel gives you a URL like `https://your-app.vercel.app`. Text that to
   friends — whoever opens it can host or join a room.
5. On your phone, open the link in Safari/Chrome and use "Add to Home
   Screen" so it behaves like an installed app.

## 4. Editing the question/dare content

All prompts live in the `CONTENT` object near the top of `src/App.jsx`.
There are three categories (`mild`, `bold`, `couples`), each with a `truths`
array and a `dares` array, plus a separate `questionsMode` object for the
Questions game mode (one flat array of questions per category).

To add, remove, or rewrite prompts: just edit the strings in those arrays.
No other code needs to change — the app picks randomly from whichever
category/mode is active.

```js
truths: [
  "Existing question...",
  "Add your new truth question here",
],
dares: [
  "Existing dare...",
  "Add your new dare here",
],
```

A standalone `questions.json` is also included in this folder as a plain
reference copy of the same structure, in case you want to draft content
there before pasting it into `App.jsx`.

## How the game works

- **Host** creates a room, picks a game mode (Truth or Dare / Questions) and
  a category, and lands in a lobby showing the room code and a live list of
  who's joined.
- **Players** join with the code and their name from their own phone.
- The **host** starts the game once at least 2 players have joined.
- Turns rotate through the player list in join order. On your turn:
  - Truth/Dare mode: pick Truth or Dare, see a random prompt from the chosen
    category, then tap "Done" to pass the turn.
  - Questions mode: tap "Draw a question" to reveal one, then "Done" to pass
    the turn.
- Everyone's phone updates in real time — no refreshing needed.
