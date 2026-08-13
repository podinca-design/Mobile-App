import { readFileSync, writeFileSync } from "node:fs";
const file = "src/App.jsx";
let source = readFileSync(file, "utf8");
function replaceRequired(label, find, replacement) {
  const before = source;
  source = source.replace(find, replacement);
  if (source === before) throw new Error(`Patch anchor not found: ${label}`);
}
replaceRequired("party copy import", 'import { TIPTOE_PACKS } from "./tiptoe-content.js";', 'import { TIPTOE_PACKS } from "./tiptoe-content.js";\nimport { displayModeCopy, gameContextCopy, idleGameCopy, lobbyHowItWorksCopy, lobbyInstructionCopy, recapModeCopy, reconfigureRoomSettings, roomShareCopy, setupDisplayCopy, turnEyebrowCopy } from "./party-copy.js";');
replaceRequired("home mode copy", "Play pass-the-phone on one device or invite everyone into the same room.", "Play on one shared device, on Fire TV, or invite everyone into the same room.");
replaceRequired("legacy local player guidance", "Enter everyone here. The phone gets passed to each player on their turn.", '{playMode === "tv_only" ? "Enter everyone here. Use the Fire TV remote to run turns; no phone handoff is part of TV Only." : "Enter everyone here. The shared device moves to each player on their turn."}');
replaceRequired("setup display guidance", '{step === "display" && <><h2 style={sectionTitle}>Choose the display mode</h2>{DISPLAY_MODE_OPTIONS.map((option) => optionButton(option, displayMode === option.id, () => setDisplayMode(option.id)))}</>}', '{step === "display" && <><h2 style={sectionTitle}>Choose the display mode</h2>{DISPLAY_MODE_OPTIONS.map((option) => optionButton(option, displayMode === option.id, () => setDisplayMode(option.id)))}<p style={heroCopy}>{setupDisplayCopy({ gameMode, displayMode })}</p></>}');
replaceRequired("lobby derived copy", '  const names = teamNames(room);\n\n  return (', '  const names = teamNames(room);\n  const displayMode = roomDisplayMode(room);\n  const modeCopy = displayModeCopy(displayMode);\n\n  return (');
replaceRequired("lobby kicker", '{isSingleDevice ? DISPLAY_MODE_OPTIONS.find((option) => option.id === roomDisplayMode(room))?.label : "ROOM CODE"}', '{isSingleDevice ? modeCopy.lobbyKicker : "ROOM CODE"}');
replaceRequired("lobby hero", '{isSingleDevice ? "PASS" : room.code}', '{isSingleDevice ? modeCopy.lobbyHero : room.code}');
replaceRequired("lobby instruction", '{isSingleDevice ? "Enter everyone here, then pass the phone each turn" : "Share this code so others can join"}', '{lobbyInstructionCopy({ gameMode: room.game_mode, displayMode })}');
replaceRequired("lobby status", 'text={isSingleDevice ? "On this device" : online ? "Connected" : "Offline - reconnecting"}', 'text={isSingleDevice ? modeCopy.status : online ? "Connected" : "Offline - reconnecting"}');
replaceRequired("lobby how it works", "Keep the phone on the table, tap start, and pass it to the highlighted player. The game is saved on this device if the screen locks.", '{lobbyHowItWorksCopy({ gameMode: room.game_mode, displayMode })}');
writeFileSync(file, source);
console.log("Applied display-aware copy isolation patch.");
