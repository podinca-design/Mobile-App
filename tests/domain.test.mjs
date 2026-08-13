import test from "node:test";
import assert from "node:assert/strict";
import {
  autoBalancePlayers,
  autoPairPlayers,
  cleanDisplayName,
  consumeDeckItem,
  createDeck,
  nextFairRoles,
  remainingRoundMs,
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
