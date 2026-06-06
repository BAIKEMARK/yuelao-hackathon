import assert from "node:assert/strict";
import test from "node:test";
import { buildStoryMessages, normalizeStoryPayload } from "../lib/storyPrompt.js";

const baseInput = {
  cue: { name: "林黛玉", source: "红楼梦", tag: "嘴上带刺，心里很明" },
  target: { name: "孙悟空", source: "西游记", tag: "不会弯弯绕，但敢闯敢认" },
  hitCount: 5,
  tieBreak: true,
  noHit: false
};

test("buildStoryMessages includes characters, hit count, and tie-break wording", () => {
  const messages = buildStoryMessages(baseInput);
  const serialized = JSON.stringify(messages);

  assert.equal(messages.length, 2);
  assert.match(serialized, /林黛玉/);
  assert.match(serialized, /孙悟空/);
  assert.match(serialized, /5/);
  assert.match(serialized, /命运最后一撞/);
});

test("buildStoryMessages marks no-hit fallback without pretending collisions happened", () => {
  const messages = buildStoryMessages({ ...baseInput, hitCount: 0, tieBreak: false, noHit: true });
  const serialized = JSON.stringify(messages);

  assert.match(serialized, /红绳簿自动补签/);
  assert.doesNotMatch(serialized, /撞到命定对象 0 次/);
});

test("normalizeStoryPayload parses structured JSON content", () => {
  const payload = normalizeStoryPayload(
    JSON.stringify({
      title: "竹林里的一记回眸",
      relationshipTag: "意外知己",
      story: "他们把五次相遇都当成一场误会，最后却记住了彼此。",
      yuelaoComment: "红绳没系，账先记上。"
    })
  );

  assert.equal(payload.title, "竹林里的一记回眸");
  assert.equal(payload.relationshipTag, "意外知己");
  assert.match(payload.story, /五次相遇/);
  assert.equal(payload.yuelaoComment, "红绳没系，账先记上。");
});
