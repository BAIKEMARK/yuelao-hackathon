export const characters = [
  { id: "lin-daiyu", name: "林黛玉", source: "红楼梦", tag: "嘴上带刺，心里很明", color: "#d94a5c" },
  { id: "jia-baoyu", name: "贾宝玉", source: "红楼梦", tag: "见谁都多情，偏又真诚", color: "#e09742" },
  { id: "xue-baochai", name: "薛宝钗", source: "红楼梦", tag: "稳得住场，也藏得住话", color: "#c9a227" },
  { id: "sun-wukong", name: "孙悟空", source: "西游记", tag: "不会弯弯绕，但敢闯敢认", color: "#d6422b" },
  { id: "tang-seng", name: "唐僧", source: "西游记", tag: "慈悲克制，偶尔念叨", color: "#b782e0" },
  { id: "zhu-bajie", name: "猪八戒", source: "西游记", tag: "热闹直接，容易跑偏", color: "#d986b6" },
  { id: "wu-song", name: "武松", source: "水浒传", tag: "硬气可靠，不爱废话", color: "#4b8f7d" },
  { id: "lu-zhishen", name: "鲁智深", source: "水浒传", tag: "粗中有细，路见不平", color: "#6b9d3f" },
  { id: "zhuge-liang", name: "诸葛亮", source: "三国演义", tag: "算无遗策，也怕真心失算", color: "#4777b8" },
  { id: "guan-yu", name: "关羽", source: "三国演义", tag: "义字当头，慢热重诺", color: "#7d3d2e" }
];

export function splitCueAndTargets(cueId) {
  const cue = characters.find((character) => character.id === cueId);

  if (!cue) {
    throw new Error(`Unknown cue character: ${cueId}`);
  }

  return {
    cue,
    targets: characters.filter((character) => character.id !== cueId)
  };
}

export function findCharacter(characterId) {
  return characters.find((character) => character.id === characterId);
}
