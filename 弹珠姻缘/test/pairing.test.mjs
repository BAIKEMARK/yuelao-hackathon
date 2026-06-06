import assert from "node:assert/strict";
import test from "node:test";
import { characters, splitCueAndTargets } from "../lib/characters.js";
import { resolveWinner } from "../lib/pairing.js";

test("splitCueAndTargets returns selected cue and the remaining nine targets", () => {
  const result = splitCueAndTargets("lin-daiyu");

  assert.equal(result.cue.name, "林黛玉");
  assert.equal(result.targets.length, 9);
  assert.equal(result.targets.some((character) => character.id === "lin-daiyu"), false);
});

test("character pool contains exactly ten unique characters", () => {
  assert.equal(characters.length, 10);
  assert.equal(new Set(characters.map((character) => character.id)).size, 10);
});

test("resolveWinner selects the unique highest hit count", () => {
  const result = resolveWinner(
    { "sun-wukong": 3, "jia-baoyu": 1 },
    "jia-baoyu",
    ["sun-wukong", "jia-baoyu"]
  );

  assert.equal(result.winnerId, "sun-wukong");
  assert.equal(result.tieBreak, false);
  assert.equal(result.noHit, false);
});

test("resolveWinner uses lastHitId when tied for highest count", () => {
  const result = resolveWinner(
    { "sun-wukong": 2, "jia-baoyu": 2 },
    "jia-baoyu",
    ["sun-wukong", "jia-baoyu"]
  );

  assert.equal(result.winnerId, "jia-baoyu");
  assert.equal(result.tieBreak, true);
});

test("resolveWinner returns first target as no-hit fallback", () => {
  const result = resolveWinner({}, null, ["sun-wukong", "jia-baoyu"]);

  assert.equal(result.winnerId, "sun-wukong");
  assert.equal(result.noHit, true);
});
