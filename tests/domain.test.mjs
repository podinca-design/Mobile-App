import test from "node:test";
import assert from "node:assert/strict";
import {
  autoBalancePlayers,
  autoPairPlayers,
  cleanDisplayName,
  consumeDeckItem,
  createDeck,
  isPairPlayEligible,
  nextFairRoles,
  normalizeSetupSelection,
  remainingRoundMs,
  setupStepsForState,
  tiptoeAction,
  validatePairs,
  validateTeams,
} from "../src/domain.js";
import { TIPTOE_PACKS, validateTiptoePacks } from "../src/tiptoe-content.js";

test("full Unicode names, spaces, apostrophes, hyphens, and duplicates remain valid", () => {
  assert.equal(cleanDisplayName("  Mary   Jane Smith  "), "Mary Jane Smith");
  assert.equal(cleanDisplayName("De'Andre Jones"), "De'Andre Jones");
  assert.equal(cleanDisplayName("Anne-Marie Johnson"), "Anne-Marie Johnson");
  assert.equal(cleanDisplayName("José García"), "José García");
  assert.equal(cleanDisplayName("李 明"), "李 明");
  assert.equal(cleanDisplayName("Chris"), cleanDisplayName("Chris"));
});

test("teams support two or more players and auto balance", () => {
  const players = autoBalancePlayers([1, 2, 3, 4, 5, 6].map((id) => ({ id, lifecycle_status: "active" })));
  assert.deepEqual(players.map((player) => player.team_id), ["team_a", "team_b", "team_a", "team_b", "team_a", "team_b"]);
  assert.deepEqual(validateTeams(players), []);
  assert.equal(validateTeams(players.slice(0, 3)).length, 1);
});

test("pair play creates exact two-person pairs", () => {
  const paired = autoPairPlayers([1, 2, 3, 4].map((id) => ({ id })));
  assert.deepEqual(validatePairs(paired), []);
  assert.equal(validatePairs(autoPairPlayers(paired.slice(0, 3))).length, 1);
});

test("fair Tiptoe roles rotate and never match", () => {
  const players = ["a", "b", "c", "d"].map((id) => ({ id, lifecycle_status: "active" }));
  const first = nextFairRoles(players, 1);
  const second = nextFairRoles(players, 2);
  assert.notEqual(first.clueGiverId, first.guesserId);
  assert.notDeepEqual(first, second);
});

test("party deck never repeats until explicitly refreshed", () => {
  const cards = Array.from({ length: 100 }, (_, index) => ({ id: `card-${index}` }));
  let deck = createDeck(cards);
  cards.forEach((card) => { deck = consumeDeckItem(deck, card.id); });
  assert.equal(deck.remaining.length, 0);
  assert.equal(new Set(deck.seenIds).size, 100);
});

test("Tiptoe actions are atomic and deadline-safe", () => {
  const state = { cardId: "one", score: 0, roundScore: 0, resolvedCardIds: [], deadlineAt: 2000 };
  const correct = tiptoeAction(state, "correct", 1000);
  assert.equal(correct.score, 1);
  assert.deepEqual(tiptoeAction(correct, "correct", 1001), correct);
  assert.deepEqual(tiptoeAction({ ...state, deadlineAt: 500 }, "correct", 501), { ...state, deadlineAt: 500 });
  assert.equal(remainingRoundMs(30000, 0), 30000);
});

test("Tiptoe packs contain 100 unique cards and targets each", () => {
  const result = validateTiptoePacks(TIPTOE_PACKS);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.ok(result.cardCount >= 300);
  assert.equal(result.targetCount, result.cardCount);
});

test("play format defaults and Teams choices stay explicit for Truth/Dare and Questions", () => {
  const truth = { gameMode: "truth_dare", playFormat: "individual", category: "mild", pairMode: false };
  assert.equal(normalizeSetupSelection(truth, {}).playFormat, "individual");
  assert.deepEqual(setupStepsForState(truth), ["game", "format", "display", "settings", "players", "review"]);
  assert.deepEqual(setupStepsForState(normalizeSetupSelection(truth, { playFormat: "teams" })), ["game", "format", "display", "settings", "players", "teams", "review"]);

  const questions = { ...truth, gameMode: "questions" };
  assert.equal(normalizeSetupSelection(questions, {}).playFormat, "individual");
  assert.deepEqual(setupStepsForState(questions), ["game", "format", "display", "settings", "players", "review"]);
  assert.deepEqual(setupStepsForState(normalizeSetupSelection(questions, { playFormat: "teams" })), ["game", "format", "display", "settings", "players", "teams", "review"]);
});

test("Tiptoe is Teams-only and leaving Tiptoe resets to Individual", () => {
  const truth = { gameMode: "truth_dare", playFormat: "individual", category: "mild", pairMode: false };
  const tiptoe = normalizeSetupSelection(truth, { gameMode: "tiptoe" });
  assert.equal(tiptoe.playFormat, "teams");
  assert.equal(tiptoe.pairMode, false);
  assert.deepEqual(setupStepsForState(tiptoe), ["game", "format", "display", "settings", "players", "teams", "review"]);

  const backToTruth = normalizeSetupSelection(tiptoe, { gameMode: "truth_dare" });
  assert.equal(backToTruth.playFormat, "individual");
  assert.equal(backToTruth.pairMode, false);
});

test("Couples / Flirty only opens team setup when Teams is selected", () => {
  const individual = { gameMode: "truth_dare", playFormat: "individual", category: "couples", pairMode: false };
  assert.equal(isPairPlayEligible(individual), false);
  assert.deepEqual(setupStepsForState(individual), ["game", "format", "display", "settings", "players", "review"]);

  const teams = normalizeSetupSelection(individual, { playFormat: "teams" });
  assert.equal(isPairPlayEligible(teams), true);
  assert.deepEqual(setupStepsForState(teams), ["game", "format", "display", "settings", "players", "teams", "review"]);
});

test("Pair Play clears when vibe or game no longer supports it", () => {
  const pairPlay = { gameMode: "questions", playFormat: "teams", category: "couples", pairMode: true };
  const wild = normalizeSetupSelection(pairPlay, { category: "wild" });
  assert.equal(wild.playFormat, "teams");
  assert.equal(wild.pairMode, false);

  const tiptoe = normalizeSetupSelection(pairPlay, { gameMode: "tiptoe" });
  assert.equal(tiptoe.playFormat, "teams");
  assert.equal(tiptoe.pairMode, false);
  assert.equal(isPairPlayEligible(tiptoe), false);
});
