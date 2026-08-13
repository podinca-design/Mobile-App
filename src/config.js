import { createClient } from "@supabase/supabase-js";
import CONTENT from "../questions.json";

const SUPABASE_URL = "https://qqpoxsiwoyokpbihwngj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcG94c2l3b3lva3BiaWh3bmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzIyMDQsImV4cCI6MjA5NzI0ODIwNH0.20SJCjCXPb-ys4myn3wB_yD3ySwJVS5hvSZ8IH6lF9c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { CONTENT };

export const VIBE_IDS = ["mild", "bold", "couples", "spicy", "wild"];
export const GAME_OPTIONS = [
  { id: "truth_dare", label: "Truth or Dare", kicker: "Classic", blurb: "Reveal something real or take the dare.", accent: "#ff4f9a", icon: "truth_dare" },
  { id: "questions", label: "Questions", kicker: "Conversation", blurb: "One question at a time. Everybody gets pulled in.", accent: "#5b8cff", icon: "question" },
  { id: "tiptoe", label: "Tiptoe", kicker: "Team Game", blurb: "Say it without saying it. Beat the clock. Score as a team.", accent: "#8cff4f", icon: "tiptoe" },
];

export const VIBE_META = {
  mild: { label: "Mild", short: "Keep it light", accent: "#7EE34F", icon: "leaf" },
  bold: { label: "Bold", short: "Turn it up", accent: "#FF9D3D", icon: "bolt" },
  couples: { label: "Flirty", short: "Make it interesting", accent: "#FF4F9A", icon: "heart" },
  spicy: { label: "Spicy 21+", short: "For grown folks", accent: "#D946EF", icon: "chili" },
  wild: { label: "Wild 21+", short: "All gas", accent: "#B56CFF", icon: "crown" },
};

export const DISPLAY_OPTIONS = [
  { id: "tv_phones", label: "TV + Phones", short: "TV is the board; players join by phone", remote: true },
  { id: "multi_device", label: "Phones Only", short: "Everybody plays on their own device", remote: true },
  { id: "tv_only", label: "TV Only", short: "Fire TV / shared screen controls the game", remote: false },
  { id: "pass_play", label: "Pass & Play", short: "Share one phone or tablet", remote: false },
];

export const TOPIC_PACKS = [
  ["everyday", "Everyday", "⌂"], ["pop_culture", "Pop Culture", "★"], ["movies_tv", "Movies & TV", "▣"],
  ["music", "Music", "♫"], ["sports", "Sports", "◉"], ["food_drink", "Food & Drink", "◇"],
  ["travel", "Travel", "✈"], ["decades", "80s / 90s / 2000s", "◫"], ["famous_people", "Famous People", "◎"],
  ["after_dark", "After Dark 21+", "☾"],
];

