import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_KEY = "td_session";
const MAX_PLAYERS = 12;
const ROOM_TTL_HOURS = 18;

const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- Content bank ----------------------------------------------------
const CONTENT = {
  categories: [
    {
      id: "mild",
      label: "Mild",
      accent: "#34D6B0",
      truths: [
        "What's the most embarrassing thing in your search history?",
        "Who was your first celebrity crush?",
        "What's a lie you told that you never got caught for?",
        "What's the weirdest thing you've ever eaten?",
        "What app do you spend the most time on?",
        "What's your most useless talent?",
        "What's the last thing you Googled?",
        "What's your worst habit?",
        "What's a rumor you've heard about yourself?",
        "What's the cringiest thing you did as a teenager?",
      ],
      dares: [
        "Talk in an accent for the next 3 rounds.",
        "Let the group post anything on your story.",
        "Do your best impression of someone in the room.",
        "Send a voice memo singing the chorus of your favorite song.",
        "Let someone else answer your next 3 texts.",
        "Do 10 jumping jacks right now.",
        "Speak only in questions until your next turn.",
        "Show the group your camera roll's 5th most recent photo.",
        "Let the group pick your profile picture for a day.",
        "Do your best catwalk across the room.",
      ],
    },
    {
      id: "bold",
      label: "Bold",
      accent: "#FF5A4E",
      truths: [
        "What's something you'd never admit to your parents?",
        "Have you ever cheated on a test, partner, or game?",
        "What's the boldest thing you've done to get someone's attention?",
        "What's a secret you've never told anyone in this room?",
        "What's the riskiest thing you've ever done for love?",
        "Who in this room would you trust with a secret, and who wouldn't you?",
        "What's the most trouble you've been in and not gotten caught for?",
        "What's a white lie you tell often?",
      ],
      dares: [
        "Let the group go through your texts for 30 seconds.",
        "Call a friend and tell them you love them, no context.",
        "Do an embarrassing dance for 30 seconds.",
        "Let someone draw on your face with a marker.",
        "Reveal the last thing you searched on your phone.",
        "Prank call someone in your contacts.",
        "Let the group rename you in their phone for a week.",
        "Eat something the group picks for you, no questions asked.",
      ],
    },
    {
      id: "couples",
      label: "Couples / Flirty",
      accent: "#E0529C",
      truths: [
        "What was your first impression of me, really?",
        "What's a small thing I do that you secretly love?",
        "What's the most attracted you've ever been to me?",
        "What's a fantasy date you've never told me about?",
        "What's one thing you find irresistible in a partner?",
        "What's the moment you knew you were falling for me?",
        "What's something flirty you've always wanted to say to me but haven't?",
        "What's a memory of us that gives you butterflies?",
      ],
      dares: [
        "Whisper the nicest thing you've ever thought about me.",
        "Give me a slow, lingering hug for 20 seconds.",
        "Write a flirty one-line text and send it to me right now.",
        "Hold eye contact with me for 30 seconds without laughing.",
        "Describe your perfect date with me in 3 sentences.",
        "Give me a compliment you've never said out loud before.",
        "Slow dance with me for 30 seconds, no music needed.",
        "Tell me your favorite thing about how we kiss.",
      ],
    },
    {
      id: "wild",
      label: "Wild",
      accent: "#FFB84D",
      truths: [
        "What's the most chaotic decision you made this year?",
        "Who here would you call first for a last-minute adventure?",
        "What's one thing you would do tonight if there were no consequences?",
        "What's the boldest message sitting in your drafts?",
        "What is a party story you usually leave one detail out of?",
        "Who in this room gives the best bad advice?",
      ],
      dares: [
        "Let the group choose your next social media caption.",
        "Switch an accessory with someone until your next turn.",
        "Let the room pick a contact for you to send a harmless compliment.",
        "Give a dramatic toast to the person on your left.",
        "Do your victory dance like you just won the whole night.",
        "Let the group choose one word you cannot say for three rounds.",
      ],
    },
  ],
  questionsMode: {
    mild: [
      "What's a small thing that instantly improves your day?",
      "What's a skill you wish you had?",
      "What's the best advice you've ever received?",
      "What's a place you've never been but really want to visit?",
      "What's your go-to comfort food?",
      "What's a memory that always makes you smile?",
      "What's something you're proud of that most people don't know about?",
      "If you could have dinner with anyone, living or dead, who would it be?",
    ],
    bold: [
      "What's a belief you held strongly that you later changed your mind about?",
      "What's the bravest thing you've ever done?",
      "What's something you're still figuring out about yourself?",
      "Who has had the biggest influence on who you are today?",
      "What's a risk you took that paid off?",
      "What's something you'd do differently if you could go back 5 years?",
    ],
    couples: [
      "What's your favorite memory of us so far?",
      "What made you realize you wanted to be with me?",
      "What's something about our relationship you're most grateful for?",
      "What's a dream you have for our future together?",
      "What's something I do that makes you feel most loved?",
      "What's a little quirk of mine that you secretly adore?",
    ],
    wild: [
      "What's the funniest thing that could happen before the night ends?",
      "Who here would survive a group trip with the least planning?",
      "What is your most unhinged but harmless opinion?",
      "What's one rule this group should invent for tonight?",
      "Who here is most likely to turn a small plan into a full event?",
      "What's the best story from a night that started with no plan?",
    ],
  },
};

