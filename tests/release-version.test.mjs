import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const gradle = fs.readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8");
const release = JSON.parse(fs.readFileSync(new URL("../public/release.json", import.meta.url), "utf8"));

test("release provenance is internally consistent", () => {
  assert.equal(pkg.version, "1.1.3");
  assert.match(gradle, /versionName\s+"1\.1\.3"/);
  assert.match(gradle, /versionCode\s+5\b/);
  assert.equal(release.version, "1.1.3");
  assert.equal(release.androidVersionCode, 5);
  assert.deepEqual(release.requiredSetupFlow.slice(0, 5), [
    "game",
    "play_format",
    "display_mode",
    "settings",
    "players"
  ]);
  assert.equal(release.tvPlayerEntry, "explicit_add_player_no_autofocus");
});
