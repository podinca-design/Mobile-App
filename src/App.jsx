import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { CONTENT, CONTENT_SCHEMA_VERSION } from "./content.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_KEY = "td_session";
const LOCAL_GAME_KEY = "td_single_device_game";
const MAX_PLAYERS = 12;
const ROOM_TTL_HOURS = 18;
const ADULT_CATEGORY_IDS = new Set(["spicy", "wild", "couples"]);
const MAX_ROUND_SHOT_PENALTIES = 3;
const TIPTOE_DEFAULT_SECONDS = 60;
const GAME_OPTIONS = [
  { id: "truth_dare", label: "Truth or Dare" },
  { id: "questions", label: "Questions" },
  { id: "tiptoe", label: "Tiptoe" },
];
const DISPLAY_MODE_OPTIONS = [
  { id: "pass_play", label: "Pass & Play" },
  { id: "multi_device", label: "Multi-Device" },
  { id: "tv_only", label: "TV Only" },
  { id: "tv_phones", label: "TV + Phones" },
];
const PLAY_FORMAT_OPTIONS = [
  { id: "individual", label: "Individual" },
  { id: "teams", label: "Teams" },
];
const TIPTOE_PACKS = [
  {
    id: "party",
    label: "Party",
    accent: "#FFB84D",
    cards: [
      { id: "tiptoe_party_001", target: "afterparty", forbidden: ["late", "drinks", "music", "night"] },
      { id: "tiptoe_party_002", target: "karaoke", forbidden: ["sing", "microphone", "song", "lyrics"] },
      { id: "tiptoe_party_003", target: "dance floor", forbidden: ["moves", "music", "club", "party"] },
      { id: "tiptoe_party_004", target: "group chat", forbidden: ["text", "message", "phone", "friends"] },
      { id: "tiptoe_party_005", target: "bottle service", forbidden: ["club", "table", "champagne", "server"] },
      { id: "tiptoe_party_006", target: "photo booth", forbidden: ["picture", "camera", "pose", "strip"] },
      { id: "tiptoe_party_007", target: "playlist", forbidden: ["music", "songs", "DJ", "queue"] },
      { id: "tiptoe_party_008", target: "last call", forbidden: ["bar", "closing", "drink", "time"] },
      { id: "tiptoe_party_009", target: "party favor", forbidden: ["gift", "guest", "bag", "surprise"] },
      { id: "tiptoe_party_010", target: "house rules", forbidden: ["game", "allowed", "host", "instructions"] },
    ],
  },
  {
    id: "flirty",
    label: "Flirty",
    accent: "#E0529C",
    cards: [
      { id: "tiptoe_flirty_001", target: "first crush", forbidden: ["school", "like", "kid", "secret"] },
      { id: "tiptoe_flirty_002", target: "slow dance", forbidden: ["music", "close", "arms", "prom"] },
      { id: "tiptoe_flirty_003", target: "eye contact", forbidden: ["look", "stare", "eyes", "face"] },
      { id: "tiptoe_flirty_004", target: "pickup line", forbidden: ["flirt", "bar", "cheesy", "sentence"] },
      { id: "tiptoe_flirty_005", target: "chemistry", forbidden: ["spark", "science", "attraction", "vibe"] },
      { id: "tiptoe_flirty_006", target: "date night", forbidden: ["dinner", "movie", "romance", "couple"] },
      { id: "tiptoe_flirty_007", target: "butterflies", forbidden: ["stomach", "nervous", "wings", "crush"] },
      { id: "tiptoe_flirty_008", target: "compliment", forbidden: ["nice", "pretty", "say", "praise"] },
      { id: "tiptoe_flirty_009", target: "love language", forbidden: ["words", "gifts", "touch", "acts"] },
      { id: "tiptoe_flirty_010", target: "midnight text", forbidden: ["phone", "late", "message", "after"] },
    ],
  },
  {
    id: "pop",
    label: "Pop Culture",
    accent: "#34D6B0",
    cards: [
      { id: "tiptoe_pop_001", target: "red carpet", forbidden: ["celebrity", "dress", "award", "walk"] },
      { id: "tiptoe_pop_002", target: "reality TV", forbidden: ["show", "camera", "drama", "contestant"] },
      { id: "tiptoe_pop_003", target: "viral trend", forbidden: ["internet", "TikTok", "popular", "challenge"] },
      { id: "tiptoe_pop_004", target: "movie trailer", forbidden: ["film", "preview", "coming", "theater"] },
      { id: "tiptoe_pop_005", target: "podcast", forbidden: ["listen", "episode", "host", "audio"] },
      { id: "tiptoe_pop_006", target: "streaming", forbidden: ["watch", "Netflix", "show", "online"] },
      { id: "tiptoe_pop_007", target: "fan theory", forbidden: ["guess", "plot", "movie", "internet"] },
      { id: "tiptoe_pop_008", target: "spoiler alert", forbidden: ["ending", "ruin", "secret", "movie"] },
      { id: "tiptoe_pop_009", target: "theme song", forbidden: ["music", "opening", "show", "lyrics"] },
      { id: "tiptoe_pop_010", target: "award speech", forbidden: ["thank", "stage", "winner", "trophy"] },
    ],
  },
];

const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- Content helpers --------------------------------------------------
function categoryAccent(id) {
  return CONTENT.categories.find((c) => c.id === id)?.accent || TIPTOE_PACKS.find((pack) => pack.id === id)?.accent || "#34D6B0";
}

function categoryLabel(id) {
  return CONTENT.categories.find((c) => c.id === id)?.label || TIPTOE_PACKS.find((pack) => pack.id === id)?.label || "Mild";
}

function isAdultCategory(id) {
  return ADULT_CATEGORY_IDS.has(id);
}

function promptText(prompt) {
  return typeof prompt === "string" ? prompt : prompt?.text || "";
}

function encodePrompt(prompt) {
  return typeof prompt === "string" ? prompt : JSON.stringify(prompt);
}

function decodePrompt(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && parsed.text) return parsed;
  } catch (e) {
    // Plain text prompts from older rooms are still valid.
  }
  return { text: value };
}

function pickFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 4; i++)
    out += letters[Math.floor(Math.random() * letters.length)];
  return out;
}

function randomInviteToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 18; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function localId(prefix = "local") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanDisplayName(value, maxLength = 32) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function firstNameOnly(value) {
  return cleanDisplayName(value).split(" ")[0]?.slice(0, 24) || "";
}

function buildDeckKey(room, kind) {
  return `${room.play_mode || "multiplayer"}:${room.code || room.category}:${room.game_mode}:${room.category}:${kind}:v${CONTENT_SCHEMA_VERSION}`;
}

function loadDeckHistory(room, kind) {
  try {
    return JSON.parse(localStorage.getItem(`td_deck_${buildDeckKey(room, kind)}`) || "{}");
  } catch (e) {
    return {};
  }
}

function saveDeckHistory(room, kind, history) {
  try {
    localStorage.setItem(`td_deck_${buildDeckKey(room, kind)}`, JSON.stringify(history));
  } catch (e) {
    // Local storage supplements Supabase state; failure should not block play.
  }
}

function pickSmartPrompt(room, kind, playerCount = 2) {
  if (room.game_mode === "tiptoe") return pickTiptoeCard(room);
  const cat = CONTENT.categories.find((c) => c.id === room.category) || CONTENT.categories[0];
  const pool =
    room.game_mode === "questions"
      ? CONTENT.questionsMode[room.category] || CONTENT.questionsMode.mild
      : kind === "truth"
        ? cat.truths
        : cat.dares;
  const available = pool.filter((prompt) => (prompt.group_min || 2) <= playerCount);
  const history = loadDeckHistory(room, kind);
  const seenIds = new Set(history.seenIds || []);
  const recentMechanics = new Set((history.recentMechanics || []).slice(0, 3));
  const recentFamilies = new Set((history.recentFamilies || []).slice(0, 4));
  let eligible = available.filter((prompt) => !seenIds.has(prompt.id));
  if (!eligible.length) {
    return {
      id: `deck_exhausted_${Date.now()}`,
      text: "This deck is exhausted. Return to the lobby or start a fresh deck before continuing.",
      exhausted: true,
      intensity: 1,
    };
  }
  const spaced = eligible.filter((prompt) => !recentMechanics.has(prompt.mechanic) && !recentFamilies.has(prompt.family));
  if (spaced.length) eligible = spaced;
  const picked = pickFromPool(eligible);
  const nextHistory = {
    seenIds: [...seenIds, picked.id],
    recentMechanics: [picked.mechanic, ...(history.recentMechanics || [])].filter(Boolean).slice(0, 8),
    recentFamilies: [picked.family, ...(history.recentFamilies || [])].filter(Boolean).slice(0, 10),
  };
  saveDeckHistory(room, kind, nextHistory);
  return picked;
}

