import { readFileSync, writeFileSync } from "node:fs";

const file = "src/App.jsx";
let source = readFileSync(file, "utf8");

function replaceRequired(label, find, replacement) {
  const before = source;
  source = source.replace(find, replacement);
  if (source === before) throw new Error(`Lifecycle patch anchor not found: ${label}`);
}

function replaceAllRequired(label, find, replacement, minimum = 1) {
  const matches = source.match(find);
  if (!matches || matches.length < minimum) throw new Error(`Lifecycle patch anchor not found enough times: ${label}`);
  source = source.replace(find, replacement);
}

replaceRequired(
  "clean new game state",
  '  async function handleStart() {\n    setRoundPenaltyCounts({});\n    setView("game");',
  '  async function handleStart() {\n    setRoundPenaltyCounts({});\n    setActivityLog([]);\n    setInviteStatus("");\n    setView("game");',
);

replaceAllRequired(
  "new game round reset",
  /        session_started_at: new Date\(\)\.toISOString\(\),/g,
  '        session_started_at: new Date().toISOString(),\n        round_number: 1,\n        turn_counter: 0,',
  2,
);

replaceRequired(
  "party kept status",
  '  async function handleEndGame() {\n    if (actionInFlight) return;\n    setActionInFlight(true);\n    try {',
  '  async function handleEndGame() {\n    if (actionInFlight) return;\n    setActionInFlight(true);\n    setInviteStatus("Game ended. Party kept — adjust the game, content, roster, or teams, then start again.");\n    try {',
);

replaceRequired(
  "remote end reset",
  '.update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })',
  '.update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null, round_number: 1, turn_counter: 0 })',
);

replaceRequired(
  "round penalty reset",
  '        .eq("code", roomCode);\n      setView("lobby");\n    } finally {',
  '        .eq("code", roomCode);\n      setRoundPenaltyCounts({});\n      setView("lobby");\n    } finally {',
);

writeFileSync(file, source);
console.log("Applied clean restart lifecycle while preserving the party roster.");
