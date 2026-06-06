# AGENTS.md

本文档给参与《红绳懒得系，弹珠自己撞》黑客松开发的 AI 代理阅读。目标是让多个 AI 在同一仓库内并行工作时，保持产品方向、接口契约、模块边界、资源路径和合并口径一致。

## 1. 当前项目基准

当前项目已确定为：

```text
《红绳懒得系，弹珠自己撞》
```

当前项目目录：

```text
弹珠姻缘/
```

旧“月老牵线局”、`传杯/`、`废案/`、根目录旧 PRD 都不是当前产品方向。不要恢复旧 PRD，不要把旧玩法并回当前项目，除非负责人明确要求。

## 2. 开工前必读

每个 AI 代理开始工作前，必须先读：

1. `AGENTS.md`
2. `README.md`
3. `弹珠姻缘/docs/PROJECT_CONTEXT.md`
4. `弹珠姻缘/docs/AI_COLLABORATION.md`
5. `弹珠姻缘/docs/红绳懒得系，弹珠自己撞_PRD_产品最终版.md`
6. 与当前任务直接相关的代码、计划、资源说明或测试文件

读取后先输出简短开工说明，至少包含：

- 本次任务目标。
- 计划触碰的文件范围。
- 当前所在分支和工作区状态。
- 验证方式。

如果没有先读这些文件，不要开始改代码或文档。

## 3. 当前核心闭环

当前 MVP 已按 AI H5 版本推进：

```text
开始界面
  -> 选择 1 个母球角色
  -> 剩余 9 个角色进入封闭弹珠盘
  -> 拖动瞄准并控制力度
  -> 发射 1 次
  -> 倒计时内自动碰撞统计
  -> 最高碰撞次数锁定 CP
  -> StepFun AI 生成姻缘档案
  -> 存入 CP 图鉴
```

不要改成旧版“三回合相亲”、账号系统、多发射、道具、复杂养成或社交玩法。

## 4. 技术边界

- 应用目录：`弹珠姻缘/`
- 框架：Next.js + React
- 弹珠盘：Canvas + Matter.js
- AI 接口：StepFun `step-3.7-flash`
- API route：`弹珠姻缘/app/api/generate-story/route.js`
- 服务端 client：`弹珠姻缘/lib/stepfunClient.js`
- Prompt 与结构解析：`弹珠姻缘/lib/storyPrompt.js`
- 角色数据：`弹珠姻缘/lib/characters.js`
- 胜出规则：`弹珠姻缘/lib/pairing.js`
- 图鉴存储：`弹珠姻缘/lib/galleryStorage.js`
- 样式：`弹珠姻缘/app/globals.css`

根目录 `.env` 中的 `API_KEY` 只能由服务端读取。不得把密钥写入前端、文档、提交记录或日志。

## 5. 分工与文件所有权

后续允许拆分为多个 AI 分工，但必须按文件范围隔离：

| 分工 | 可改文件 | 不可改 |
| --- | --- | --- |
| UI 布局优化 | `弹珠姻缘/components/*`、`弹珠姻缘/app/globals.css`、必要时 `弹珠姻缘/app/page.jsx` | 不改 API 请求/响应结构，不改规则阈值，不改 prompt 输出字段 |
| AI 报纸 Prompt / Agent | `弹珠姻缘/lib/storyPrompt.js`、`弹珠姻缘/lib/stepfunClient.js`、相关测试 | 不改前端流程，不让 AI 决定 CP 胜出规则 |
| 报纸结果页布局 | `弹珠姻缘/components/ResultCard.jsx`、后续可新增 `NewspaperCard.jsx`、样式和资源 | 不改 `/api/generate-story` 必填字段，不破坏现有结果卡消费 |
| 资源与视觉素材 | `弹珠姻缘/public/assets/`、`弹珠姻缘/public/assets/README.md`、样式引用 | 不引入远程图片/CDN，不把大图直接塞进代码 |
| 规则/物理盘 | `弹珠姻缘/components/MarbleBoard.jsx`、`弹珠姻缘/lib/pairing.js`、相关测试 | 不改 AI prompt，不改结果页布局 |

同一时间不要让两个 AI 修改同一个核心文件。确需多人接力时，先阅读 `弹珠姻缘/docs/changelog/codex.md` 和最近提交。

## 6. API 契约必须保持兼容

前端请求：

```http
POST /api/generate-story
Content-Type: application/json
```

请求体：

```ts
type GenerateStoryRequest = {
  cue: { id?: string; name: string; source: string; tag: string };
  target: { id?: string; name: string; source: string; tag: string };
  hitCount: number;
  tieBreak: boolean;
  noHit: boolean;
};
```

当前响应必须至少保留：

```ts
type GenerateStoryResponse = {
  title: string;
  relationshipTag: string;
  story: string;
  yuelaoComment: string;
};
```

如果后续做“AI 生成报纸”，只能向响应中新增可选字段，不得删除或改名现有四个字段：

```ts
type NewspaperPayload = {
  newspaper?: {
    headline: string;
    subhead: string;
    editionName: string;
    lead: string;
    columns: string[];
    pullQuote: string;
    footerNote: string;
  };
};
```

前端必须继续能用旧四字段渲染结果。新增字段必须有默认值或兼容策略，并补测试。

## 7. 内容与 Prompt 规则

- 碰撞阶段只产出数据，不生成剧情。
- AI 只能解释最终 CP 和相遇，不决定 `winnerId`、`hitCount`、`tieBreak`、`noHit`。
- `story` 不得直接写“弹珠撞人”“台球撞上”“母球撞到某人”等物理撞击描写。
- 当前 `assertStoryFitsResult` 会拒绝包含物理撞击词的故事，后续修改必须保留同等约束。
- 关系可以是爱情、欢喜冤家、知己、误会拉扯、礼貌错过；不要强行恋爱。
- 报纸风格可以轻喜剧，但不能压过角色人格。

## 8. 图片资源路径

所有静态图片放在：

```text
弹珠姻缘/public/assets/
```

前端引用路径统一使用：

```text
/assets/...
```

详细路径规范见：

```text
弹珠姻缘/public/assets/README.md
```

不要使用远程图片、远程字体、CDN 或本机绝对路径。图片应优先用压缩后的 `.webp` 或 `.png`。

## 9. Git 与验证

开始修改前必须执行：

```bash
git status --short
git branch --show-current
```

如果发现未提交改动：

- 不是自己造成的，不要回滚。
- 与当前任务无关，忽略。
- 与当前任务冲突，先说明冲突文件和风险。

完成可验证小任务后及时提交。提交前至少运行匹配验证：

```bash
cd 弹珠姻缘
npm test
npm run build
```

涉及 UI 的任务还需要浏览器手动验收关键流程：

```text
开始页 -> 选角色 -> 发射 -> AI 结果 -> 存图鉴 -> 刷新后图鉴仍存在
```

## 10. 交接格式

完成任务后按以下格式交接：

```text
完成内容：
- ...

修改文件：
- ...

验证：
- ...

风险 / 待确认：
- ...

下一步建议：
- ...
```

如果任务未完成，直接说明卡在哪里、已尝试什么、需要谁确认。不要包装成完成。
