import assert from "node:assert/strict";
import test from "node:test";
import { assertStoryFitsResult, buildStoryMessages, normalizeStoryPayload } from "../lib/storyPrompt.js";

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

test("normalizeStoryPayload accepts common Chinese field names and fills title", () => {
  const payload = normalizeStoryPayload(
    JSON.stringify({
      关系标签: "礼貌错过",
      故事: "她把这次补签看作簿子犯懒，他却认真收下这页纸，转身仍旧把花影留在原处。",
      月老批注: "没撞上也能记账，月老今日算是偷懒成功。"
    })
  );

  assert.equal(payload.title, "林间误签");
  assert.equal(payload.relationshipTag, "礼貌错过");
  assert.match(payload.story, /补签/);
  assert.match(payload.yuelaoComment, /偷懒成功/);
});

test("assertStoryFitsResult rejects literal marble impact story text", () => {
  assert.throws(
    () =>
      assertStoryFitsResult({
        title: "林间误签",
        relationshipTag: "误会拉扯",
        story: "母球滚过台面，正撞上贾宝玉攥在手里的弹珠。",
        yuelaoComment: "这局误签。"
      }),
    /physical marble terms/
  );
});

test("assertStoryFitsResult accepts encounter-style story text", () => {
  const payload = {
    title: "林间误签",
    relationshipTag: "误会拉扯",
    story: "姻缘簿误签了半页，她在回廊里与他擦肩，话说得带刺，心里却明白这次相遇不是全无缘由。",
    yuelaoComment: "误签也有误签的章法。"
  };

  assert.equal(assertStoryFitsResult(payload), payload);
});