function categoryAccent(id) {
  return CONTENT.categories.find((c) => c.id === id)?.accent || "#34D6B0";
}

function randomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 4; i++)
    out += letters[Math.floor(Math.random() * letters.length)];
  return out;
}

function pickTruthOrDare(room, kind) {
  const cat = CONTENT.categories.find((c) => c.id === room.category) || CONTENT.categories[0];
  const pool = kind === "truth" ? cat.truths : cat.dares;
  return pool[Math.floor(Math.random() * pool.length)];
}

function inviteUrlFor(code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", code);
  return url.toString();
}

function penaltyTextFor(kind) {
  const shotCount = kind === "dare" ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
  const label = kind === "dare" ? "Dare refused or failed" : "Challenge skipped";
  return `${label}: ${shotCount} ${shotCount === 1 ? "shot" : "shots"}. The group can swap for a house-rule penalty.`;
}

function shotCountFromPenalty(text) {
  const match = String(text || "").match(/: (\d+) shots?/i);
  return match ? Number(match[1]) : 0;
}

function isExpiredRoom(room) {
  if (!room?.created_at) return false;
  const ageMs = Date.now() - new Date(room.created_at).getTime();
  return ageMs > ROOM_TTL_HOURS * 60 * 60 * 1000;
}

function qrUrlFor(code) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(inviteUrlFor(code))}`;
}

// ---- Small UI atoms ----------------------------------------------------
function Button({ children, onClick, variant = "solid", accent = "#34D6B0", disabled, style }) {
  const base = {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.02em",
    padding: "16px 22px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "transform 0.15s ease, opacity 0.15s ease",
    width: "100%",
  };
  const variants = {
    solid: { background: accent, color: "#0B0B10" },
    outline: {
      background: "transparent",
      color: accent,
      border: `1.5px solid ${accent}`,
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "#E9E7F0",
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onPointerDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function TextField({ value, onChange, placeholder, maxLength, onEnter, autoFocus, center, ariaLabel, id }) {
  return (
    <input
      id={id}
      autoFocus={autoFocus}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
      placeholder={placeholder}
      aria-label={ariaLabel || placeholder}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "16px 18px",
        fontSize: center ? 22 : 16,
        fontFamily: center ? "'Sora', sans-serif" : "'Manrope', sans-serif",
        fontWeight: center ? 700 : 500,
        letterSpacing: center ? "0.12em" : "normal",
        textAlign: center ? "center" : "left",
        textTransform: center ? "uppercase" : "none",
        color: "#F4F2FA",
        boxSizing: "border-box",
      }}
    />
  );
}

// ---- Screens -------------------------------------------------------------

function HomeScreen({ onCreate, onJoin, onInstall, installStatus, canInstall }) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState("home"); // home | join

  return (
    <div style={screenWrap}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={eyebrow}>PASS · REVEAL · DARE</div>
          <h1 style={heroTitle}>
            Truth<span style={{ color: "#FF5A4E" }}>/</span>Dare
          </h1>
          <p style={{ color: "#9C97AE", fontSize: 15, marginTop: 10, fontFamily: "'Manrope', sans-serif" }}>
            Everyone joins from their own phone. One card at a time.
          </p>
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Button accent="#34D6B0" onClick={onCreate}>
              Host a new room
            </Button>
            <Button variant="outline" accent="#9C97AE" onClick={() => setMode("join")}>
              Join with a code
            </Button>
            <Button variant="ghost" onClick={onInstall}>
              {canInstall ? "Install app" : "How to install"}
            </Button>
            {installStatus && <div style={hintText}>{installStatus}</div>}
          </div>
        )}

        {mode === "join" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label
              htmlFor="join-code-input"
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9C97AE", letterSpacing: "0.08em", marginBottom: -4, fontFamily: "'Manrope', sans-serif" }}
            >
              ROOM CODE
            </label>
            <TextField
              id="join-code-input"
              value={joinCode}
              onChange={(v) => setJoinCode(v.toUpperCase().slice(0, 4))}
              placeholder="CODE"
              ariaLabel="4-letter room code"
              maxLength={4}
              center
              autoFocus
              onEnter={() => joinCode.length === 4 && onJoin(joinCode)}
            />
            <Button
              accent="#34D6B0"
              disabled={joinCode.length !== 4}
              onClick={() => onJoin(joinCode)}
            >
              Continue
            </Button>
            <Button variant="ghost" onClick={() => setMode("home")}>
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigScreen() {
  return (
    <div style={screenWrap}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div style={eyebrow}>SUPABASE CONFIG REQUIRED</div>
        <h1 style={heroTitle}>
          Truth<span style={{ color: "#FF5A4E" }}>/</span>Dare
        </h1>
        <p style={{ color: "#D8D3E6", fontSize: 15, lineHeight: 1.55, fontFamily: "'Manrope', sans-serif", margin: 0 }}>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the existing demo Supabase project before running or deploying this branch.
        </p>
      </div>
    </div>
  );
}

function CreateRoomScreen({ onRoomCreated, onBack }) {
  const [name, setName] = useState("");
  const [gameMode, setGameMode] = useState("truth_dare");
  const [category, setCategory] = useState("mild");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      let code = randomCode();
      // Try a few times in case of collision
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: existing } = await supabase.from("rooms").select("code").eq("code", code).maybeSingle();
        if (!existing) break;
        code = randomCode();
      }
      const { error: roomErr } = await supabase.from("rooms").insert({
        code,
        game_mode: gameMode,
        category,
        status: "lobby",
        current_player_index: 0,
      });
      if (roomErr) throw roomErr;

      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ room_code: code, name: name.trim(), join_order: 0 })
        .select()
        .single();
      if (playerErr) throw playerErr;

      onRoomCreated(code, player);
    } catch (e) {
      setError("Couldn't create the room. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div style={screenWrap}>
      <button onClick={onBack} style={backBtn}>← Back</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div>
          <div style={eyebrow}>STEP 1 OF 1</div>
          <h2 style={sectionTitle}>Set up the room</h2>
        </div>

        <Field label="Your name" htmlFor="create-name">
          <TextField id="create-name" value={name} onChange={setName} placeholder="What should we call you?" autoFocus maxLength={20} />
        </Field>

        <Field label="Game mode">
          <SegmentedControl
            options={[
              { id: "truth_dare", label: "Truth or Dare" },
              { id: "questions", label: "Questions" },
            ]}
            value={gameMode}
            onChange={setGameMode}
          />
        </Field>

        <Field label="Category">
          <div style={{ display: "flex", gap: 10 }}>
            {CONTENT.categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.label.split(" / ")[0]}
                accent={c.accent}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </div>
        </Field>

        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}

        <Button accent={categoryAccent(category)} disabled={!name.trim() || busy} onClick={handleCreate}>
          {busy ? "Creating…" : "Create room"}
        </Button>
      </div>
    </div>
  );
}

function JoinRoomScreen({ code, onJoined, onBack }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (roomErr || !room) {
        setError("Room not found. Double check the code.");
        setBusy(false);
        return;
      }
      if (isExpiredRoom(room)) {
        setError(`That room expired after ${ROOM_TTL_HOURS} hours. Ask the host to create a new room.`);
        setBusy(false);
        return;
      }
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", code)
        .order("join_order", { ascending: true });
      const roster = existingPlayers || [];
      if (roster.length >= MAX_PLAYERS) {
        setError(`This room is full at ${MAX_PLAYERS} players.`);
        setBusy(false);
        return;
      }
      if (roster.some((player) => player.name.trim().toLowerCase() === name.trim().toLowerCase())) {
        setError("That name is already in the room. Add an initial or nickname.");
        setBusy(false);
        return;
      }

      const nextOrder = roster.length;
      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ room_code: code, name: name.trim(), join_order: nextOrder })
        .select()
        .single();
      if (playerErr) throw playerErr;

      onJoined(code, player);
    } catch (e) {
      setError("Something went wrong joining the room.");
      setBusy(false);
    }
  }

  return (
    <div style={screenWrap}>
      <button onClick={onBack} style={backBtn}>← Back</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
        <div>
          <div style={eyebrow}>JOINING ROOM {code}</div>
          <h2 style={sectionTitle}>What's your name?</h2>
        </div>
        <Field label="Your name" htmlFor="join-name">
          <TextField id="join-name" value={name} onChange={setName} placeholder="Your name" autoFocus maxLength={20} onEnter={handleJoin} />
        </Field>
        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}
        <Button accent="#34D6B0" disabled={!name.trim() || busy} onClick={handleJoin}>
          {busy ? "Joining…" : "Join room"}
        </Button>
      </div>
    </div>
  );
}

function LobbyScreen({
  room,
  players,
  me,
  online,
  onStart,
  onLeave,
  onInvite,
  inviteStatus,
  onRoomSettingsChange,
  onRemovePlayer,
  onTransferHost,
}) {
  const isHost = players.length > 0 && players[0].id === me.id;
  const cat = CONTENT.categories.find((c) => c.id === room.category);
  const inviteUrl = inviteUrlFor(room.code);

  return (
    <div style={screenWrap}>
      <button onClick={onLeave} style={backBtn}>← Leave</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }}>
          <div style={eyebrow}>ROOM CODE</div>
          <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: "0.08em", color: cat?.accent }}>
            {room.code}
          </div>
          <p style={{ color: "#9C97AE", fontSize: 14, marginTop: 6, fontFamily: "'Manrope', sans-serif" }}>
            Share this code so others can join
          </p>
          <Pill text={online ? "Connected" : "Offline - reconnecting"} accent={online ? "#34D6B0" : "#FFB84D"} />
        </div>

        <div>
          <div style={{ ...eyebrow, marginBottom: 12 }}>
            PLAYERS · {players.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {players.map((p, i) => (
              <div key={p.id} style={playerRow}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}>
                  {p.name} {p.id === me.id && <span style={{ color: "#9C97AE" }}>(you)</span>}
                </span>
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {i === 0 && <span style={{ ...badge, background: cat?.accent }}>HOST</span>}
                  {isHost && p.id !== me.id && (
                    <>
                      <button onClick={() => onTransferHost(p)} style={miniBtn}>Make host</button>
                      <button onClick={() => onRemovePlayer(p)} style={miniBtn}>Remove</button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Pill text={room.game_mode === "questions" ? "Questions" : "Truth or Dare"} />
          <Pill text={cat?.label} accent={cat?.accent} />
        </div>

        <Button variant="ghost" onClick={onInvite}>
          Invite players
        </Button>
        <div style={qrPanel}>
          <img src={qrUrlFor(room.code)} alt={`QR invite for room ${room.code}`} style={qrImage} />
          <div style={{ ...hintText, textAlign: "left" }}>
            Scan to join, or share this link:
            <div style={linkText}>{inviteUrl}</div>
          </div>
        </div>
        {inviteStatus && <div style={hintText}>{inviteStatus}</div>}

        {isHost && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Game mode">
              <SegmentedControl
                options={[
                  { id: "truth_dare", label: "Truth or Dare" },
                  { id: "questions", label: "Questions" },
                ]}
                value={room.game_mode}
                onChange={(value) => onRoomSettingsChange({ game_mode: value })}
              />
            </Field>
            <Field label="Category">
              <div style={{ display: "flex", gap: 10 }}>
                {CONTENT.categories.map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.label.split(" / ")[0]}
                    accent={c.accent}
                    active={room.category === c.id}
                    onClick={() => onRoomSettingsChange({ category: c.id })}
                  />
                ))}
              </div>
            </Field>
          </div>
        )}

        {isHost ? (
          <Button accent={cat?.accent} disabled={players.length < 2} onClick={onStart}>
            {players.length < 2 ? "Waiting for more players…" : "Start game"}
          </Button>
        ) : (
          <div style={{ textAlign: "center", color: "#9C97AE", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>
            Waiting for the host to start…
          </div>
        )}
      </div>
    </div>
  );
}

function GameScreen({
  room,
  players,
  me,
  online,
  score,
  onAction,
  onLeave,
  onInvite,
  onEndGame,
  onSkipPlayer,
  onRemovePlayer,
  onShareRecap,
  inviteStatus,
  busy,
}) {
  const cat = CONTENT.categories.find((c) => c.id === room.category);
  const currentPlayer = players[room.current_player_index % players.length];
  const isMyTurn = currentPlayer?.id === me.id;
  const hasPrompt = !!room.current_prompt;
  const isPenalty = room.current_type === "penalty";
  const isHost = players.length > 0 && players[0].id === me.id;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
    if (hasPrompt) {
      const t = setTimeout(() => setFlipped(true), 60);
      return () => clearTimeout(t);
    }
  }, [room.current_prompt, room.current_type]);

  const accent = cat?.accent || "#34D6B0";

  return (
    <div style={screenWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button onClick={onLeave} style={backBtn}>Leave</button>
        <button onClick={onInvite} style={backBtn}>Invite</button>
      </div>

      <div style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }}>
        <Pill text={room.game_mode === "questions" ? "Questions" : "Truth or Dare"} />
        <Pill text={cat?.label} accent={accent} style={{ marginLeft: 8 }} />
        <Pill text={online ? "Connected" : "Offline - reconnecting"} accent={online ? "#34D6B0" : "#FFB84D"} style={{ marginLeft: 8 }} />
      </div>
      {inviteStatus && <div style={hintText}>{inviteStatus}</div>}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }} aria-live="polite">
          <div style={eyebrow}>{isMyTurn ? "YOUR TURN" : "CURRENT TURN"}</div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: accent }}>
            {currentPlayer?.name}
          </div>
        </div>

        <div style={{ perspective: 1200, width: "100%", maxWidth: 340, height: 220 }} role="region" aria-label="Current prompt card">
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 22,
              position: "relative",
              transformStyle: "preserve-3d",
              transition: "transform 0.55s cubic-bezier(.2,.8,.2,1)",
              transform: flipped ? "rotateY(0deg)" : "rotateY(90deg)",
            }}
          >
            <div
              aria-live="assertive"
              aria-atomic="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: hasPrompt ? `linear-gradient(155deg, ${accent}22, rgba(255,255,255,0.04))` : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${hasPrompt ? accent + "55" : "rgba(255,255,255,0.1)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 28,
                textAlign: "center",
              }}
            >
              {hasPrompt ? (
                <div>
                  <div style={{ ...eyebrow, color: accent, marginBottom: 10 }}>
                    {isPenalty ? "PENALTY" : room.current_type?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", lineHeight: 1.35, color: "#F4F2FA" }}>
                    {room.current_prompt}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#807C92", fontFamily: "'Manrope', sans-serif", fontSize: 15 }}>
                  {isMyTurn ? "Pick truth or dare below" : "Waiting for their pick…"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: 18 }}>
        {isMyTurn && !hasPrompt && room.game_mode === "truth_dare" && (
          <div style={{ display: "flex", gap: 12 }}>
            <Button accent="#34D6B0" disabled={busy} onClick={() => onAction("draw", "truth")}>Truth</Button>
            <Button accent="#FF5A4E" disabled={busy} onClick={() => onAction("draw", "dare")}>Dare</Button>
          </div>
        )}
        {isMyTurn && !hasPrompt && room.game_mode === "questions" && (
          <Button accent={accent} disabled={busy} onClick={() => onAction("draw", "question")}>Draw a question</Button>
        )}
        {isMyTurn && hasPrompt && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!isPenalty && (
              <Button variant="outline" accent="#FFB84D" disabled={busy} onClick={() => onAction("penalty")}>
                Refused / failed
              </Button>
            )}
            <Button accent={accent} disabled={busy} onClick={() => onAction("next")}>Done - next player</Button>
          </div>
        )}
        {!isMyTurn && (
          <div style={{ textAlign: "center", color: "#807C92", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>
            {currentPlayer?.name} is up
          </div>
        )}
        {isHost && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="ghost" disabled={busy} onClick={onSkipPlayer}>Skip player</Button>
              <Button variant="ghost" disabled={busy || !currentPlayer || currentPlayer.id === me.id} onClick={() => onRemovePlayer(currentPlayer)}>Remove player</Button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="ghost" disabled={busy} onClick={onShareRecap}>Share recap</Button>
              <Button variant="ghost" disabled={busy} onClick={onEndGame}>End game</Button>
            </div>
          </div>
        )}
        {score.length > 0 && (
          <div style={scorePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>PENALTIES</div>
            {score.slice(0, 4).map((entry) => (
              <div key={entry.name} style={scoreRow}>
                <span>{entry.name}</span>
                <span>{entry.shots} shots</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Small reusable pieces -----------------------------------------------

function Field({ label, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9C97AE", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Manrope', sans-serif" }}
      >
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 4 }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          style={{
            flex: 1,
            padding: "12px 10px",
            borderRadius: 11,
            border: "none",
            background: value === opt.id ? "#F4F2FA" : "transparent",
            color: value === opt.id ? "#0B0B10" : "#9C97AE",
            fontWeight: 700,
            fontSize: 13.5,
            fontFamily: "'Manrope', sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CategoryChip({ label, accent, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        padding: "12px 8px",
        borderRadius: 13,
        border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
        background: active ? accent + "1f" : "transparent",
        color: active ? accent : "#9C97AE",
        fontWeight: 700,
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function Pill({ text, accent = "#9C97AE", style }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 14px",
        borderRadius: 999,
        background: accent + "1f",
        color: accent,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontFamily: "'Manrope', sans-serif",
        ...style,
      }}
    >
      {text}
    </span>
  );
}

const hintText = {
  textAlign: "center",
  color: "#9C97AE",
  fontSize: 13,
  lineHeight: 1.45,
  fontFamily: "'Manrope', sans-serif",
};

// ---- Layout tokens --------------------------------------------------------

const screenWrap = {
  minHeight: "100vh",
  background: "#0B0B10",
  color: "#F4F2FA",
  padding: "24px 22px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: 480,
  margin: "0 auto",
};

const eyebrow = {
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.18em",
  color: "#807C92",
  fontFamily: "'Manrope', sans-serif",
  marginBottom: 6,
};

const heroTitle = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  fontSize: 56,
  letterSpacing: "-0.02em",
  margin: 0,
};

const sectionTitle = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  margin: "4px 0 0",
};

const backBtn = {
  background: "none",
  border: "none",
  color: "#9C97AE",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  padding: 0,
  alignSelf: "flex-start",
};

const playerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.05)",
  borderRadius: 12,
  padding: "12px 16px",
};

const badge = {
  fontSize: 10,
  fontWeight: 800,
  color: "#0B0B10",
  padding: "3px 8px",
  borderRadius: 999,
  letterSpacing: "0.05em",
};

const miniBtn = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 9,
  color: "#E9E7F0",
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  padding: "6px 8px",
};

const qrPanel = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const qrImage = {
  width: 92,
  height: 92,
  borderRadius: 10,
  background: "#F4F2FA",
  flex: "0 0 auto",
};

const linkText = {
  marginTop: 6,
  color: "#F4F2FA",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const scorePanel = {
  marginTop: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const scoreRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#E9E7F0",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  padding: "4px 0",
};

// ---- Root app ---------------------------------------------------------

export default function App() {
  const [view, setView] = useState("home"); // home | create | join | lobby | game
  const [joinCode, setJoinCode] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [me, setMe] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installStatus, setInstallStatus] = useState("");
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [activityLog, setActivityLog] = useState([]);

  // Restore session on mount (handles phone lock / tab reload mid-game)
  useEffect(() => {
    try {
      const invitedRoom = new URLSearchParams(window.location.search).get("room");
      if (invitedRoom) {
        setJoinCode(invitedRoom.toUpperCase().slice(0, 4));
        setView("join");
        return;
      }
      const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { roomCode: savedRoom, me: savedMe } = JSON.parse(saved);
        if (savedRoom && savedMe) {
          setRoomCode(savedRoom);
          setMe(savedMe);
        }
      }
    } catch (e) {
      // sessionStorage unavailable — proceed without persistence
    }
  }, []);

  // Save session whenever it changes
  useEffect(() => {
    if (roomCode && me) {
      try {
        const session = JSON.stringify({ roomCode, me });
        localStorage.setItem(SESSION_KEY, session);
        sessionStorage.setItem(SESSION_KEY, session);
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [roomCode, me]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallStatus("Install this app on your home screen for quick room re-entry.");
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setInstallStatus("Installed. Open it from your home screen any time.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load fonts once
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Subscribe to room + players once we have a roomCode
  useEffect(() => {
    if (!roomCode || !supabase) return;

    let active = true;

    async function loadInitial() {
      const { data: r } = await supabase.from("rooms").select("*").eq("code", roomCode).maybeSingle();
      const { data: p } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", roomCode)
        .order("join_order", { ascending: true });
      if (!active) return;
      if (!r) {
        handleLocalExit();
        setInstallStatus("That saved room is no longer available. Create or join a new room.");
        return;
      }
      if (isExpiredRoom(r)) {
        handleLocalExit();
        setInstallStatus(`That room expired after ${ROOM_TTL_HOURS} hours. Create a new one to keep playing.`);
        return;
      }
      setRoom(r);
      setPlayers(p || []);
      if (r?.status === "playing") setView("game");
      else setView("lobby");
    }
    loadInitial();

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` }, (payload) => {
        if (payload.eventType === "DELETE") return;
        setRoom(payload.new);
        if (payload.new.status === "playing") setView("game");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` }, () => {
        supabase
          .from("players")
          .select("*")
          .eq("room_code", roomCode)
          .order("join_order", { ascending: true })
          .then(({ data }) => setPlayers(data || []));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) {
      setActivityLog([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`td_activity_${roomCode}`);
      setActivityLog(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setActivityLog([]);
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    try {
      localStorage.setItem(`td_activity_${roomCode}`, JSON.stringify(activityLog.slice(0, 30)));
    } catch (e) {
      // ignore storage errors
    }
  }, [activityLog, roomCode]);

  const penaltyScore = activityLog
    .filter((entry) => entry.type === "penalty")
    .reduce((acc, entry) => {
      acc[entry.player] = (acc[entry.player] || 0) + entry.shots;
      return acc;
    }, {});
  const score = Object.entries(penaltyScore)
    .map(([name, shots]) => ({ name, shots }))
    .sort((a, b) => b.shots - a.shots);

  function handleRoomCreated(code, player) {
    setMe(player);
    setRoomCode(code);
  }

  function handleJoined(code, player) {
    setMe(player);
    setRoomCode(code);
  }

  async function handleStart() {
    await supabase
      .from("rooms")
      .update({ status: "playing", current_player_index: 0, current_prompt: null, current_type: null })
      .eq("code", roomCode);
  }

  async function handleEndGame() {
    if (actionInFlight) return;
    setActionInFlight(true);
    try {
      await supabase
        .from("rooms")
        .update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })
        .eq("code", roomCode);
      setView("lobby");
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleRoomSettingsChange(nextSettings) {
    if (!roomCode) return;
    await supabase
      .from("rooms")
      .update({ ...nextSettings, current_prompt: null, current_type: null, current_player_index: 0 })
      .eq("code", roomCode);
  }

  async function handleInvite() {
    if (!roomCode) return;
    const url = inviteUrlFor(roomCode);
    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Truth/Dare room", text, url });
        setInviteStatus("Invite sheet opened.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus("Invite link copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleRemovePlayer(player) {
    if (!player || actionInFlight) return;
    setActionInFlight(true);
    try {
      await supabase.from("players").delete().eq("id", player.id);
      if (player.id === me?.id) {
        handleLocalExit();
        return;
      }
      if (players.length <= 2) {
        await supabase
          .from("rooms")
          .update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })
          .eq("code", roomCode);
        return;
      }
      const currentIndex = room.current_player_index % players.length;
      const removedIndex = players.findIndex((p) => p.id === player.id);
      if (removedIndex > -1 && removedIndex <= currentIndex) {
        await supabase
          .from("rooms")
          .update({ current_player_index: Math.max(0, currentIndex - 1), current_prompt: null, current_type: null })
          .eq("code", roomCode);
      }
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleTransferHost(player) {
    if (!player || actionInFlight) return;
    setActionInFlight(true);
    try {
      const updates = players.map((p, index) => {
        const joinOrder = p.id === player.id ? -1 : index + 1;
        return supabase.from("players").update({ join_order: joinOrder }).eq("id", p.id);
      });
      await Promise.all(updates);
      await supabase
        .from("rooms")
        .update({ current_prompt: null, current_type: null })
        .eq("code", roomCode);
      setInviteStatus(`${player.name} is now host.`);
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleSkipPlayer() {
    if (!players.length) return;
    await handleAction("next");
  }

  async function handleShareRecap() {
    const lines = [
      `Truth/Dare room ${roomCode} recap`,
      `Players: ${players.map((player) => player.name).join(", ") || "None"}`,
      score.length ? `Penalties: ${score.map((entry) => `${entry.name} ${entry.shots}`).join(", ")}` : "Penalties: none",
      `Invite: ${inviteUrlFor(roomCode)}`,
    ];
    const text = lines.join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Truth/Dare recap", text });
        setInviteStatus("Recap shared.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus("Recap copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setInstallStatus(choice.outcome === "accepted" ? "Installing..." : "Install dismissed. You can try again later.");
      return;
    }

    setInstallStatus("On iPhone: Share, then Add to Home Screen. On Android: browser menu, then Install app.");
  }

  async function handleAction(action, kind) {
    if (actionInFlight) return; // guard against rapid double-tap firing duplicate writes
    setActionInFlight(true);
    try {
      if (action === "draw") {
        // Only succeeds if the room is still in the state we expect (no prompt drawn yet).
        // Prevents a double-tap from drawing two prompts in a row.
        const text = room.game_mode === "questions" ? pickTruthOrDareForQuestions() : pickTruthOrDare(room, kind);
        await supabase
          .from("rooms")
          .update({ current_prompt: text, current_type: kind })
          .eq("code", roomCode)
          .is("current_prompt", null);
      } else if (action === "penalty") {
        const penaltyText = penaltyTextFor(room.current_type);
        await supabase
          .from("rooms")
          .update({ current_prompt: penaltyText, current_type: "penalty" })
          .eq("code", roomCode)
          .eq("current_player_index", room.current_player_index);
        setActivityLog((entries) => [
          {
            type: "penalty",
            player: currentPlayerName(),
            shots: shotCountFromPenalty(penaltyText),
            text: penaltyText,
            at: new Date().toISOString(),
          },
          ...entries,
        ].slice(0, 30));
      } else if (action === "next") {
        // Only succeeds if current_player_index still matches what this client saw.
        // Prevents a double-tap (or stale retry) from advancing the turn twice.
        const expectedIndex = room.current_player_index;
        const nextIndex = (expectedIndex + 1) % players.length;
        await supabase
          .from("rooms")
          .update({ current_prompt: null, current_type: null, current_player_index: nextIndex })
          .eq("code", roomCode)
          .eq("current_player_index", expectedIndex);
      }
    } finally {
      setActionInFlight(false);
    }
  }

  function pickTruthOrDareForQuestions() {
    const pool = CONTENT.questionsMode[room.category] || CONTENT.questionsMode.mild;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function currentPlayerName() {
    return players[room.current_player_index % players.length]?.name || "Player";
  }

  function handleLocalExit() {
    setView("home");
    setRoomCode(null);
    setRoom(null);
    setPlayers([]);
    setMe(null);
    setInviteStatus("");
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // ignore
    }
  }

  async function handleLeave() {
    const player = me;
    if (player?.id && supabase) {
      await handleRemovePlayer(player);
      return;
    }
    handleLocalExit();
  }

  if (!hasSupabaseConfig) {
    return <ConfigScreen />;
  }

  if (view === "home") {
    return (
      <HomeScreen
        onCreate={() => setView("create")}
        onJoin={(code) => {
          setJoinCode(code);
          setView("join");
        }}
        onInstall={handleInstall}
        installStatus={installStatus}
        canInstall={Boolean(installPrompt)}
      />
    );
  }

  if (view === "create") {
    return <CreateRoomScreen onRoomCreated={handleRoomCreated} onBack={() => setView("home")} />;
  }

  if (view === "join") {
    return <JoinRoomScreen code={joinCode} onJoined={handleJoined} onBack={() => setView("home")} />;
  }

  if (view === "lobby" && room) {
    return (
      <LobbyScreen
        room={room}
        players={players}
        me={me}
        online={online}
        onStart={handleStart}
        onLeave={handleLeave}
        onInvite={handleInvite}
        inviteStatus={inviteStatus}
        onRoomSettingsChange={handleRoomSettingsChange}
        onRemovePlayer={handleRemovePlayer}
        onTransferHost={handleTransferHost}
      />
    );
  }

  if (view === "game" && room) {
    return (
      <GameScreen
        room={room}
        players={players}
        me={me}
        online={online}
        score={score}
        onAction={handleAction}
        onLeave={handleLeave}
        onInvite={handleInvite}
        onEndGame={handleEndGame}
        onSkipPlayer={handleSkipPlayer}
        onRemovePlayer={handleRemovePlayer}
        onShareRecap={handleShareRecap}
        inviteStatus={inviteStatus}
        busy={actionInFlight}
      />
    );
  }

  return (
    <div style={{ ...screenWrap, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#9C97AE", fontFamily: "'Manrope', sans-serif" }}>Loading…</div>
    </div>
  );
}
