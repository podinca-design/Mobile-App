import test from "node:test";
import assert from "node:assert/strict";
import { lobbyInstructionCopy, setupDisplayCopy, reconfigureRoomSettings, roomShareCopy, recapModeCopy } from "../src/party-copy.js";

test("TV Only Tiptoe uses Fire TV-specific instructions", () => {
  const setup = setupDisplayCopy({ gameMode: "tiptoe", displayMode: "tv_only" });
  const lobby = lobbyInstructionCopy({ gameMode: "tiptoe", displayMode: "tv_only" });
  assert.match(`${setup} ${lobby}`, /Fire TV remote/i);
  assert.doesNotMatch(`${setup} ${lobby}`, /hand the shared device/i);
});

test("classic game changes preserve compatible party settings", () => {
  const room = { game_mode: "truth_dare", category: "bold", play_format: "teams", pair_mode: false };
  assert.deepEqual(reconfigureRoomSettings(room, { game_mode: "questions" }), { game_mode: "questions" });
});

test("Tiptoe forces team play while keeping the selected pack", () => {
  const room = { game_mode: "questions", category: "bold", topic_pack: "pop", play_format: "individual", pair_mode: false };
  assert.deepEqual(reconfigureRoomSettings(room, { game_mode: "tiptoe" }), { game_mode: "tiptoe", play_format: "teams", pair_mode: false, topic_pack: "pop", category: "pop" });
});

test("share and recap labels follow actual game and display mode", () => {
  assert.equal(roomShareCopy({ gameMode: "tiptoe", roomCode: "ABCD", url: "https://example.test" }).title, "Join my Tiptoe room");
  assert.equal(recapModeCopy("tv_only"), "Mode: TV Only");
});