export const TIPTOE_CARDS = {
  everyday: [
    ["Coffee", ["drink", "morning", "caffeine", "cup", "espresso"]], ["Laundry", ["clothes", "washer", "dryer", "detergent", "fold"]],
    ["Grocery Store", ["food", "cart", "aisle", "checkout", "shopping"]], ["Alarm Clock", ["wake", "morning", "snooze", "time", "ring"]],
    ["Remote Control", ["TV", "buttons", "channel", "couch", "volume"]], ["Traffic Jam", ["cars", "road", "stuck", "commute", "highway"]],
  ],
  pop_culture: [
    ["Reality TV", ["show", "drama", "contestant", "camera", "episode"]], ["Influencer", ["social media", "followers", "content", "post", "brand"]],
    ["Red Carpet", ["celebrity", "premiere", "dress", "photos", "award"]], ["Viral", ["internet", "video", "trend", "share", "popular"]],
    ["Podcast", ["listen", "host", "episode", "microphone", "audio"]],
  ],
  movies_tv: [
    ["The Lion King", ["Disney", "Simba", "lion", "Africa", "Hakuna Matata"]], ["Friends", ["Rachel", "Ross", "Monica", "sitcom", "Central Perk"]],
    ["Jurassic Park", ["dinosaur", "island", "park", "T-Rex", "movie"]], ["Black Panther", ["Wakanda", "Marvel", "king", "vibranium", "superhero"]],
    ["Titanic", ["ship", "iceberg", "Jack", "Rose", "ocean"]],
  ],
  music: [
    ["Karaoke", ["sing", "microphone", "song", "lyrics", "bar"]], ["Beyoncé", ["singer", "Renaissance", "Destiny's Child", "Houston", "Queen B"]],
    ["Hip Hop", ["rap", "beat", "MC", "music", "rhymes"]], ["Concert", ["stage", "tickets", "crowd", "artist", "live"]], ["DJ", ["music", "club", "mix", "turntable", "dance"]],
  ],
  sports: [
    ["Michael Jordan", ["basketball", "Bulls", "Chicago", "NBA", "23"]], ["Touchdown", ["football", "end zone", "six", "NFL", "score"]],
    ["Home Run", ["baseball", "bat", "ball", "bases", "MLB"]], ["Olympics", ["medal", "games", "country", "athlete", "gold"]], ["Referee", ["whistle", "official", "game", "foul", "rules"]],
  ],
  food_drink: [
    ["Taco", ["shell", "Mexican", "beef", "salsa", "Tuesday"]], ["Margarita", ["tequila", "lime", "salt", "drink", "cocktail"]],
    ["Barbecue", ["grill", "smoke", "ribs", "sauce", "cookout"]], ["Champagne", ["bubbles", "toast", "wine", "celebrate", "bottle"]], ["Brunch", ["breakfast", "lunch", "mimosa", "weekend", "eggs"]],
  ],
  travel: [
    ["Las Vegas", ["casino", "Strip", "Nevada", "gambling", "hotels"]], ["Airport", ["flight", "plane", "security", "gate", "luggage"]],
    ["Passport", ["travel", "country", "photo", "border", "stamp"]], ["Cruise", ["ship", "ocean", "vacation", "port", "cabin"]], ["Road Trip", ["car", "drive", "highway", "travel", "miles"]],
  ],
  decades: [
    ["Blockbuster", ["movie", "rental", "VHS", "store", "late fee"]], ["Pager", ["beep", "number", "90s", "message", "phone"]],
    ["Mixtape", ["cassette", "songs", "record", "playlist", "tape"]], ["MySpace", ["Tom", "social", "profile", "Top 8", "internet"]], ["Walkman", ["Sony", "headphones", "cassette", "music", "portable"]],
  ],
  famous_people: [
    ["Oprah Winfrey", ["talk show", "Chicago", "media", "book club", "giveaway"]], ["Denzel Washington", ["actor", "Training Day", "Oscar", "movies", "Malcolm X"]],
    ["Serena Williams", ["tennis", "Grand Slam", "Venus", "racket", "champion"]], ["Barack Obama", ["president", "Michelle", "White House", "Chicago", "44"]],
    ["Snoop Dogg", ["rapper", "Long Beach", "Doggystyle", "Martha Stewart", "West Coast"]],
  ],
  after_dark: [
    ["Walk of Shame", ["morning", "clothes", "night", "home", "party"]], ["Booty Call", ["late", "text", "hookup", "night", "phone"]],
    ["Strip Poker", ["cards", "clothes", "game", "remove", "poker"]], ["Makeout Session", ["kiss", "couch", "lips", "date", "romance"]], ["Secret Crush", ["like", "person", "attraction", "hide", "feelings"]],
  ],
};

const FALLBACK_POOLS = {
  spicy: {
    truths: ["What kind of touch gives you butterflies?", "What makes a kiss unforgettable?", "What flirty move works on you every time?", "What is your favorite kind of chemistry?", "What compliment would make you blush fastest?"],
    dares: ["Give the room your best slow-motion entrance for ten seconds.", "Hold eye contact with one player for fifteen seconds.", "Give one player a bold but non-graphic compliment.", "Do your best after-hours runway walk across the room.", "Let the group choose whether your next compliment is sweet, spicy, or dangerous."],
    questions: ["What makes chemistry feel real to you?", "What kind of attraction surprises you?", "What compliment makes you feel especially wanted?", "What is your biggest intimacy green flag?", "What makes a kiss memorable?"],
  },
  wild: {
    truths: ["Who here looks like trouble in the best way?", "What is your most dangerous flirting habit?", "What bold move are you most likely to make after midnight?", "Who here has the strongest eye-contact game?", "What is the wildest harmless idea that still sounds fun tonight?"],
    dares: ["Give the room a fifteen-second silent seduction performance using only posture and facial expression.", "Do a slow turn and over-the-shoulder look, then hold eye contact with the room for five seconds.", "Let the group pick a song for your slowest fifteen-second runway walk.", "Give three different 'bad idea, great story' looks in ten seconds.", "Let the group choose one player you must give a bold, non-graphic compliment to."],
    questions: ["What red flag do you find a little attractive?", "Who here has the best flirt energy?", "What is your favorite kind of trouble?", "What compliment makes you fold?", "What is your guilty flirt move?"],
  },
};

