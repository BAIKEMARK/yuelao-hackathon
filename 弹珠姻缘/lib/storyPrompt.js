export function buildStoryMessages({ cue, target, hitCount, tieBreak, noHit }) {
  const resultNote = noHit
    ? "本局没有直接命中，系统按红绳簿自动补签选出命定对象。不要假装发生过碰撞。"
    : `母球与命定对象相遇 ${hitCount} 次。${tieBreak ? "本局触发命运最后一撞规则。" : ""}`;

  return [
    {
      role: "system",
      content:
        "你是《红绳懒得系，弹珠自己撞》的姻缘簿撰写官。只输出 JSON，不要输出 Markdown。故事要把弹珠碰撞解释为相遇或擦肩，不要直接描写角色被球撞。关系可以是爱情、知己、欢喜冤家、误会拉扯或礼貌错过，不要强行恋爱。"
    },
    {
      role: "user",
      content: [
        `母球角色：${cue.name}，来源：${cue.source}，性格：${cue.tag}`,
        `命定对象：${target.name}，来源：${target.source}，性格：${target.tag}`,
        resultNote,
        '请返回 JSON：{"title":"档案标题","relationshipTag":"关系标签","story":"120-180 字姻缘故事","yuelaoComment":"一句月老批注"}'
      ].join("\n")
    }
  ];
}

export function normalizeStoryPayload(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("StepFun response is not valid JSON");
  }

  const title = requireText(parsed.title, "title");
  const relationshipTag = requireText(parsed.relationshipTag, "relationshipTag");
  const story = requireText(parsed.story, "story");
  const yuelaoComment = requireText(parsed.yuelaoComment, "yuelaoComment");

  return {
    title,
    relationshipTag,
    story,
    yuelaoComment
  };
}

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`StepFun response missing ${fieldName}`);
  }

  return value.trim();
}
