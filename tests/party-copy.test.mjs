import test from "node:test";
import assert from "node:assert/strict";
import {
  gameContextCopy,
  idleGameCopy,
  lobbyHowItWorksCopy,
  lobbyInstructionCopy,
  recapModeCopy,
  reconfigureRoomSettings,
  roomShareCopy,
  setupDisplayCopy,
  turnEyebrowCopy,
} from "../src/party-copy.js";

test("TV Only Tiptoe never instructs the group to hand off a phone or device", () => {
  const copy = [
    setupDisplayCopy({ gameMode: "tiptoe", displayMode: "tv_only" }),
    lobbyInstructionCopy({ gameMode: "tiptoe", displayMode: "tv_only" }),
    lobbyHowItWorksCopy({ gameMode: "tiptoe", displayMode: "tv_only" }),
    idleGameCopy({ gameMode: "tiptoe", displayMode: "tv_only", isMyTurn: true, paused: false }),
  ].join(" ");
  assert.match(copy, /Fire TV remote/i);
  assert.doesNotMatch(copy, /hand (?:the )?(?:phone|device|shared device)|pass (?:the )?(?:phone|device)/i);
});

test("TV Only Questions and Truth or Dare use game-specific remote copy", () => {
  assert.match(lobbyInstructionCopy({ gameMode: "questions", displayMode: "tv_only" }), /draw questions/i);
  assert.match(idleGameCopy({ gameMode: "questions", displayMode: "tv_only", isMyTurn: true, paused: false }), /draw .*question/i);
  assert.doesNotMatch(idleGameCopy({ gameMode: "questions", displayMode: "tv_only", isMyTurn: true, paused: false }), /truth or dare/i);
  assert.match(lobbyInstructionCopy({ gameMode: "truth_dare", displayMode: "tv_only" }), /choose Truth or Dare/i);
  assert.equal(turnEyebrowCopy({ gameMode: "truth_dare", displayMode: "tv_only", isMyTurn: true }), "UP NOW");
});

test("Pass & Play keeps handoff language only where a shared device actually moves", () => {
  assert.match(lobbyInstructionCopy({ gameMode: "questions", displayMode: "pass_play" }), /Hand the shared device/i);
  assert.match(idleGameCopy({ gameMode: "truth_dare", displayMode: "pass_play", isMyTurn: true, paused: false }), /Hand the shared device/i);
  assert.equal(turnEyebrowCopy({ gameMode: "questions", displayMode: "pass_play", isMyTurn: true }), "HAND TO");
});

test("TV + Phones and Multi-Device copy describe their actual device roles", () => {
  assert.match(lobbyInstructionCopy({ gameMode: "tiptoe", displayMode: "tv_phones" }), /scan the QR/i);
  assert.match(lobbyHowItWorksCopy({ gameMode: "questions", displayMode: "multi_device" }), /own device/i);
});

test("category and Tiptoe pack context is bespoke", () => {
  assert.match(gameContextCopy({ gameMode: "questions", contentId: "bold", contentLabel: "Bold" }), /Questions.*Bolder confessions/i);
  assert.match(gameContextCopy({ gameMode: "truth_dare", contentId: "couples", contentLabel: "Flirty" }), /Flirty.*consent/i);
  assert.match(gameContextCopy({ gameMode: "tiptoe", contentId: "pop", contentLabel: "Pop Culture" }), /Pop Culture.*entertainment/i);
});

test("switching between classic games preserves compatible vibe and team format", () => {
  const room = { game_mode: "truth_dare", category: "bold", play_format: "teams", pair_mode: false };
  assert.deepEqual(reconfigureRoomSettings(room, { game_mode: "questions" }), { game_mode: "questions" });
});

test("switching into Tiptoe forces teams while preserving the selected Tiptoe pack", () => {
  const room = { game_mode: "questions", category: "bold", topic_pack: "pop", play_format: "individual", pair_mode: false };
  assert.deepEqual(reconfigureRoomSettings(room, { game_mode: "tiptoe" }), {
    game_mode: "tiptoe",
    play_format: "teams",
    pair_mode: false,
    topic_pack: "pop",
    category: "pop",
  });
});

test("leaving Tiptoe keeps team play and returns to a valid classic vibe", () => {
  const room = { game_mode: "tiptoe", category: "party", topic_pack: "party", play_format: "teams", pair_mode: false };
  assert.deepEqual(reconfigureRoomSettings(room, { game_mode: "truth_dare" }), {
    game_mode: "truth_dare",
    play_format: "teams",
    category: "mild",
    pair_mode: false,
  });
});

test("Pair Play clears when format or vibe is no longer eligible", () => {
  const room = { game_mode: "questions", category: "couples", play_format: "teams", pair_mode: true };
  assert.equal(reconfigureRoomSettings(room, { play_format: "individual" }).pair_mode, false);
  assert.equal(reconfigureRoomSettings(room, { category: "bold" }).pair_mode, false);
});

test("invite and recap labels follow actual game and display mode", () => {
  assert.equal(roomShareCopy({ gameMode: "tiptoe", roomCode: "ABCD", url: "https://example.test" }).title, "Join my Tiptoe room");
  assert.equal(roomShareCopy({ gameMode: "questions", roomCode: "ABCD", url: "https://example.test" }).title, "Join my Questions room");
  assert.equal(recapModeCopy("tv_only"), "Mode: TV Only");
  assert.equal(recapModeCopy("tv_phones"), "Mode: TV + Phones");
  assert.equal(recapModeCopy("pass_play"), "Mode: Pass & Play");
  assert.equal(recapModeCopy("multi_device"), "Mode: Multi-Device");
});
