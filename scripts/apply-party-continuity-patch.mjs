import { readFileSync, writeFileSync } from "node:fs";

const file = "src/App.jsx";
let source = readFileSync(file, "utf8");

function replaceRequired(label, find, replacement) {
  const before = source;
  source = source.replace(find, replacement);
  if (source === before) throw new Error(`Patch anchor not found: ${label}`);
}

function replaceAllRequired(label, find, replacement, minimum = 1) {
  const matches = source.match(find);
  if (!matches || matches.length < minimum) throw new Error(`Patch anchor not found enough times: ${label}`);
  source = source.replace(find, replacement);
}

replaceRequired(
  "party copy import",
  'import { TIPTOE_PACKS } from "./tiptoe-content.js";',
  'import { TIPTOE_PACKS } from "./tiptoe-content.js";\nimport { displayModeCopy, gameContextCopy, idleGameCopy, lobbyHowItWorksCopy, lobbyInstructionCopy, recapModeCopy, reconfigureRoomSettings, roomShareCopy, setupDisplayCopy, turnEyebrowCopy } from "./party-copy.js";',
);

replaceRequired(
  "home mode copy",
  "Play pass-the-phone on one device or invite everyone into the same room.",
  "Play on one shared device, on Fire TV, or invite everyone into the same room.",
);

replaceRequired(
  "legacy local player guidance",
  "Enter everyone here. The phone gets passed to each player on their turn.",
  '{playMode === "tv_only" ? "Enter everyone here. Use the Fire TV remote to run turns; no phone handoff is part of TV Only." : "Enter everyone here. The shared device moves to each player on their turn."}',
);

replaceRequired(
  "setup display guidance",
  '{step === "display" && <><h2 style={sectionTitle}>Choose the display mode</h2>{DISPLAY_MODE_OPTIONS.map((option) => optionButton(option, displayMode === option.id, () => setDisplayMode(option.id)))}</>}',
  '{step === "display" && <><h2 style={sectionTitle}>Choose the display mode</h2>{DISPLAY_MODE_OPTIONS.map((option) => optionButton(option, displayMode === option.id, () => setDisplayMode(option.id)))}<p style={heroCopy}>{setupDisplayCopy({ gameMode, displayMode })}</p></>}',
);

replaceRequired(
  "lobby derived state",
  '  const names = teamNames(room);\n\n  return (',
  `  const names = teamNames(room);\n  const displayMode = roomDisplayMode(room);\n  const modeCopy = displayModeCopy(displayMode);\n  const gameName = GAME_OPTIONS.find((option) => option.id === room.game_mode)?.label || "Game";\n  const activeLobbyPlayers = playablePlayers(players);\n  const teamMinimum = room.game_mode === "tiptoe" ? 2 : 1;\n  const teamCounts = {\n    team_a: activeLobbyPlayers.filter((player, index) => playerTeamId(player, index) === "team_a").length,\n    team_b: activeLobbyPlayers.filter((player, index) => playerTeamId(player, index) === "team_b").length,\n  };\n  const teamsReady = room.pair_mode || roomPlayFormat(room) !== "teams" || (teamCounts.team_a >= teamMinimum && teamCounts.team_b >= teamMinimum);\n  const pairReady = !room.pair_mode || (activeLobbyPlayers.length >= 2 && activeLobbyPlayers.every((player) => player.pair_id) && validatePairs(activeLobbyPlayers).length === 0);\n  const partyReady = activeLobbyPlayers.length >= 2 && teamsReady && pairReady;\n  const startBlockReason = activeLobbyPlayers.length < 2\n    ? "Waiting for more players…"\n    : !pairReady\n      ? "Pair Play needs complete two-person pairs."\n      : !teamsReady\n        ? room.game_mode === "tiptoe" ? "Tiptoe needs 2 players on each team." : "Each team needs at least 1 player."\n        : "";\n  const canEditParty = room.status === "lobby";\n\n  return (`,
);

