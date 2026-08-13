export const PLAYER_LIFECYCLE = Object.freeze({
  ACTIVE: "active",
  PENDING: "pending",
  SITTING_OUT: "sitting_out",
  SPECTATOR: "spectator",
  DISCONNECTED: "disconnected",
  REMOVED: "removed",
});

export function cleanDisplayName(value, maxLength = 32) {
  return String(value || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function createPlayer(name, order = 0, overrides = {}) {
  return {
    id: overrides.id || `player-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`,
    client_session_id: overrides.client_session_id || `session-${crypto.randomUUID?.() || Date.now()}`,
    name: cleanDisplayName(name),
    join_order: order,
    lifecycle_status: PLAYER_LIFECYCLE.ACTIVE,
    ready: false,
    team_id: null,
    pair_id: null,
    last_seen_at: new Date().toISOString(),
    ...overrides,
  };
}

export function autoBalancePlayers(players, teamIds = ["team_a", "team_b"]) {
  return players.map((player, index) => ({ ...player, team_id: teamIds[index % teamIds.length] }));
}

export function validateTeams(players, teamIds = ["team_a", "team_b"], minimum = 2) {
  const active = players.filter((player) => player.lifecycle_status !== PLAYER_LIFECYCLE.REMOVED && player.lifecycle_status !== PLAYER_LIFECYCLE.SPECTATOR);
  return teamIds.map((teamId) => ({
    teamId,
    count: active.filter((player) => player.team_id === teamId).length,
  })).filter((team) => team.count < minimum);
}

export function autoPairPlayers(players) {
  return players.map((player, index) => ({ ...player, pair_id: `pair_${Math.floor(index / 2) + 1}` }));
}

export function validatePairs(players) {
  const counts = new Map();
  players.forEach((player) => {
    if (player.pair_id) counts.set(player.pair_id, (counts.get(player.pair_id) || 0) + 1);
  });
  return [...counts.entries()].filter(([, count]) => count !== 2).map(([pairId, count]) => ({ pairId, count }));
}

export function nextFairRoles(teamPlayers, roundNumber = 1) {
  const active = teamPlayers.filter((player) => player.lifecycle_status === PLAYER_LIFECYCLE.ACTIVE);
  if (active.length < 2) return { clueGiverId: null, guesserId: null };
  const base = ((roundNumber - 1) * 2) % active.length;
  return {
    clueGiverId: active[base].id,
    guesserId: active[(base + 1) % active.length].id,
  };
}

export function createDeck(items, seenIds = []) {
  const seen = new Set(seenIds);
  return {
    remaining: items.filter((item) => !seen.has(item.id)),
    seenIds: [...seen],
  };
}

export function consumeDeckItem(deck, itemId) {
  if (deck.seenIds.includes(itemId)) return deck;
  return {
    remaining: deck.remaining.filter((item) => item.id !== itemId),
    seenIds: [...deck.seenIds, itemId],
  };
}

export function tiptoeAction(state, action, now = Date.now()) {
  if (!state.cardId || state.resolvedCardIds.includes(state.cardId) || now >= state.deadlineAt) return state;
  const points = action === "correct" ? 1 : action === "forbidden" ? -1 : 0;
  return {
    ...state,
    score: state.score + points,
    roundScore: state.roundScore + points,
    resolvedCardIds: [...state.resolvedCardIds, state.cardId],
    lastResolution: action,
  };
}

export function remainingRoundMs(deadlineAt, now = Date.now()) {
  return Math.max(0, deadlineAt - now);
}