function pickTiptoeCard(room) {
  const pack = TIPTOE_PACKS.find((item) => item.id === (room.topic_pack || room.category)) || TIPTOE_PACKS[0];
  const keyRoom = { ...room, category: pack.id, game_mode: "tiptoe" };
  const history = loadDeckHistory(keyRoom, "tiptoe");
  const seenIds = new Set(history.seenIds || []);
  let eligible = pack.cards.filter((card) => !seenIds.has(card.id));
  if (!eligible.length) {
    return {
      id: `tiptoe_exhausted_${Date.now()}`,
      text: "This Tiptoe pack is exhausted. Return to the lobby and start a fresh pack before continuing.",
      exhausted: true,
      target: "Deck exhausted",
      forbidden: ["Fresh deck"],
    };
  }
  const picked = pickFromPool(eligible);
  saveDeckHistory(keyRoom, "tiptoe", { seenIds: [...seenIds, picked.id] });
  return {
    ...picked,
    text: picked.target,
    pack_id: pack.id,
    tiptoe: true,
  };
}

function roomDisplayMode(room) {
  if (room.display_mode) return room.display_mode;
  return room.play_mode === "single_device" ? "pass_play" : "multi_device";
}

function roomPlayFormat(room) {
  if (room.game_mode === "tiptoe") return "teams";
  return room.play_format || "individual";
}

function isTvMode(room) {
  const mode = roomDisplayMode(room);
  return mode === "tv_only" || mode === "tv_phones";
}

function hostPlayerId(room, players) {
  return room?.host_player_id || players[0]?.id;
}

function inviteUrlFor(code, token) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", code);
  if (token) url.searchParams.set("invite", token);
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