replaceRequired(
  "lobby kicker",
  '{isSingleDevice ? DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label : "ROOM CODE"}',
  '{isSingleDevice ? modeCopy.lobbyKicker : "ROOM CODE"}',
);
replaceRequired("lobby hero", '{isSingleDevice ? "PASS" : room.code}', '{isSingleDevice ? modeCopy.lobbyHero : room.code}');
replaceRequired(
  "lobby instruction",
  '{isSingleDevice ? "Enter everyone here, then pass the phone each turn" : "Share this code so others can join"}',
  '{lobbyInstructionCopy({ gameMode: room.game_mode, displayMode })}',
);
replaceRequired(
  "lobby status",
  'text={isSingleDevice ? "On this device" : online ? "Connected" : "Offline - reconnecting"}',
  'text={isSingleDevice ? modeCopy.status : online ? "Connected" : "Offline - reconnecting"}',
);
replaceRequired(
  "lobby how it works",
  "Keep the phone on the table, tap start, and pass it to the highlighted player. The game is saved on this device if the screen locks.",
  '{lobbyHowItWorksCopy({ gameMode: room.game_mode, displayMode })}',
);
replaceRequired(
  "lobby format pill and context",
  '<Pill text={roomPlayFormat(room) === "teams" ? "Teams" : "Individual"} />\n        </div>',
  '<Pill text={room.pair_mode ? "Pair Play" : roomPlayFormat(room) === "teams" ? "Teams" : "Individual"} />\n        </div>\n        <div style={{ ...hintText, textAlign: "center" }}>{gameContextCopy({ gameMode: room.game_mode, contentId: room.game_mode === "tiptoe" ? (room.topic_pack || room.category) : room.category, contentLabel: cat?.label })}</div>',
);

replaceRequired(
  "remote player removal only between games",
  '{isHost && !isSingleDevice && p.id !== me.id && (',
  '{isHost && canEditParty && !isSingleDevice && p.id !== me.id && (',
);
replaceRequired(
  "local player removal only between games",
  '{isSingleDevice && players.length > 2 && p.id !== me.id && (',
  '{canEditParty && isSingleDevice && players.length > 2 && p.id !== me.id && (',
);
replaceRequired(
  "local add player readiness",
  'disabled={!cleanDisplayName(localPlayerName) || players.length >= MAX_PLAYERS}',
  'disabled={!canEditParty || !cleanDisplayName(localPlayerName) || players.length >= MAX_PLAYERS}',
);
replaceRequired(
  "team editing only between games",
  '{roomPlayFormat(room) === "teams" && isHost && (',
  '{roomPlayFormat(room) === "teams" && !room.pair_mode && isHost && canEditParty && (',
);

replaceRequired(
  "host settings only between games",
  '        {isHost && (\n          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>\n            <Field label="Game">',
  '        {isHost && !canEditParty && <div style={invitePanel}><div style={{ ...eyebrow, marginBottom: 8 }}>GAME IN PROGRESS</div><div style={{ ...hintText, textAlign: "left" }}>The current game is still live. Return to the game and choose End game · keep party before changing the game, content, format, roster, or teams.</div></div>}\n        {isHost && canEditParty && (\n          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>\n            <div style={invitePanel}><div style={{ ...eyebrow, marginBottom: 8 }}>KEEP THE PARTY</div><div style={{ ...hintText, textAlign: "left" }}>Your participant list stays together between games. Change the game, vibe or pack, and play format; add or remove players; reorganize teams; then start again.</div></div>\n            <Field label="Game">',
);

replaceRequired(
  "game selector preserves party settings",
  `onChange={(value) =>\n                  onRoomSettingsChange({\n                    game_mode: value,\n                    play_format: value === "tiptoe" ? "teams" : "individual",\n                    category: value === "tiptoe" ? (room.topic_pack || "party") : "mild",\n                  })\n                }`,
  'onChange={(value) => onRoomSettingsChange(reconfigureRoomSettings(room, { game_mode: value }))}',
);

replaceRequired(
  "lobby play format selector",
  '            </Field>\n            {room.game_mode !== "tiptoe" && <Field label="Content vibe">',
  `            </Field>\n            {room.game_mode !== "tiptoe" && <Field label="Play format">\n              <SegmentedControl\n                options={PLAY_FORMAT_OPTIONS}\n                value={roomPlayFormat(room)}\n                onChange={(value) => onRoomSettingsChange(reconfigureRoomSettings(room, { play_format: value }))}\n              />\n            </Field>}\n            {room.game_mode !== "tiptoe" && <Field label="Content vibe">`,
);

replaceRequired(
  "category selector preserves compatible state",
  'onRoomSettingsChange({ category: c.id });',
  'onRoomSettingsChange(reconfigureRoomSettings(room, { category: c.id }));',
);

replaceRequired(
  "start button validation",
  'disabled={room.status !== "playing" && playablePlayers(players).length < 2}',
  'disabled={room.status !== "playing" && room.status !== "paused" && !partyReady}',
);
replaceRequired(
  "start button return behavior",
  'onClick={room.status === "playing" ? onReturnToGame : onStart}',
  'onClick={room.status === "playing" || room.status === "paused" ? onReturnToGame : onStart}',
);
replaceRequired(
  "start button label",
  '{room.status === "playing" || room.status === "paused" ? "Return to game" : playablePlayers(players).length < 2 ? "Waiting for more players..." : "Start game"}',
  '{room.status === "playing" || room.status === "paused" ? "Return to game" : startBlockReason || `Start ${gameName}`}',
);

