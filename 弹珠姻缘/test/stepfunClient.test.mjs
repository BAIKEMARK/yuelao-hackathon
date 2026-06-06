import assert from "node:assert/strict";
import test from "node:test";
import { assertStoryFitsResult } from "../lib/storyPrompt.js";
import { createFallbackStory } from "../lib/stepfunClient.js";

test("createFallbackStory returns a complete archive without physical marble terms", () => {
  const archive = createFallbackStory({
    cue: { name: "林黛玉", source: "红楼梦", tag: "敏感清醒" },
    target: { name: "孙悟空", source: "西游记", tag: "直来直去" },
    hitCount: 3,
    tieBreak: true,
    noHit: false
  });

  assert.equal(typeof archive.title, "string");
  assert.equal(typeof archive.relationshipTag, "string");
  assert.equal(typeof archive.story, "string");
  assert.equal(typeof archive.yuelaoComment, "string");
  assert.ok(archive.title);
  assert.ok(archive.relationshipTag);
  assert.ok(archive.story);
  assert.ok(archive.yuelaoComment);
  assert.equal(assertStoryFitsResult(archive), archive);
});