function qrUrlFor(code, token) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(inviteUrlFor(code, token))}`;
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

function HomeScreen({ onCreate, onJoin, onInstall, installStatus, canInstall, hasSavedLocal, onResumeLocal }) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState("home"); // home | join

  return (
    <div style={screenWrap}>
      <div style={ambientStage}>
        <img src="/afterparty-thumbnail.png" alt="" aria-hidden="true" style={heroPhoto} />
        <div style={heroPhotoShade} />
        <div style={heroGlassCard}>
          <div style={heroCardMark}>?</div>
          <div>
            <div style={heroCardRule}>TRUTH</div>
            <div style={heroCardRuleAlt}>DARE</div>
          </div>
        </div>
        <div style={heroAgeBadge}>21+</div>
        <div style={heroPhotoCaption}>
          <div style={eyebrow}>PRIVATE PARTY GAME</div>
          <div style={heroPhotoTitle}>Play after dark</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 24 }}>
        <div style={{ textAlign: "left", marginBottom: 32 }}>
          <div style={eyebrow}>PRIVATE PARTY GAME</div>
          <h1 style={heroTitle}>Afterparty</h1>
          <p style={heroCopy}>
            Play pass-the-phone on one device or invite everyone into the same room.
          </p>
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {hasSavedLocal && (
              <Button accent="#FFB84D" onClick={onResumeLocal}>
                Resume single device game
              </Button>
            )}
            <Button accent="#34D6B0" onClick={() => onCreate("single_device")}>
              Pass & Play
            </Button>
            <Button variant="outline" accent="#FFB84D" onClick={() => onCreate("tv_only")}>
              TV Only
            </Button>
            <Button variant="outline" accent="#E9E7F0" onClick={() => onCreate("multiplayer")}>
              Multi-Device
            </Button>
            <Button variant="outline" accent="#E0529C" onClick={() => onCreate("tv_phones")}>
              TV + Phones
            </Button>
            <Button variant="outline" accent="#E9E7F0" onClick={() => setMode("join")}>
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
          Afterparty
        </h1>
        <p style={{ color: "#D8D3E6", fontSize: 15, lineHeight: 1.55, fontFamily: "'Manrope', sans-serif", margin: 0 }}>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the existing demo Supabase project before running or deploying this branch.
        </p>
      </div>
    </div>
  );
}

function CreateRoomScreen({ playMode, onRoomCreated, onLocalRoomCreated, onBack }) {
  const [name, setName] = useState("");
  const [playerNames, setPlayerNames] = useState([""]);
  const [gameMode, setGameMode] = useState("truth_dare");
  const [category, setCategory] = useState("mild");
  const [topicPack, setTopicPack] = useState("party");
  const [timerSeconds, setTimerSeconds] = useState(TIPTOE_DEFAULT_SECONDS);
  const [roomLock, setRoomLock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const needsAgeGate = true;
  const isSingleDevice = playMode === "single_device" || playMode === "tv_only";
  const displayLabel = DISPLAY_MODE_OPTIONS.find((option) => option.id === (playMode === "single_device" ? "pass_play" : playMode))?.label || "Multi-Device";

  function cleanLocalNames() {
    return [name, ...playerNames]
      .map((item) => cleanDisplayName(item))
      .filter(Boolean)
      .slice(0, MAX_PLAYERS);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    if (needsAgeGate && !ageConfirmed) {
      setError("Confirm everyone is 21+ and consents to adult-only content before creating this room.");
      return;
    }
    if (isSingleDevice) {
      const names = cleanLocalNames();
      if (names.length < 2) {
        setError("Add at least 2 players for a single device game.");
        return;
      }
      const code = `LOCAL-${Date.now()}`;
      const localPlayers = names.map((playerName, index) => ({
        id: localId("player"),
        room_code: code,
        name: playerName,
        join_order: index,
      }));
      const localRoom = {
        code,
        play_mode: "single_device",
        display_mode: playMode === "tv_only" ? "tv_only" : "pass_play",
        play_format: gameMode === "tiptoe" ? "teams" : "individual",
        game_mode: gameMode,
        category: gameMode === "tiptoe" ? topicPack : category,
        topic_pack: topicPack,
        timer_seconds: timerSeconds,
        room_locked: roomLock,
        status: "lobby",
        current_player_index: 0,
        current_prompt: null,
        current_type: null,
        created_at: new Date().toISOString(),
      };
      onLocalRoomCreated(localRoom, localPlayers, localPlayers[0]);
      return;
    }
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
      const roomPayload = {
        code,
        play_mode: "multiplayer",
        display_mode: playMode === "tv_phones" ? "tv_phones" : "multi_device",
        play_format: gameMode === "tiptoe" ? "teams" : "individual",
        game_mode: gameMode,
        category: gameMode === "tiptoe" ? topicPack : category,
        topic_pack: topicPack,
        timer_seconds: timerSeconds,
        room_locked: roomLock,
        content_schema_version: CONTENT_SCHEMA_VERSION,
        status: "lobby",
        current_player_index: 0,
      };
      let { error: roomErr } = await supabase.from("rooms").insert(roomPayload);
      if (roomErr) {
        const legacyPayload = {
          code,
          game_mode: gameMode,
          category: gameMode === "tiptoe" ? topicPack : category,
          status: "lobby",
          current_player_index: 0,
        };
        const fallback = await supabase.from("rooms").insert(legacyPayload);
        roomErr = fallback.error;
      }
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
          <div style={eyebrow}>{displayLabel}</div>
          <h2 style={sectionTitle}>{isSingleDevice ? "Set up the local game" : "Set up the room"}</h2>
        </div>

        <Field label={isSingleDevice ? "Host player" : "Your name"} htmlFor="create-name">
          <TextField id="create-name" value={name} onChange={setName} placeholder="Full name" autoFocus maxLength={32} />
        </Field>

        {isSingleDevice && (
          <Field label="Players">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {playerNames.map((playerName, index) => (
                <div key={index} style={{ display: "flex", gap: 8 }}>
                  <TextField
                    value={playerName}
                    onChange={(value) =>
                      setPlayerNames((names) => names.map((item, itemIndex) => (itemIndex === index ? value : item)))
                    }
                    placeholder={`Player ${index + 2}`}
                    maxLength={20}
                  />
                  {playerNames.length > 1 && (
                    <button
                      type="button"
                      style={miniBtn}
                      onClick={() => setPlayerNames((names) => names.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                disabled={cleanLocalNames().length >= MAX_PLAYERS}
                onClick={() => setPlayerNames((names) => [...names, ""])}
              >
                Add player
              </Button>
              <div style={{ ...hintText, textAlign: "left" }}>
                Enter everyone here. The phone gets passed to each player on their turn.
              </div>
            </div>
          </Field>
        )}

        <Field label="Game">
          <SegmentedControl
            options={GAME_OPTIONS}
            value={gameMode}
            onChange={(value) => {
              setGameMode(value);
              if (value === "tiptoe") setCategory(topicPack);
            }}
          />
        </Field>

        {gameMode !== "tiptoe" && <Field label="Content vibe">
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
        </Field>}

        {gameMode === "tiptoe" && (
          <>
            <Field label="Topic pack">
              <div style={{ display: "flex", gap: 10 }}>
                {TIPTOE_PACKS.map((pack) => (
                  <CategoryChip
                    key={pack.id}
                    label={pack.label}
                    accent={pack.accent}
                    active={topicPack === pack.id}
                    onClick={() => {
                      setTopicPack(pack.id);
                      setCategory(pack.id);
                    }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Round timer">
              <SegmentedControl
                options={[30, 45, 60, 90].map((seconds) => ({ id: String(seconds), label: `${seconds}s` }))}
                value={String(timerSeconds)}
                onChange={(value) => setTimerSeconds(Number(value))}
              />
            </Field>
          </>
        )}

        {!isSingleDevice && (
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={roomLock}
              onChange={(event) => setRoomLock(event.target.checked)}
            />
            <span>Lock room after start. Late joiners wait for host approval at a safe boundary.</span>
          </label>
        )}

        {needsAgeGate && (
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(event) => setAgeConfirmed(event.target.checked)}
            />
            <span>
              21+ only. Everyone can say no, stop any dare, and choose a non-alcoholic substitute.
            </span>
          </label>
        )}

        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}

        <Button
          accent={categoryAccent(category)}
          disabled={!name.trim() || (isSingleDevice && cleanLocalNames().length < 2) || (needsAgeGate && !ageConfirmed) || busy}
          onClick={handleCreate}
        >
          {busy ? "Creating..." : isSingleDevice ? "Create local game" : "Create room"}
        </Button>
      </div>
    </div>
  );
}

function JoinRoomScreen({ code, inviteToken, onJoined, onBack }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;
    let active = true;

    async function loadInviteLabel() {
      const { data } = await supabase
        .from("room_invites")
        .select("invitee_name")
        .eq("room_code", code)
        .eq("token", inviteToken)
        .maybeSingle();
      if (!active || !data) return;
      const firstName = firstNameOnly(data.invitee_name);
      setInviteLabel(firstName);
      if (firstName) setName(firstName);
    }

    loadInviteLabel();
    return () => {
      active = false;
    };
  }, [code, inviteToken]);

  async function handleJoin() {
    if ((!name.trim() && !inviteToken) || !ageConfirmed) return;
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
      if (room.room_locked && room.status !== "lobby") {
        setError("This room is locked during the active round. Ask the host to admit you at the next safe break.");
        setBusy(false);
        return;
      }
      try {
        const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "{}");
        if (saved?.roomCode === code && saved?.me?.id) {
          const { data: savedPlayer } = await supabase.from("players").select("*").eq("id", saved.me.id).maybeSingle();
          if (savedPlayer) {
            onJoined(code, savedPlayer);
            return;
          }
        }
      } catch (e) {
        // Continue with normal join if local persistence is unavailable.
      }
      let invite = null;
      if (inviteToken) {
        const { data: inviteRow, error: inviteErr } = await supabase
          .from("room_invites")
          .select("*")
          .eq("room_code", code)
          .eq("token", inviteToken)
          .maybeSingle();
        if (inviteErr) {
          setError("Invite tracking is not enabled yet. Ask the host to share the room code.");
          setBusy(false);
          return;
        }
        if (!inviteRow) {
          setError("This invite is no longer available. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        if (inviteRow.status === "canceled") {
          setError("This invite was canceled. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        if (inviteRow.status === "used" && inviteRow.used_by) {
          const { data: existingPlayer } = await supabase
            .from("players")
            .select("*")
            .eq("id", inviteRow.used_by)
            .maybeSingle();
          if (existingPlayer) {
            onJoined(code, existingPlayer);
            return;
          }
        }
        if (inviteRow.status !== "pending") {
          setError("This invite is no longer available. Ask the host for a new invite.");
          setBusy(false);
          return;
        }
        invite = inviteRow;
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
      const joinName = invite?.invitee_name ? firstNameOnly(invite.invitee_name) : cleanDisplayName(name);

      const nextOrder = roster.length;
      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({ room_code: code, name: joinName, join_order: nextOrder })
        .select()
        .single();
      if (playerErr) throw playerErr;
      if (invite?.id) {
        await supabase
          .from("room_invites")
          .update({ status: "used", used_at: new Date().toISOString(), used_by: player.id })
          .eq("id", invite.id);
      }

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
          <h2 style={sectionTitle}>{inviteLabel ? `Welcome, ${inviteLabel}` : "What's your name?"}</h2>
        </div>
        <Field label="Your name" htmlFor="join-name">
          <TextField id="join-name" value={name} onChange={setName} placeholder="Your first name" autoFocus maxLength={20} onEnter={handleJoin} />
        </Field>
        <label style={checkRow}>
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(event) => setAgeConfirmed(event.target.checked)}
          />
          <span>
            I am 21+ and understand consent is required for every adult prompt.
          </span>
        </label>
        {error && <div style={{ color: "#FF5A4E", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>{error}</div>}
        <Button accent="#34D6B0" disabled={(!name.trim() && !inviteToken) || !ageConfirmed || busy} onClick={handleJoin}>
          {busy ? "Joining..." : "Join room"}
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
  pendingInvites,
  invitesSupported,
  onStart,
  onReturnToGame,
  onLeave,
  onInvite,
  onCancelInvite,
  onCopyInvite,
  inviteStatus,
  onRoomSettingsChange,
  onRemovePlayer,
  onTransferHost,
  onAddLocalPlayer,
}) {
  const isHost = hostPlayerId(room, players) === me.id;
  const isSingleDevice = room.play_mode === "single_device";
  const cat = CONTENT.categories.find((c) => c.id === room.category) || TIPTOE_PACKS.find((pack) => pack.id === (room.topic_pack || room.category)) || CONTENT.categories[0];
  const latestPendingInvite = pendingInvites[0];
  const inviteUrl = inviteUrlFor(room.code, latestPendingInvite?.token);
  const [inviteeName, setInviteeName] = useState("");
  const [localPlayerName, setLocalPlayerName] = useState("");
  const [adultSettingsConfirmed, setAdultSettingsConfirmed] = useState(false);

  return (
    <div style={screenWrap}>
      <button onClick={onLeave} style={backBtn}>← Leave</button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }}>
          <div style={eyebrow}>{isSingleDevice ? DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label : "ROOM CODE"}</div>
          <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: "0.08em", color: cat?.accent }}>
            {isSingleDevice ? "PASS" : room.code}
          </div>
          <p style={{ color: "#9C97AE", fontSize: 14, marginTop: 6, fontFamily: "'Manrope', sans-serif" }}>
            {isSingleDevice ? "Enter everyone here, then pass the phone each turn" : "Share this code so others can join"}
          </p>
          <Pill
            text={isSingleDevice ? "On this device" : online ? "Connected" : "Offline - reconnecting"}
            accent={isSingleDevice || online ? "#34D6B0" : "#FFB84D"}
          />
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
                  {i === 0 && <span style={{ ...badge, background: cat?.accent }}>{isSingleDevice ? "FIRST" : "HOST"}</span>}
                  {isHost && !isSingleDevice && p.id !== me.id && (
                    <>
                      <button onClick={() => onTransferHost(p)} style={miniBtn}>Make host</button>
                      <button onClick={() => onRemovePlayer(p)} style={miniBtn}>Remove</button>
                    </>
                  )}
                  {isSingleDevice && players.length > 2 && p.id !== me.id && (
                    <button onClick={() => onRemovePlayer(p)} style={miniBtn}>Remove</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Pill text={GAME_OPTIONS.find((option) => option.id === room.game_mode)?.label || "Truth or Dare"} />
          <Pill text={room.game_mode === "tiptoe" ? `Pack: ${cat?.label}` : cat?.label} accent={cat?.accent} />
          <Pill text={DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label || "Multi-Device"} />
          <Pill text={roomPlayFormat(room) === "teams" ? "Teams" : "Individual"} />
        </div>

        {isSingleDevice && (
          <div style={{ display: "flex", gap: 8 }}>
            <TextField
              value={localPlayerName}
              onChange={setLocalPlayerName}
              placeholder="Add player"
              maxLength={20}
              ariaLabel="Add player"
            />
            <button
              type="button"
              style={miniBtn}
              disabled={!cleanDisplayName(localPlayerName) || players.length >= MAX_PLAYERS}
              onClick={() => {
                onAddLocalPlayer(localPlayerName);
                setLocalPlayerName("");
              }}
            >
              Add
            </button>
          </div>
        )}

        {!isSingleDevice && isHost && (
          <TextField
            value={inviteeName}
            onChange={(value) => setInviteeName(cleanDisplayName(value, 32))}
            placeholder="Invitee name"
            maxLength={24}
            ariaLabel="Invitee name"
          />
        )}
        {!isSingleDevice && (
          <>
            <Button
              variant="ghost"
              disabled={isHost && !cleanDisplayName(inviteeName)}
              onClick={() => {
                onInvite(inviteeName);
                setInviteeName("");
              }}
            >
              Create invite
            </Button>
            <div style={qrPanel}>
              <img src={qrUrlFor(room.code, latestPendingInvite?.token)} alt={`QR invite for room ${room.code}`} style={qrImage} />
              <div style={{ ...hintText, textAlign: "left" }}>
                {latestPendingInvite ? "Latest pending invite:" : "Create an invite to generate a cancelable link:"}
                <div style={linkText}>{inviteUrl}</div>
              </div>
            </div>
          </>
        )}
        {isSingleDevice && (
          <div style={invitePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>HOW IT WORKS</div>
            <div style={{ ...hintText, textAlign: "left" }}>
              Keep the phone on the table, tap start, and pass it to the highlighted player. The game is saved on this device if the screen locks.
            </div>
          </div>
        )}
        {inviteStatus && <div style={hintText}>{inviteStatus}</div>}
        {!isSingleDevice && isHost && (
          <div style={invitePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>PENDING INVITES</div>
            {!invitesSupported && (
              <div style={{ ...hintText, textAlign: "left" }}>
                Run the invite SQL migration to enable pending invite tracking.
              </div>
            )}
            {invitesSupported && pendingInvites.length === 0 && (
              <div style={{ ...hintText, textAlign: "left" }}>No pending invites.</div>
            )}
            {pendingInvites.map((invite) => (
              <div key={invite.id} style={inviteRow}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13 }}>
                    {firstNameOnly(invite.invitee_name)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
                  <button onClick={() => onCopyInvite(invite)} style={miniBtn}>Copy</button>
                  <button onClick={() => onCancelInvite(invite)} style={miniBtn}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isHost && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Game">
              <SegmentedControl
                options={GAME_OPTIONS}
                value={room.game_mode}
                onChange={(value) =>
                  onRoomSettingsChange({
                    game_mode: value,
                    play_format: value === "tiptoe" ? "teams" : "individual",
                    category: value === "tiptoe" ? (room.topic_pack || "party") : "mild",
                  })
                }
              />
            </Field>
            {room.game_mode !== "tiptoe" && <Field label="Content vibe">
              <div style={{ display: "flex", gap: 10 }}>
                {CONTENT.categories.map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.label.split(" / ")[0]}
                    accent={c.accent}
                    active={room.category === c.id}
                    onClick={() => {
                      if (isAdultCategory(c.id) && !adultSettingsConfirmed) return;
                      onRoomSettingsChange({ category: c.id });
                    }}
                  />
                ))}
              </div>
            </Field>}
            {room.game_mode === "tiptoe" && (
              <>
                <Field label="Topic pack">
                  <div style={{ display: "flex", gap: 10 }}>
                    {TIPTOE_PACKS.map((pack) => (
                      <CategoryChip
                        key={pack.id}
                        label={pack.label}
                        accent={pack.accent}
                        active={(room.topic_pack || room.category) === pack.id}
                        onClick={() => onRoomSettingsChange({ topic_pack: pack.id, category: pack.id })}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Timer">
                  <SegmentedControl
                    options={[30, 45, 60, 90].map((seconds) => ({ id: String(seconds), label: `${seconds}s` }))}
                    value={String(room.timer_seconds || TIPTOE_DEFAULT_SECONDS)}
                    onChange={(value) => onRoomSettingsChange({ timer_seconds: Number(value) })}
                  />
                </Field>
              </>
            )}
            <Field label="Display mode">
              <SegmentedControl
                options={isSingleDevice ? DISPLAY_MODE_OPTIONS.filter((option) => ["pass_play", "tv_only"].includes(option.id)) : DISPLAY_MODE_OPTIONS.filter((option) => ["multi_device", "tv_phones"].includes(option.id))}
                value={roomDisplayMode(room)}
                onChange={(value) => onRoomSettingsChange({ display_mode: value })}
              />
            </Field>
            <label style={checkRow}>
              <input
                type="checkbox"
                checked={Boolean(room.room_locked)}
                onChange={(event) => onRoomSettingsChange({ room_locked: event.target.checked })}
              />
              <span>
                Lock room while playing. Late joiners wait for the next safe boundary.
              </span>
            </label>
            {room.game_mode !== "tiptoe" && (
              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={adultSettingsConfirmed}
                  onChange={(event) => setAdultSettingsConfirmed(event.target.checked)}
                />
                <span>
                  Unlock 21+ packs. Ask once, accept no, and allow non-alcoholic substitutes.
                </span>
              </label>
            )}
          </div>
        )}

        {isHost ? (
          <Button
            accent={cat?.accent}
            disabled={room.status !== "playing" && players.length < 2}
            onClick={room.status === "playing" ? onReturnToGame : onStart}
          >
            {room.status === "playing" || room.status === "paused" ? "Return to game" : players.length < 2 ? "Waiting for more players..." : "Start game"}
          </Button>
        ) : (
          <div style={{ textAlign: "center", color: "#9C97AE", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>
            Waiting for the host to start...
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
  tiptoeScore,
  onAction,
  onLeave,
  onInvite,
  onEndGame,
  onBackToLobby,
  onPauseGame,
  onResumeGame,
  onSkipPlayer,
  onRemovePlayer,
  onShareRecap,
  inviteStatus,
  busy,
}) {
  const cat = CONTENT.categories.find((c) => c.id === room.category) || TIPTOE_PACKS.find((pack) => pack.id === (room.topic_pack || room.category)) || CONTENT.categories[0];
  const isSingleDevice = room.play_mode === "single_device";
  const currentPlayer = players[room.current_player_index % players.length];
  const isMyTurn = isSingleDevice || currentPlayer?.id === me.id;
  const hasPrompt = !!room.current_prompt;
  const isPaused = room.status === "paused";
  const isPenalty = room.current_type === "penalty";
  const isPenaltyLike = room.current_type === "penalty" || room.current_type === "consequence";
  const isHost = hostPlayerId(room, players) === me.id;
  const currentPrompt = decodePrompt(room.current_prompt);
  const [flipped, setFlipped] = useState(false);
  const [tiptoeSecondsLeft, setTiptoeSecondsLeft] = useState(room.timer_seconds || TIPTOE_DEFAULT_SECONDS);
  const isTiptoe = room.game_mode === "tiptoe";
  const tvMode = isTvMode(room);
  const displayModeLabel = DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label || "Multi-Device";
  const currentTeam = isTiptoe ? (room.current_player_index % 2 === 0 ? "Team A" : "Team B") : null;

  useEffect(() => {
    setFlipped(false);
    if (hasPrompt) {
      const t = setTimeout(() => setFlipped(true), 60);
      return () => clearTimeout(t);
    }
  }, [room.current_prompt, room.current_type]);

  useEffect(() => {
    if (!isTiptoe || isPaused || !hasPrompt) {
      setTiptoeSecondsLeft(room.timer_seconds || TIPTOE_DEFAULT_SECONDS);
      return;
    }
    setTiptoeSecondsLeft(room.timer_seconds || TIPTOE_DEFAULT_SECONDS);
    const timer = setInterval(() => {
      setTiptoeSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTiptoe, isPaused, hasPrompt, room.current_prompt, room.timer_seconds]);

  const accent = cat?.accent || "#34D6B0";

  return (
    <div style={screenWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button onClick={onLeave} style={backBtn}>Leave</button>
        {isSingleDevice ? (
          <button onClick={onBackToLobby} style={backBtn}>Lobby</button>
        ) : (
          <button onClick={onInvite} style={backBtn}>Invite</button>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 0, marginBottom: 4 }}>
        <Pill text={displayModeLabel} accent={isSingleDevice ? "#FFB84D" : "#34D6B0"} />
        <Pill text={GAME_OPTIONS.find((option) => option.id === room.game_mode)?.label || "Truth or Dare"} />
        <Pill text={isTiptoe ? `Pack: ${cat?.label}` : cat?.label} accent={accent} style={{ marginLeft: 8 }} />
        {!isSingleDevice && <Pill text={online ? "Connected" : "Offline - reconnecting"} accent={online ? "#34D6B0" : "#FFB84D"} style={{ marginLeft: 8 }} />}
        {isPaused && <Pill text="Paused" accent="#FFB84D" style={{ marginLeft: 8 }} />}
      </div>
      {inviteStatus && <div style={hintText}>{inviteStatus}</div>}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 28 }}>
        <div style={{ textAlign: "center" }} aria-live="polite">
          <div style={eyebrow}>{isTiptoe ? currentTeam : isSingleDevice ? "PASS TO" : isMyTurn ? "YOUR TURN" : "CURRENT TURN"}</div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: accent }}>
            {isTiptoe ? `${currentPlayer?.name || "Guesser"} guesses` : currentPlayer?.name}
          </div>
          {isTiptoe && (
            <div style={{ ...hintText, marginTop: 8 }}>
              {tvMode ? "Guesser turns away from the TV." : "Do not show this card to the guesser."}
            </div>
          )}
        </div>

        <div style={{ perspective: 1200, width: "100%", maxWidth: tvMode ? 720 : 380, height: isTiptoe ? (tvMode ? 390 : 340) : 300 }} role="region" aria-label="Current prompt card">
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
              {hasPrompt && isTiptoe ? (
                <div>
                  <div style={{ ...eyebrow, color: accent, marginBottom: 8 }}>TIPTOE TARGET</div>
                  <div style={{ fontSize: tvMode ? 52 : 34, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.05, color: "#F8F3E8" }}>
                    {currentPrompt?.target || promptText(currentPrompt)}
                  </div>
                  <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {(currentPrompt?.forbidden || []).map((word) => (
                      <span key={word} style={{ ...badge, background: "#FF5A4E", color: "#0B0B10", fontSize: 12 }}>
                        {word}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, fontSize: tvMode ? 54 : 42, fontFamily: "'Sora', sans-serif", fontWeight: 800, color: tiptoeSecondsLeft <= 10 ? "#FF5A4E" : "#FFB84D" }}>
                    {tiptoeSecondsLeft}s
                  </div>
                </div>
              ) : hasPrompt ? (
                <div>
                  <div style={{ ...eyebrow, color: accent, marginBottom: 10 }}>
                    {room.current_type === "consequence" ? "RIGHT-SIDE CONSEQUENCE" : isPenalty ? "PENALTY" : room.current_type?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", lineHeight: 1.35, color: "#F4F2FA" }}>
                    {promptText(currentPrompt)}
                  </div>
                  {currentPrompt?.penalty?.count && (
                    <div style={promptMetaLine}>
                      Penalty: {currentPrompt.penalty.count} {currentPrompt.penalty.count === 1 ? "shot" : "shots"}
                    </div>
                  )}
                  {currentPrompt?.warning && (
                    <div style={{ ...promptMetaLine, color: "#FFB84D" }}>
                      {currentPrompt.warning}
                    </div>
                  )}
                  {currentPrompt?.consequence && (
                    <div style={promptMetaLine}>
                      No extra alcohol. No forced touching, kissing, exposure, recording, or humiliation.
                    </div>
                  )}
                  {currentPrompt?.requires_consent && (
                    <div style={promptMetaLine}>
                      Ask once. If they say no, move on. You take the penalty.
                    </div>
                  )}
                  {(currentPrompt?.requires_self_consent || currentPrompt?.adult_body_reveal || currentPrompt?.clothing_removal) && (
                    <div style={promptMetaLine}>
                      You choose what you consent to. No one else chooses for you.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "#807C92", fontFamily: "'Manrope', sans-serif", fontSize: 15 }}>
                  {isPaused ? "Paused. Resume when everyone is ready." : isTiptoe ? "Start the next Tiptoe card" : isMyTurn ? "Pick truth or dare below" : "Waiting for their pick..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: 18 }}>
        {isAdultCategory(room.category) && (
          <div style={{ ...hintText, marginBottom: 10 }}>
            21+ only. Say no without penalty. Water, soda, or any non-alcoholic drink can replace shots.
          </div>
        )}
        {isPaused && (
          <Button accent={accent} disabled={busy} onClick={onResumeGame}>Resume game</Button>
        )}
        {!isPaused && isHost && !hasPrompt && isTiptoe && (
          <Button accent={accent} disabled={busy} onClick={() => onAction("draw", "tiptoe")}>Start Tiptoe card</Button>
        )}
        {!isPaused && isHost && hasPrompt && isTiptoe && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Button accent="#34D6B0" disabled={busy} onClick={() => onAction("tiptoe_correct")}>Correct +1</Button>
              <Button variant="outline" accent="#FFB84D" disabled={busy} onClick={() => onAction("tiptoe_pass")}>Pass 0</Button>
            </div>
            <Button variant="outline" accent="#FF5A4E" disabled={busy} onClick={() => onAction("tiptoe_forbidden")}>Forbidden -1</Button>
            <Button accent={accent} disabled={busy} onClick={() => onAction("next")}>Next team</Button>
          </div>
        )}
        {!isPaused && isMyTurn && !hasPrompt && room.game_mode === "truth_dare" && (
          <div style={{ display: "flex", gap: 12 }}>
            <Button accent="#34D6B0" disabled={busy} onClick={() => onAction("draw", "truth")}>Truth</Button>
            <Button accent="#FF5A4E" disabled={busy} onClick={() => onAction("draw", "dare")}>Dare</Button>
          </div>
        )}
        {!isPaused && isMyTurn && !hasPrompt && room.game_mode === "questions" && (
          <Button accent={accent} disabled={busy} onClick={() => onAction("draw", "question")}>Draw a question</Button>
        )}
        {!isPaused && isMyTurn && hasPrompt && !isTiptoe && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!isPenaltyLike && (
              <Button variant="outline" accent="#FFB84D" disabled={busy} onClick={() => onAction("penalty")}>
                Refused / failed
              </Button>
            )}
            <Button accent={accent} disabled={busy} onClick={() => onAction("next")}>Done - next player</Button>
          </div>
        )}
        {!isPaused && !isMyTurn && (
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
              <Button variant="ghost" disabled={busy} onClick={onPauseGame}>Pause</Button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="ghost" disabled={busy} onClick={onBackToLobby}>Lobby</Button>
              <Button variant="outline" accent="#FF5A4E" disabled={busy} onClick={onEndGame}>End for everyone</Button>
            </div>
          </div>
        )}
        {isTiptoe && (
          <div style={scorePanel}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>SCORE</div>
            <div style={scoreRow}><span>Team A</span><span>{tiptoeScore.teamA}</span></div>
            <div style={scoreRow}><span>Team B</span><span>{tiptoeScore.teamB}</span></div>
          </div>
        )}
        {!isTiptoe && score.length > 0 && (
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

const promptMetaLine = {
  marginTop: 10,
  color: "#D8D3E6",
  fontSize: 12,
  lineHeight: 1.35,
  fontFamily: "'Manrope', sans-serif",
};

const checkRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  color: "#D8D3E6",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 13,
  lineHeight: 1.4,
};

// ---- Layout tokens --------------------------------------------------------

const screenWrap = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 25% 10%, #263044 0, #11131E 34%, #07070B 100%)",
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
  fontSize: 58,
  letterSpacing: "0",
  margin: 0,
  lineHeight: 0.96,
  color: "#F8F3E8",
};

const heroCopy = {
  color: "#CFC8DD",
  fontSize: 15,
  lineHeight: 1.55,
  marginTop: 14,
  fontFamily: "'Manrope', sans-serif",
};

const ambientStage = {
  position: "relative",
  height: 310,
  margin: "8px 0 24px",
  borderRadius: 24,
  overflow: "hidden",
  background: "#08070B",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 28px 80px rgba(0,0,0,0.52)",
};

const heroPhoto = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center",
  transform: "scale(1.02)",
};

const heroPhotoShade = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(7,7,11,0.08) 0%, rgba(7,7,11,0.18) 42%, rgba(7,7,11,0.86) 100%)",
};

const heroGlassCard = {
  position: "absolute",
  right: 18,
  top: 18,
  width: 116,
  height: 156,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "linear-gradient(160deg, rgba(8,7,11,0.78), rgba(255,90,78,0.22))",
  backdropFilter: "blur(8px)",
  boxShadow: "0 22px 55px rgba(0,0,0,0.46)",
  color: "#F8F3E8",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 15,
  boxSizing: "border-box",
};

const heroAgeBadge = {
  position: "absolute",
  left: 18,
  top: 18,
  borderRadius: 999,
  padding: "7px 12px",
  background: "rgba(8,7,11,0.72)",
  border: "1px solid rgba(255,255,255,0.22)",
  color: "#FFB84D",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const heroPhotoCaption = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 18,
};

const heroPhotoTitle = {
  color: "#F8F3E8",
  fontFamily: "'Sora', sans-serif",
  fontSize: 27,
  fontWeight: 800,
  letterSpacing: 0,
  textShadow: "0 12px 28px rgba(0,0,0,0.62)",
};

const heroCardBase = {
  position: "absolute",
  width: 150,
  height: 205,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 24px 45px rgba(0,0,0,0.38)",
};

const heroCardBack = {
  ...heroCardBase,
  right: 42,
  top: 30,
  transform: "rotate(15deg)",
  background: "linear-gradient(160deg, #33215A, #10131F)",
};

const heroCardMid = {
  ...heroCardBase,
  right: 105,
  top: 24,
  transform: "rotate(-12deg)",
  background: "linear-gradient(160deg, #173E39, #0D111C)",
};

const heroCardFront = {
  ...heroCardBase,
  left: 32,
  top: 22,
  background: "linear-gradient(160deg, #F8F3E8, #D8C7A0)",
  color: "#0B0B10",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 18,
  boxSizing: "border-box",
};

const heroCardMark = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 48,
  fontWeight: 800,
  lineHeight: 1,
};

const heroCardRule = {
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const heroCardRuleAlt = {
  ...heroCardRule,
  alignSelf: "flex-end",
  color: "#FF5A4E",
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

const mutedSmallText = {
  color: "#9C97AE",
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  lineHeight: 1.35,
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

const invitePanel = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 12,
};

const inviteRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: "10px 0",
};

// ---- Root app ---------------------------------------------------------

export default function App() {
  const [view, setView] = useState("home"); // home | create | join | lobby | game
  const [selectedPlayMode, setSelectedPlayMode] = useState("multiplayer");
  const [joinCode, setJoinCode] = useState(null);
  const [inviteToken, setInviteToken] = useState(null);
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
  const [roundPenaltyCounts, setRoundPenaltyCounts] = useState({});
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesSupported, setInvitesSupported] = useState(true);
  const [hasSavedLocal, setHasSavedLocal] = useState(false);

  // Restore session on mount (handles phone lock / tab reload mid-game)
  useEffect(() => {
    try {
      const invitedRoom = new URLSearchParams(window.location.search).get("room");
      if (invitedRoom) {
        const token = new URLSearchParams(window.location.search).get("invite");
        setJoinCode(invitedRoom.toUpperCase().slice(0, 4));
        setInviteToken(token);
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
      setHasSavedLocal(Boolean(localStorage.getItem(LOCAL_GAME_KEY)));
    } catch (e) {
      // sessionStorage unavailable - proceed without persistence
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
    if (room?.play_mode !== "single_device" || !roomCode || !me) return;
    try {
      localStorage.setItem(LOCAL_GAME_KEY, JSON.stringify({ room, players, me, view }));
      setHasSavedLocal(true);
    } catch (e) {
      // ignore storage errors
    }
  }, [room, players, me, roomCode, view]);

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
    const style = document.createElement("style");
    style.textContent = `
      :focus-visible { outline: 4px solid #FFB84D !important; outline-offset: 4px !important; }
      button, input { min-height: 44px; }
      body { margin: 0; background: #07070B; }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
      @media (orientation: landscape) and (min-width: 760px) {
        #root > div { max-width: 1180px !important; padding: 42px 72px !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    let wakeLock = null;
    async function requestWakeLock() {
      if (!("wakeLock" in navigator) || view !== "game") return;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (e) {
        // Wake Lock is best-effort across browsers and Android WebViews.
      }
    }
    requestWakeLock();
    return () => {
      wakeLock?.release?.();
    };
  }, [view]);

  // Subscribe to room + players once we have a roomCode
  useEffect(() => {
    if (!roomCode || room?.play_mode === "single_device" || !supabase) return;

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
      if (r?.status === "playing" || r?.status === "paused") setView("game");
      else setView("lobby");
    }
    loadInitial();

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` }, (payload) => {
        if (payload.eventType === "DELETE") return;
        setRoom(payload.new);
        if (payload.new.status === "playing" || payload.new.status === "paused") setView("game");
        else setView("lobby");
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
    if (!roomCode || room?.play_mode === "single_device" || !supabase) {
      setPendingInvites([]);
      return;
    }

    let active = true;

    async function loadInvites() {
      const { data, error } = await supabase
        .from("room_invites")
        .select("*")
        .eq("room_code", roomCode)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setInvitesSupported(false);
        setPendingInvites([]);
        return;
      }
      setInvitesSupported(true);
      setPendingInvites(data || []);
    }

    loadInvites();

    const channel = supabase
      .channel(`room-invites-${roomCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_invites", filter: `room_code=eq.${roomCode}` }, loadInvites)
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
      const savedCounts = localStorage.getItem(`td_round_penalties_${roomCode}`);
      setRoundPenaltyCounts(savedCounts ? JSON.parse(savedCounts) : {});
    } catch (e) {
      setActivityLog([]);
      setRoundPenaltyCounts({});
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

  useEffect(() => {
    if (!roomCode) return;
    try {
      localStorage.setItem(`td_round_penalties_${roomCode}`, JSON.stringify(roundPenaltyCounts));
    } catch (e) {
      // ignore storage errors
    }
  }, [roundPenaltyCounts, roomCode]);

  const penaltyScore = activityLog
    .filter((entry) => entry.type === "penalty")
    .reduce((acc, entry) => {
      acc[entry.player] = (acc[entry.player] || 0) + entry.shots;
      return acc;
    }, {});
  const score = Object.entries(penaltyScore)
    .map(([name, shots]) => ({ name, shots }))
    .sort((a, b) => b.shots - a.shots);
  const tiptoeScore = activityLog
    .filter((entry) => entry.type === "tiptoe_score")
    .reduce(
      (acc, entry) => {
        if (entry.team === "Team A") acc.teamA += entry.points;
        if (entry.team === "Team B") acc.teamB += entry.points;
        return acc;
      },
      { teamA: 0, teamB: 0 },
    );

  function handleRoomCreated(code, player) {
    setMe(player);
    setRoomCode(code);
  }

  function handleLocalRoomCreated(localRoom, localPlayers, localMe) {
    setSelectedPlayMode("single_device");
    setMe(localMe);
    setRoomCode(localRoom.code);
    setRoom(localRoom);
    setPlayers(localPlayers);
    setPendingInvites([]);
    setInviteStatus("");
    setRoundPenaltyCounts({});
    setActivityLog([]);
    setView("lobby");
  }

  function handleResumeLocalGame() {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_GAME_KEY) || "");
      if (!saved?.room || !saved?.players?.length || !saved?.me) {
        setHasSavedLocal(false);
        setInstallStatus("No saved single device game found.");
        return;
      }
      setSelectedPlayMode("single_device");
      setRoom(saved.room);
      setPlayers(saved.players);
      setMe(saved.me);
      setRoomCode(saved.room.code);
      setPendingInvites([]);
      setInviteStatus("Single device game restored.");
      setView(saved.room.status === "lobby" ? "lobby" : "game");
    } catch (e) {
      setHasSavedLocal(false);
      setInstallStatus("No saved single device game found.");
    }
  }

  function handleJoined(code, player) {
    setMe(player);
    setRoomCode(code);
    setInviteToken(null);
  }

  async function handleStart() {
    setRoundPenaltyCounts({});
    setView("game");
    if (room?.play_mode === "single_device") {
      setRoom((current) => ({
        ...current,
        status: "playing",
        current_player_index: 0,
        current_prompt: null,
        current_type: null,
        session_started_at: new Date().toISOString(),
      }));
      return;
    }
    const { error } = await supabase
      .from("rooms")
      .update({
        status: "playing",
        current_player_index: 0,
        current_prompt: null,
        current_type: null,
        session_started_at: new Date().toISOString(),
        content_schema_version: CONTENT_SCHEMA_VERSION,
      })
      .eq("code", roomCode);
    if (error) {
      await supabase
        .from("rooms")
        .update({ status: "playing", current_player_index: 0, current_prompt: null, current_type: null })
        .eq("code", roomCode);
    }
  }

  async function handleEndGame() {
    if (actionInFlight) return;
    setActionInFlight(true);
    try {
      if (room?.play_mode === "single_device") {
        setRoom((current) => ({
          ...current,
          status: "lobby",
          current_player_index: 0,
          current_prompt: null,
          current_type: null,
        }));
        setRoundPenaltyCounts({});
        setView("lobby");
        return;
      }
      await supabase
        .from("rooms")
        .update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })
        .eq("code", roomCode);
      setView("lobby");
    } finally {
      setActionInFlight(false);
    }
  }

  function handleBackToLobby() {
    setView("lobby");
  }

  function handleReturnToGame() {
    setView("game");
  }

  async function handlePauseGame() {
    if (actionInFlight || !room) return;
    setActionInFlight(true);
    try {
      if (room.play_mode === "single_device") {
        setRoom((current) => ({ ...current, status: "paused" }));
        return;
      }
      await supabase.from("rooms").update({ status: "paused" }).eq("code", roomCode);
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleResumeGame() {
    if (actionInFlight || !room) return;
    setActionInFlight(true);
    try {
      if (room.play_mode === "single_device") {
        setRoom((current) => ({ ...current, status: "playing" }));
        return;
      }
      await supabase.from("rooms").update({ status: "playing" }).eq("code", roomCode);
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleRoomSettingsChange(nextSettings) {
    if (!roomCode) return;
    if (room?.play_mode === "single_device") {
      setRoom((current) => ({
        ...current,
        ...nextSettings,
        current_prompt: null,
        current_type: null,
        current_player_index: 0,
      }));
      return;
    }
    const { error } = await supabase
      .from("rooms")
      .update({ ...nextSettings, current_prompt: null, current_type: null, current_player_index: 0 })
      .eq("code", roomCode);
    if (error) {
      const legacySettings = Object.fromEntries(
        Object.entries(nextSettings).filter(([key]) => ["game_mode", "category"].includes(key)),
      );
      await supabase
        .from("rooms")
        .update({ ...legacySettings, current_prompt: null, current_type: null, current_player_index: 0 })
        .eq("code", roomCode);
    }
  }

  async function handleInvite(inviteeName = "") {
    if (room?.play_mode === "single_device") {
      setInviteStatus("Single device games stay on this phone. Add players in the lobby.");
      return;
    }
    if (!roomCode) return;
    let token = randomInviteToken();
    let label = cleanDisplayName(inviteeName);
    if (!label) {
      label = cleanDisplayName(window.prompt("Invitee name") || "");
    }
    if (!label) {
      setInviteStatus("Enter an invitee first name before creating an invite.");
      return;
    }
    if (invitesSupported) {
      const { data, error } = await supabase
        .from("room_invites")
        .insert({ room_code: roomCode, token, invitee_name: label || null, created_by: me?.id || null })
        .select()
        .single();
      if (error) {
        setInvitesSupported(false);
        setInviteStatus("Invite tracking is not enabled yet. Sharing the room code link instead.");
        token = null;
      } else {
        token = data.token;
        setPendingInvites((invites) => [data, ...invites]);
      }
    }
    const url = inviteUrlFor(roomCode, token);
    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Truth/Dare room", text, url });
        setInviteStatus(token ? "Pending invite created and share sheet opened." : "Room link share sheet opened.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setInviteStatus(token ? "Pending invite created and link copied." : "Room link copied.");
      } else {
        setInviteStatus(text);
      }
    } catch (e) {
      setInviteStatus(text);
    }
  }

  async function handleCancelInvite(invite) {
    if (!invite?.id) return;
    const { error } = await supabase
      .from("room_invites")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("id", invite.id)
      .eq("status", "pending");
    if (error) {
      setInviteStatus("Couldn't cancel that invite. Check the invite SQL migration.");
      return;
    }
    setPendingInvites((invites) => invites.filter((item) => item.id !== invite.id));
    setInviteStatus("Invite canceled.");
  }

  async function handleCopyInvite(invite) {
    const url = inviteUrlFor(roomCode, invite?.token);
    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;
    try {
      if (navigator.clipboard?.writeText) {
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
      if (room?.play_mode === "single_device") {
        const nextPlayers = players.filter((item) => item.id !== player.id);
        if (nextPlayers.length < 2) {
          setInviteStatus("Keep at least 2 players in a single device game.");
          return;
        }
        setPlayers(nextPlayers);
        setRoom((current) => {
          const currentIndex = current.current_player_index % players.length;
          const removedIndex = players.findIndex((item) => item.id === player.id);
          const nextIndex = removedIndex > -1 && removedIndex <= currentIndex ? Math.max(0, currentIndex - 1) : currentIndex;
          return {
            ...current,
            current_player_index: nextIndex % nextPlayers.length,
            current_prompt: null,
            current_type: null,
          };
        });
        return;
      }
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

  function handleAddLocalPlayer(playerName) {
    if (room?.play_mode !== "single_device") return;
    const name = cleanDisplayName(playerName);
    if (!name) return;
    if (players.length >= MAX_PLAYERS) {
      setInviteStatus(`Single device games support up to ${MAX_PLAYERS} players.`);
      return;
    }
    setPlayers((items) => [
      ...items,
      {
        id: localId("player"),
        room_code: room.code,
        name,
        join_order: items.length,
      },
    ]);
    setInviteStatus(`${name} added.`);
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
      `${room?.play_mode === "single_device" ? "Single device" : `Room ${roomCode}`} recap`,
      `Players: ${players.map((player) => player.name).join(", ") || "None"}`,
      score.length ? `Penalties: ${score.map((entry) => `${entry.name} ${entry.shots}`).join(", ")}` : "Penalties: none",
      room?.play_mode === "single_device" ? "Mode: pass-the-phone" : `Invite: ${inviteUrlFor(roomCode)}`,
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
      if (room?.play_mode === "single_device") {
        if (action === "draw") {
          const prompt = pickSmartPrompt(room, kind, players.length);
          setRoom((current) => ({ ...current, current_prompt: encodePrompt(prompt), current_type: kind }));
        } else if (action.startsWith("tiptoe_")) {
          const points = action === "tiptoe_correct" ? 1 : action === "tiptoe_forbidden" ? -1 : 0;
          const team = room.current_player_index % 2 === 0 ? "Team A" : "Team B";
          setActivityLog((entries) => [
            {
              type: "tiptoe_score",
              team,
              points,
              card: decodePrompt(room.current_prompt)?.target || promptText(decodePrompt(room.current_prompt)),
              at: new Date().toISOString(),
            },
            ...entries,
          ].slice(0, 40));
        } else if (action === "penalty") {
          const activePlayer = players[room.current_player_index % players.length];
          const playerId = activePlayer?.id || currentPlayerName();
          const currentCount = roundPenaltyCounts[playerId] || 0;
          const prompt = decodePrompt(room.current_prompt);
          const shotCount = prompt?.penalty?.count || shotCountFromPenalty(penaltyTextFor(room.current_type)) || 1;
          const isFourthPenalty = currentCount >= MAX_ROUND_SHOT_PENALTIES;
          const rightSidePlayer = players[(room.current_player_index + 1) % players.length];
          const penaltyPrompt = isFourthPenalty
            ? {
                text: `You have reached ${MAX_ROUND_SHOT_PENALTIES} penalties this round. ${rightSidePlayer?.name || "The player to your right"} now assigns a consent-safe consequence.`,
                consequence: true,
                rules: CONTENT.globalRules.penalty_tracking?.on_fourth_penalty?.rules || [],
              }
            : {
                text: `${currentPlayerName()} takes ${shotCount} ${shotCount === 1 ? "shot" : "shots"}.`,
                penalty: { type: "shots", count: shotCount },
                warning: currentCount + 1 === 2 ? `${currentPlayerName()} has 2 penalties this round.` : null,
              };
          setRoom((current) => ({
            ...current,
            current_prompt: encodePrompt(penaltyPrompt),
            current_type: isFourthPenalty ? "consequence" : "penalty",
          }));
          if (!isFourthPenalty) {
            setRoundPenaltyCounts((counts) => ({ ...counts, [playerId]: currentCount + 1 }));
          }
          setActivityLog((entries) => [
            {
              type: isFourthPenalty ? "consequence" : "penalty",
              player: currentPlayerName(),
              shots: isFourthPenalty ? 0 : shotCount,
              text: penaltyPrompt.text,
              at: new Date().toISOString(),
            },
            ...entries,
          ].slice(0, 30));
        } else if (action === "next") {
          const expectedIndex = room.current_player_index;
          const nextIndex = (expectedIndex + 1) % players.length;
          if (nextIndex === 0) setRoundPenaltyCounts({});
          setRoom((current) => ({
            ...current,
            current_prompt: null,
            current_type: null,
            current_player_index: nextIndex,
          }));
        }
        return;
      }
      if (action === "draw") {
        // Only succeeds if the room is still in the state we expect (no prompt drawn yet).
        // Prevents a double-tap from drawing two prompts in a row.
        const prompt = pickSmartPrompt(room, kind, players.length);
        const { error } = await supabase
          .from("rooms")
          .update({ current_prompt: encodePrompt(prompt), current_type: kind, current_prompt_id: prompt.id || null })
          .eq("code", roomCode)
          .is("current_prompt", null);
        if (error) {
          await supabase
            .from("rooms")
            .update({ current_prompt: encodePrompt(prompt), current_type: kind })
            .eq("code", roomCode)
            .is("current_prompt", null);
        }
      } else if (action.startsWith("tiptoe_")) {
        const points = action === "tiptoe_correct" ? 1 : action === "tiptoe_forbidden" ? -1 : 0;
        const team = room.current_player_index % 2 === 0 ? "Team A" : "Team B";
        setActivityLog((entries) => [
          {
            type: "tiptoe_score",
            team,
            points,
            card: decodePrompt(room.current_prompt)?.target || promptText(decodePrompt(room.current_prompt)),
            at: new Date().toISOString(),
          },
          ...entries,
        ].slice(0, 40));
      } else if (action === "penalty") {
        const activePlayer = players[room.current_player_index % players.length];
        const playerId = activePlayer?.id || currentPlayerName();
        const currentCount = roundPenaltyCounts[playerId] || 0;
        const prompt = decodePrompt(room.current_prompt);
        const shotCount = prompt?.penalty?.count || shotCountFromPenalty(penaltyTextFor(room.current_type)) || 1;
        const isFourthPenalty = currentCount >= MAX_ROUND_SHOT_PENALTIES;
        const rightSidePlayer = players[(room.current_player_index + 1) % players.length];
        const penaltyPrompt = isFourthPenalty
          ? {
              text: `You have reached ${MAX_ROUND_SHOT_PENALTIES} penalties this round. ${rightSidePlayer?.name || "The player to your right"} now assigns a consent-safe consequence.`,
              consequence: true,
              rules: CONTENT.globalRules.penalty_tracking?.on_fourth_penalty?.rules || [],
            }
          : {
              text: `${currentPlayerName()} takes ${shotCount} ${shotCount === 1 ? "shot" : "shots"}.`,
              penalty: { type: "shots", count: shotCount },
              warning: currentCount + 1 === 2 ? `${currentPlayerName()} has 2 penalties this round.` : null,
            };
        await supabase
          .from("rooms")
          .update({ current_prompt: encodePrompt(penaltyPrompt), current_type: isFourthPenalty ? "consequence" : "penalty" })
          .eq("code", roomCode)
          .eq("current_player_index", room.current_player_index);
        if (!isFourthPenalty) {
          setRoundPenaltyCounts((counts) => ({ ...counts, [playerId]: currentCount + 1 }));
        }
        setActivityLog((entries) => [
          {
            type: isFourthPenalty ? "consequence" : "penalty",
            player: currentPlayerName(),
            shots: isFourthPenalty ? 0 : shotCount,
            text: penaltyPrompt.text,
            at: new Date().toISOString(),
          },
          ...entries,
        ].slice(0, 30));
      } else if (action === "next") {
        // Only succeeds if current_player_index still matches what this client saw.
        // Prevents a double-tap (or stale retry) from advancing the turn twice.
        const expectedIndex = room.current_player_index;
        const nextIndex = (expectedIndex + 1) % players.length;
        if (nextIndex === 0) setRoundPenaltyCounts({});
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

  function currentPlayerName() {
    return players[room.current_player_index % players.length]?.name || "Player";
  }

  function handleLocalExit() {
    setView("home");
    setRoomCode(null);
    setRoom(null);
    setPlayers([]);
    setMe(null);
    setInviteToken(null);
    setPendingInvites([]);
    setInviteStatus("");
    setHasSavedLocal(Boolean(localStorage.getItem(LOCAL_GAME_KEY)));
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // ignore
    }
  }

  async function handleLeave() {
    if (room?.play_mode === "single_device") {
      setView("home");
      setInviteStatus("");
      setHasSavedLocal(true);
      return;
    }
    const player = me;
    if (player?.id && supabase) {
      await handleRemovePlayer(player);
      return;
    }
    handleLocalExit();
  }

  if (view === "home") {
    return (
      <HomeScreen
        onCreate={(playMode) => {
          if ((playMode === "multiplayer" || playMode === "tv_phones") && !hasSupabaseConfig) {
            setInstallStatus("Multi-device rooms need Supabase config. Pass & Play and TV Only work locally.");
            return;
          }
          setSelectedPlayMode(playMode);
          setView("create");
        }}
        onJoin={(code) => {
          if (!hasSupabaseConfig) {
            setInstallStatus("Joining rooms needs Supabase config. Single device works on this phone.");
            return;
          }
          setJoinCode(code);
          setInviteToken(null);
          setView("join");
        }}
        onInstall={handleInstall}
        installStatus={installStatus}
        canInstall={Boolean(installPrompt)}
        hasSavedLocal={hasSavedLocal}
        onResumeLocal={handleResumeLocalGame}
      />
    );
  }

  if (view === "create") {
    return (
      <CreateRoomScreen
        playMode={selectedPlayMode}
        onRoomCreated={handleRoomCreated}
        onLocalRoomCreated={handleLocalRoomCreated}
        onBack={() => setView("home")}
      />
    );
  }

  if (!hasSupabaseConfig && selectedPlayMode !== "single_device" && selectedPlayMode !== "tv_only") {
    return <ConfigScreen />;
  }

  if (view === "join") {
    return <JoinRoomScreen code={joinCode} inviteToken={inviteToken} onJoined={handleJoined} onBack={() => setView("home")} />;
  }

  if (view === "lobby" && room) {
    return (
      <LobbyScreen
        room={room}
        players={players}
        me={me}
        online={online}
        pendingInvites={pendingInvites}
        invitesSupported={invitesSupported}
        onStart={handleStart}
        onReturnToGame={handleReturnToGame}
        onLeave={handleLeave}
        onInvite={handleInvite}
        onCancelInvite={handleCancelInvite}
        onCopyInvite={handleCopyInvite}
        inviteStatus={inviteStatus}
        onRoomSettingsChange={handleRoomSettingsChange}
        onRemovePlayer={handleRemovePlayer}
        onTransferHost={handleTransferHost}
        onAddLocalPlayer={handleAddLocalPlayer}
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
        tiptoeScore={tiptoeScore}
        onAction={handleAction}
        onLeave={handleLeave}
        onInvite={handleInvite}
        onEndGame={handleEndGame}
        onBackToLobby={handleBackToLobby}
        onPauseGame={handlePauseGame}
        onResumeGame={handleResumeGame}
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
      <div style={{ color: "#9C97AE", fontFamily: "'Manrope', sans-serif" }}>Loading...</div>
    </div>
  );
}


