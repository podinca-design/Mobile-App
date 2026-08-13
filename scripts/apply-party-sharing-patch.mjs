import { readFileSync, writeFileSync } from "node:fs";

const file = "src/App.jsx";
let source = readFileSync(file, "utf8");

function replaceRequired(label, find, replacement) {
  const before = source;
  source = source.replace(find, replacement);
  if (source === before) throw new Error(`Sharing patch anchor not found: ${label}`);
}

replaceRequired(
  "invite game label",
  '    const url = inviteUrlFor(roomCode, token);\n    const text = `Join my Truth/Dare room ${roomCode}: ${url}`;\n    try {\n      if (navigator.share) {\n        await navigator.share({ title: "Join my Truth/Dare room", text, url });',
  '    const url = inviteUrlFor(roomCode, token);\n    const shareCopy = roomShareCopy({ gameMode: room?.game_mode, roomCode, url });\n    const text = shareCopy.text;\n    try {\n      if (navigator.share) {\n        await navigator.share({ title: shareCopy.title, text, url });',
);

replaceRequired(
  "recap game label",
  '      `${room?.play_mode === "single_device" ? "Single device" : `Room ${roomCode}`} recap`,',
  '      `${GAME_OPTIONS.find((option) => option.id === room?.game_mode)?.label || "Afterparty"} recap`,',
);

replaceRequired(
  "recap display mode",
  '      room?.play_mode === "single_device" ? "Mode: pass-the-phone" : `Invite: ${inviteUrlFor(roomCode)}`,',
  '      recapModeCopy(roomDisplayMode(room)),\n      room?.play_mode === "single_device" ? null : `Invite: ${inviteUrlFor(roomCode)}`,',
);

const recapJoinPattern = /    const text = lines\.join\("\\[\s\S]*?"\);/;
if (!recapJoinPattern.test(source)) throw new Error("Sharing patch anchor not found: recap line join");
source = source.replace(recapJoinPattern, '    const text = lines.filter(Boolean).join("\\n");');

replaceRequired(
  "recap share title",
  '        await navigator.share({ title: "Truth/Dare recap", text });',
  '        await navigator.share({ title: `${GAME_OPTIONS.find((option) => option.id === room?.game_mode)?.label || "Afterparty"} recap`, text });',
);

writeFileSync(file, source);
console.log("Applied game-aware invite and recap copy.");