replaceRequired(
  "game display mode variable",
  '  const tvMode = isTvMode(room);\n  const displayModeLabel = DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label || "Multi-Device";',
  '  const tvMode = isTvMode(room);\n  const displayMode = roomDisplayMode(room);\n  const displayModeLabel = DISPLAY_MODE_OPTIONS.find((option) => option.id === displayMode)?.label || "Multi-Device";',
);
replaceRequired(
  "turn eyebrow",
  '{isTiptoe ? currentTeam : isSingleDevice ? "PASS TO" : isMyTurn ? "YOUR TURN" : "CURRENT TURN"}',
  '{isTiptoe ? currentTeam : turnEyebrowCopy({ gameMode: room.game_mode, displayMode, isMyTurn })}',
);
replaceRequired(
  "idle game guidance",
  '{isPaused ? "Paused. Resume when everyone is ready." : isTiptoe ? "Start the next Tiptoe card" : isMyTurn ? "Pick truth or dare below" : "Waiting for their pick..."}',
  '{idleGameCopy({ gameMode: room.game_mode, displayMode, isMyTurn, paused: isPaused })}',
);
replaceRequired(
  "end game keep party label",
  '>End for everyone</Button>',
  '>End game · keep party</Button>',
);

replaceRequired(
  "new game resets session score",
  '  async function handleStart() {\n    setRoundPenaltyCounts({});\n    setView("game");',
  '  async function handleStart() {\n    setRoundPenaltyCounts({});\n    setActivityLog([]);\n    setInviteStatus("");\n    setView("game");',
);
replaceAllRequired(
  "new game resets round and turn counters",
  /        session_started_at: new Date\(\)\.toISOString\(\),/g,
  '        session_started_at: new Date().toISOString(),\n        round_number: 1,\n        turn_counter: 0,',
  2,
);

replaceRequired(
  "end game keep party status",
  '  async function handleEndGame() {\n    if (actionInFlight) return;\n    setActionInFlight(true);\n    try {',
  '  async function handleEndGame() {\n    if (actionInFlight) return;\n    setActionInFlight(true);\n    setInviteStatus("Game ended. Party kept — adjust the game, content, roster, or teams, then start again.");\n    try {',
);
replaceRequired(
  "local end game reset",
  '          current_prompt: null,\n          current_type: null,\n        }));',
  '          current_prompt: null,\n          current_type: null,\n          round_number: 1,\n          turn_counter: 0,\n        }));',
);
replaceRequired(
  "remote end game reset",
  '.update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null })',
  '.update({ status: "lobby", current_player_index: 0, current_prompt: null, current_type: null, round_number: 1, turn_counter: 0 })',
);
replaceRequired(
  "remote end game penalty reset",
  '        .eq("code", roomCode);\n      setView("lobby");\n    } finally {',
  '        .eq("code", roomCode);\n      setRoundPenaltyCounts({});\n      setView("lobby");\n    } finally {',
);

replaceRequired(
  "invite game-aware copy",
  '    const url = inviteUrlFor(roomCode, token);\n    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;\n    try {\n      if (navigator.share) {\n        await navigator.share({ title: "Join my Truth/Dare room", text, url });',
  '    const url = inviteUrlFor(roomCode, token);\n    const shareCopy = roomShareCopy({ gameMode: room?.game_mode, roomCode, url });\n    const text = shareCopy.text;\n    try {\n      if (navigator.share) {\n        await navigator.share({ title: shareCopy.title, text, url });',
);

replaceRequired(
  "recap display copy",
  '      `${room?.play_mode === "single_device" ? "Single device" : `Room ${roomCode}`} recap`,',
  '      `${GAME_OPTIONS.find((option) => option.id === room?.game_mode)?.label || "Afterparty"} recap`,',
);
replaceRequired(
  "recap mode",
  '      room?.play_mode === "single_device" ? "Mode: pass-the-phone" : `Invite: ${inviteUrlFor(roomCode)}`,',
  '      recapModeCopy(roomDisplayMode(room)),\n      room?.play_mode === "single_device" ? null : `Invite: ${inviteUrlFor(roomCode)}`,',
);
replaceRequired(
  "recap filter null",
  '    const text = lines.join("\\\n");',
  '    const text = lines.filter(Boolean).join("\\n");',
);
replaceRequired(
  "recap share title",
  '        await navigator.share({ title: "Truth/Dare recap", text });',
  '        await navigator.share({ title: `${GAME_OPTIONS.find((option) => option.id === room?.game_mode)?.label || "Afterparty"} recap`, text });',
);

writeFileSync(file, source);
console.log("Applied party continuity + display-aware copy patch to src/App.jsx");