export function normalizeName(value) { return value.trim().replace(/\s+/g, " "); }
export function randomCode() { const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; let out = ""; for (let i = 0; i < 4; i += 1) out += letters[Math.floor(Math.random() * letters.length)]; return out; }
export function parseJson(value, fallback = null) { if (!value || typeof value !== "string") return fallback; try { return JSON.parse(value); } catch { return fallback; } }
export function categoryInfo(id) { const source = CONTENT.categories.find((item) => item.id === id); const meta = VIBE_META[id] || VIBE_META.mild; return { ...meta, label: source?.label || meta.label, accent: source?.color || meta.accent }; }
export function gameInfo(id) { return GAME_OPTIONS.find((game) => game.id === id) || GAME_OPTIONS[0]; }
export function remoteDisplay(displayMode) { return DISPLAY_OPTIONS.find((item) => item.id === displayMode)?.remote ?? true; }
export function setupFromRoom(room) { if (room?.current_type === "setup") { const parsed = parseJson(room.current_prompt); if (parsed?.__setup === 1) return parsed; } return { __setup: 1, displayMode: "multi_device", playFormat: room?.game_mode === "tiptoe" ? "teams" : "individual", topicPacks: room?.game_mode === "tiptoe" ? [room?.category || "everyday"] : [], roundSeconds: 60, scoreToWin: 15 }; }
export function pickClassicPrompt(room, kind) { if (room.game_mode === "questions") { const pool = CONTENT.questionsMode[room.category] || FALLBACK_POOLS[room.category]?.questions || CONTENT.questionsMode.mild; return pool[Math.floor(Math.random() * pool.length)]; } const category = CONTENT.categories.find((item) => item.id === room.category); const pool = category ? (kind === "truth" ? category.truths : category.dares) : (FALLBACK_POOLS[room.category]?.[kind === "truth" ? "truths" : "dares"] || CONTENT.categories[0][kind === "truth" ? "truths" : "dares"]); return pool[Math.floor(Math.random() * pool.length)]; }
export function allTiptoeCards(topicPacks) { const packs = topicPacks?.length ? topicPacks : ["everyday"]; return packs.flatMap((pack) => (TIPTOE_CARDS[pack] || []).map(([target, forbidden]) => ({ id: `${pack}:${target}`, pack, target, forbidden }))); }
export function pickTiptoeCard(topicPacks, seen = []) { const pool = allTiptoeCards(topicPacks); if (!pool.length) return null; const seenSet = new Set(seen); const eligible = pool.filter((card) => !seenSet.has(card.id)); const source = eligible.length ? eligible : pool; return source[Math.floor(Math.random() * source.length)]; }
export function buildInitialTiptoeState(setup, players) { const first = pickTiptoeCard(setup.topicPacks, []); const activeTeam = 0; const teamPlayers = players.filter((_, index) => index % 2 === activeTeam); return { __tiptoe: 1, phase: "ready", activeTeam, scores: [0, 0], round: 1, roundSeconds: setup.roundSeconds || 60, scoreToWin: setup.scoreToWin || 15, topicPacks: setup.topicPacks?.length ? setup.topicPacks : ["everyday"], card: first, seen: first ? [first.id] : [], guesserId: teamPlayers[0]?.id || players[0]?.id || null, endsAt: null, lastDelta: null }; }
export function nextTiptoeCard(state) { const card = pickTiptoeCard(state.topicPacks, state.seen || []); return { ...state, card, seen: card ? [...(state.seen || []), card.id] : state.seen || [] }; }
