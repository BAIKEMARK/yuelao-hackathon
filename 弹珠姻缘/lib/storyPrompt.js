export function buildStoryMessages({ cue, target, hitCount, tieBreak, noHit }) {
  const resultNote = noHit
    ? "本局没有直接命中，系统按红绳簿自动补签选出命定对象。请把故事写成一次由姻缘簿误签引发的相遇。"
    : `母球与命定对象相遇 ${hitCount} 次。${tieBreak ? "本局触发命运最后一撞规则。" : ""}`;

  return [
    {
      role: "system",
      content:
        "你是《红绳懒得系，弹珠自己撞》的姻缘簿撰写官。只输出 JSON，不要输出 Markdown。必须返回 title、relationshipTag、story、yuelaoComment 四个非空字符串字段。故事要把弹珠碰撞解释为相遇或擦肩，不要直接描写角色被球撞。关系可以是爱情、知己、欢喜冤家、误会拉扯或礼貌错过，不要强行恋爱。"
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
    parsed = JSON.parse(extractJsonText(content));
  } catch (error) {
    throw new Error("StepFun response is not valid JSON");
  }

  const normalized = Array.isArray(parsed) ? parsed[0] : parsed;
  const story = requireText(pickText(normalized, ["story", "故事", "姻缘故事"]), "story");
  const title = pickText(normalized, ["title", "档案标题", "标题"]) || "林间误签";
  const relationshipTag = requireText(pickText(normalized, ["relationshipTag", "关系标签", "关系"]), "relationshipTag");
  const yuelaoComment = requireText(pickText(normalized, ["yuelaoComment", "月老批注", "批注"]), "yuelaoComment");

  return {
    title,
    relationshipTag,
    story,
    yuelaoComment
  };
}

export function assertStoryFitsResult(payload) {
  const forbiddenPattern = /弹珠|台球|母球|球杆|球局|撞上|撞到|相撞|碰撞/;

  if (forbiddenPattern.test(payload.story)) {
    throw new Error("StepFun story contains physical marble terms");
  }

  return payload;
}

function extractJsonText(content) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function pickText(source, keys) {
  for (const key of keys) {
    if (typeof source?.[key] === "string" && source[key].trim()) {
      return source[key].trim();
    }
  }
  return "";
}

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`StepFun response missing ${fieldName}`);
  }

  return value.trim();
}
