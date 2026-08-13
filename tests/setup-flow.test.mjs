import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

function sliceBetween(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("New Game routes to the setup wizard, not the legacy create screen", () => {
  const createRoute = sliceBetween('if (view === "create")', 'if (!hasSupabaseConfig');
  assert.match(createRoute, /<SetupWizardScreen/);
  assert.doesNotMatch(createRoute, /<CreateRoomScreen/);
});

test("setup wizard keeps configuration before player entry", () => {
  const wizard = sliceBetween("function SetupWizardScreen", "function JoinRoomScreen");
  assert.match(wizard, /const \[step, setStep\] = useState\("game"\)/);
  assert.match(wizard, /const steps = setupStepsForState\(\{ playFormat \}\)/);

  const game = wizard.indexOf('step === "game"');
  const format = wizard.indexOf('step === "format"');
  const display = wizard.indexOf('step === "display"');
  const settings = wizard.indexOf('step === "settings"');
  const players = wizard.indexOf('step === "players"');
  const review = wizard.indexOf('step === "review"');

  assert.ok(game < format && format < display && display < settings && settings < players && players < review,
    "Expected Game -> Format -> Display -> Settings -> Players -> Review order");
});

test("TV/local player entry does not autofocus the keyboard", () => {
  const wizard = sliceBetween("function SetupWizardScreen", "function JoinRoomScreen");
  assert.doesNotMatch(wizard, /autoFocus/);
  assert.match(wizard, /id="add-player-button"/);
  assert.match(wizard, /onClick=\{\(\) => focusElement\("player-name-entry"\)\}/);
});

test("TV + Phones keeps the television display-only during player entry", () => {
  const wizard = sliceBetween("function SetupWizardScreen", "function JoinRoomScreen");
  assert.match(wizard, /displayMode === "tv_phones"/);
  assert.match(wizard, /does not consume a player seat/);
  assert.match(wizard, /Players enter their own names after scanning the room QR/);
});

test("team setup supports naming and assigning teams", () => {
  const wizard = sliceBetween("function SetupWizardScreen", "function JoinRoomScreen");
  assert.match(wizard, /team_a: "Team A", team_b: "Team B"/);
  assert.match(wizard, /Auto Balance/);
  assert.match(wizard, /team_id:value/);
});
