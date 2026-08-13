const DISPLAY_COPY = Object.freeze({
  pass_play: {
    lobbyKicker: "PASS & PLAY",
    lobbyHero: "PASS",
    status: "Shared device ready",
  },
  tv_only: {
    lobbyKicker: "TV ONLY",
    lobbyHero: "TV",
    status: "Fire TV ready",
  },
  multi_device: {
    lobbyKicker: "ROOM CODE",
    lobbyHero: "ROOM",
    status: "Phones connected",
  },
  tv_phones: {
    lobbyKicker: "ROOM CODE",
    lobbyHero: "ROOM",
    status: "TV + phones ready",
  },
});

const CATEGORY_CONTEXT = Object.freeze({
  mild: "Light, funny prompts built for easy group energy.",
  bold: "Bolder confessions and social-risk prompts without losing the opt-out.",
  couples: "Flirty, chemistry-forward prompts with explicit consent at every step.",
  spicy: "21+ sensual prompts. Anyone can skip, stop, or choose a non-alcoholic substitute.",
  wild: "Highest-intensity 21+ prompts. Consent and the right to opt out stay active throughout.",
});

const TIPTOE_CONTEXT = Object.freeze({
  party: "Party words and social clues for a fast, broad team round.",
  flirty: "Flirty and relationship-themed targets for a more playful team round.",
  pop: "Pop-culture, entertainment, music, and internet targets.",
});

const CLASSIC_CATEGORY_IDS = new Set(Object.keys(CATEGORY_CONTEXT));

export function displayModeCopy(displayMode) {
  return DISPLAY_COPY[displayMode] || DISPLAY_COPY.multi_device;
}

export function setupDisplayCopy({ gameMode, displayMode }) {
  if (displayMode === "tv_only") {
    if (gameMode === "tiptoe") return "The TV is the shared board. Use the Fire TV remote to run rounds; the guesser turns away while the clue is visible.";
    if (gameMode === "questions") return "Questions stay on the TV. Use the Fire TV remote to advance turns and draw the next question.";
    return "Truths and dares stay on the TV. Use the Fire TV remote for selections and turn changes; no phone passing is needed.";
  }
  if (displayMode === "tv_phones") {
    if (gameMode === "tiptoe") return "The TV is the shared board while phones handle joining and player interaction. The clue stays oriented around the shared round.";
    return "The TV is the shared board. Players join from their phones and use them for personal interaction while the group follows the TV.";
  }
  if (displayMode === "pass_play") {
    if (gameMode === "tiptoe") return "One shared device runs the round. Hand it to the clue-giver and keep the clue out of the guesser's view.";
    if (gameMode === "questions") return "One shared device moves with the turn. Hand it to the highlighted player before drawing their question.";
    return "One shared device moves with the turn. Hand it to the highlighted player before they choose Truth or Dare.";
  }
  if (gameMode === "tiptoe") return "Everyone joins the same room from their own device while the team round stays synchronized.";
  if (gameMode === "questions") return "Everyone joins the same room from their own device; the active player draws and answers from their turn screen.";
  return "Everyone joins the same room from their own device; the active player chooses Truth or Dare on their turn.";
}

export function lobbyInstructionCopy({ gameMode, displayMode }) {
  if (displayMode === "tv_only") {
    if (gameMode === "tiptoe") return "Use the Fire TV remote to run Tiptoe. The guesser turns away while the clue is shown.";
    if (gameMode === "questions") return "Use the Fire TV remote to run turns and draw questions for the group.";
    return "Use the Fire TV remote to run turns and choose Truth or Dare for the highlighted player.";
  }
  if (displayMode === "pass_play") {
    if (gameMode === "tiptoe") return "Hand the shared device to the clue-giver for each round and keep it hidden from the guesser.";
    if (gameMode === "questions") return "Hand the shared device to the highlighted player when their question turn begins.";
    return "Hand the shared device to the highlighted player when their Truth or Dare turn begins.";
  }
  if (displayMode === "tv_phones") return "Players scan the QR to join. The TV remains the shared board while phones handle player interaction.";
  return "Share the room code or QR so everyone can join from their own device.";
}

export function lobbyHowItWorksCopy({ gameMode, displayMode }) {
  if (displayMode === "tv_only") {
    if (gameMode === "tiptoe") return "Keep the game on the TV and use the Fire TV remote for Start, scoring, pause, and next team. No phone handoff is part of this mode.";
    if (gameMode === "questions") return "Keep the game on the TV and use the Fire TV remote to advance players and questions. Everyone answers from the room, not from a passed phone.";
    return "Keep the game on the TV and use the Fire TV remote for turn selection and navigation. No phone handoff is part of this mode.";
  }
  if (displayMode === "pass_play") {
    if (gameMode === "tiptoe") return "The clue-giver holds the shared device during the round. Keep the screen away from the guesser, then hand it to the next clue-giver.";
    return "Keep the shared device with the group and hand it to the highlighted player when the turn changes. Progress is saved on this device if the screen locks.";
  }
  if (displayMode === "tv_phones") return "Keep the TV as the shared board. Players join by QR on their phones; late joins follow the room-lock setting.";
  return "Each player stays on their own device. The room keeps turns, prompts, and party state synchronized.";
}

export function gameContextCopy({ gameMode, contentId, contentLabel }) {
  if (gameMode === "tiptoe") return `${contentLabel || "Tiptoe"}: ${TIPTOE_CONTEXT[contentId] || "Team clue-play with forbidden words and a shared timer."}`;
  const game = gameMode === "questions" ? "Questions" : "Truth or Dare";
  return `${game} · ${contentLabel || contentId}: ${CATEGORY_CONTEXT[contentId] || "Selected content vibe for this game."}`;
}

export function turnEyebrowCopy({ gameMode, displayMode, isMyTurn }) {
  if (gameMode === "questions") {
    if (displayMode === "tv_only") return "ANSWERING";
    if (displayMode === "pass_play") return "HAND TO";
    return isMyTurn ? "YOUR QUESTION" : "ANSWERING";
  }
  if (displayMode === "tv_only") return "UP NOW";
  if (displayMode === "pass_play") return "HAND TO";
  return isMyTurn ? "YOUR TURN" : "CURRENT TURN";
}

export function idleGameCopy({ gameMode, displayMode, isMyTurn, paused }) {
  if (paused) return "Paused. Resume when everyone is ready.";
  if (gameMode === "tiptoe") {
    if (displayMode === "tv_only") return "Use the Fire TV remote to start the next Tiptoe round.";
    if (displayMode === "pass_play") return "Give the shared device to the next clue-giver, then start the round.";
    return "Start the next Tiptoe round when both teams are ready.";
  }
  if (gameMode === "questions") {
    if (displayMode === "tv_only") return "Use the Fire TV remote to draw the highlighted player's question.";
    if (displayMode === "pass_play") return "Hand the shared device to the highlighted player, then draw their question.";
    return isMyTurn ? "Draw your question when you're ready." : "Waiting for the current player to draw a question…";
  }
  if (displayMode === "tv_only") return "Use the Fire TV remote to choose Truth or Dare for the highlighted player.";
  if (displayMode === "pass_play") return "Hand the shared device to the highlighted player, then choose Truth or Dare.";
  return isMyTurn ? "Choose Truth or Dare when you're ready." : "Waiting for the current player to choose…";
}

export function reconfigureRoomSettings(room, change) {
  const next = { ...change };
  const nextGame = Object.prototype.hasOwnProperty.call(change, "game_mode") ? change.game_mode : room.game_mode;
  const nextCategory = Object.prototype.hasOwnProperty.call(change, "category") ? change.category : room.category;
  const nextFormat = Object.prototype.hasOwnProperty.call(change, "play_format") ? change.play_format : room.play_format || "individual";

  if (nextGame === "tiptoe") {
    next.play_format = "teams";
    next.pair_mode = false;
    next.topic_pack = change.topic_pack || room.topic_pack || "party";
    next.category = next.topic_pack;
    return next;
  }

  if (Object.prototype.hasOwnProperty.call(change, "game_mode") && room.game_mode === "tiptoe") {
    next.play_format = "teams";
    next.category = CLASSIC_CATEGORY_IDS.has(room.category) ? room.category : "mild";
    next.pair_mode = false;
  }

  if (Object.prototype.hasOwnProperty.call(change, "play_format") && nextFormat === "individual") next.pair_mode = false;
  if (Object.prototype.hasOwnProperty.call(change, "category") && nextCategory !== "couples") next.pair_mode = false;
  if (Object.prototype.hasOwnProperty.call(change, "game_mode") && !CLASSIC_CATEGORY_IDS.has(next.category || room.category)) next.category = "mild";

  return next;
}

export function roomShareCopy({ gameMode, roomCode, url }) {
  const game = gameMode === "tiptoe" ? "Tiptoe" : gameMode === "questions" ? "Questions" : "Truth or Dare";
  return {
    title: `Join my ${game} room`,
    text: `Join my ${game} room ${roomCode}: ${url}`,
  };
}

export function recapModeCopy(displayMode) {
  if (displayMode === "tv_only") return "Mode: TV Only";
  if (displayMode === "tv_phones") return "Mode: TV + Phones";
  if (displayMode === "pass_play") return "Mode: Pass & Play";
  return "Mode: Multi-Device";
}
