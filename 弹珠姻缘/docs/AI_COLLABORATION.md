# 弹珠姻缘 AI 协作开发文档

本文档给后续接手《红绳懒得系，弹珠自己撞》的 AI 代理阅读，重点约束多 AI 分工、接口契约、页面边界、Prompt 输出和图片资源路径。

## 1. 当前目录与入口

项目根目录：

```text
弹珠姻缘/
```

核心代码：

```text
弹珠姻缘/
  app/
    page.jsx
    globals.css
    api/generate-story/route.js
  components/
    StartScreen.jsx
    CharacterSelect.jsx
    MarbleBoard.jsx
    ResultCard.jsx
    Gallery.jsx
  lib/
    characters.js
    pairing.js
    galleryStorage.js
    storyPrompt.js
    stepfunClient.js
  test/
    pairing.test.mjs
    storyPrompt.test.mjs
    galleryStorage.test.mjs
  public/
    assets/
      README.md
```

关键文档：

- `弹珠姻缘/docs/红绳懒得系，弹珠自己撞_PRD_产品最终版.md`
- `弹珠姻缘/docs/PROJECT_CONTEXT.md`
- `弹珠姻缘/docs/plan/2026-06-06-marble-cp-h5.md`
- `弹珠姻缘/docs/plan/2026-06-06-marble-cp-design.md`
- `弹珠姻缘/docs/plan/2026-06-06-marble-cp-implementation.md`
- `弹珠姻缘/docs/changelog/codex.md`

## 2. 当前架构

这是前端页面 + Next.js API route 的 H5 项目，不是纯静态前端。

- 前端负责页面流程、弹珠盘、结果展示和图鉴本地持久化。
- API route 负责读取服务端 `API_KEY` 并调用 StepFun。
- AI 只生成表达内容，不决定 CP 胜出规则。

核心流程状态在 `app/page.jsx`：

```text
start -> select -> board -> generating -> result -> gallery
```

## 3. 共享接口契约

### 3.1 生成接口

前端只请求：

```text
POST /api/generate-story
```

请求体：

```ts
type GenerateStoryRequest = {
  cue: {
    id?: string;
    name: string;
    source: string;
    tag: string;
  };
  target: {
    id?: string;
    name: string;
    source: string;
    tag: string;
  };
  hitCount: number;
  tieBreak: boolean;
  noHit: boolean;
};
```

当前响应：

```ts
type GenerateStoryResponse = {
  title: string;
  relationshipTag: string;
  story: string;
  yuelaoComment: string;
};
```

任何人改 AI 输出时必须保留以上四个字段，字段名不能改。新增报纸字段时使用可选字段：

```ts
type GenerateStoryResponseWithNewspaper = GenerateStoryResponse & {
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

`ResultCard` 或后续 `NewspaperCard` 可以优先使用 `newspaper`，但必须能在没有 `newspaper` 时继续用四字段结果渲染。

### 3.2 图鉴存储

浏览器本地存储 key：

```text
marble_cp_gallery_v1
```

记录结构由 `lib/galleryStorage.js` 生成。新增字段必须向后兼容，读取旧记录时不能崩。

## 4. 后续分工建议

### 4.1 UI 布局优化

目标：优化手机端视觉、排版、操作状态和结果页体验。

可改：

- `components/StartScreen.jsx`
- `components/CharacterSelect.jsx`
- `components/MarbleBoard.jsx`
- `components/ResultCard.jsx`
- `components/Gallery.jsx`
- `app/globals.css`

谨慎改：

- `app/page.jsx` 只能改页面组合和状态文案，不能改请求/响应契约。

不可改：

- `lib/storyPrompt.js`
- `lib/stepfunClient.js`
- `lib/pairing.js`

验收：

- 手机 390px 宽度下无文字重叠。
- 弹珠盘可见、可发射、统计可见。
- 结果页适合截图。
- `npm test` 和 `npm run build` 通过。

### 4.2 AI 报纸 Prompt / Agent

目标：把当前“姻缘档案”增强为“AI 生成报纸”语气和结构。

可改：

- `lib/storyPrompt.js`
- `lib/stepfunClient.js`
- `test/storyPrompt.test.mjs`

必须保留：

- `title`
- `relationshipTag`
- `story`
- `yuelaoComment`

可新增：

- `newspaper.headline`
- `newspaper.subhead`
- `newspaper.editionName`
- `newspaper.lead`
- `newspaper.columns`
- `newspaper.pullQuote`
- `newspaper.footerNote`

Prompt 必须继续约束：

- 不写“弹珠撞人”“台球撞上”“母球撞到某人”等物理撞击描述。
- 把碰撞解释为相遇、擦肩、误签、命运安排。
- 不能让 AI 决定 `winnerId`、`hitCount`、`tieBreak`、`noHit`。
- API 失败时前端显示重试，不编造固定离线故事。

### 4.3 报纸页面布局

目标：把结果卡改成“姻缘日报 / 天庭小报 / 报纸档案”视觉。

建议新增：

```text
弹珠姻缘/components/NewspaperCard.jsx
```

可改：

- `components/ResultCard.jsx`
- `components/NewspaperCard.jsx`
- `app/globals.css`
- `public/assets/newspaper/*`

接口约束：

- 若 `archive.newspaper` 存在，渲染报纸结构。
- 若 `archive.newspaper` 不存在，使用 `title`、`relationshipTag`、`story`、`yuelaoComment` 渲染旧结果卡。

页面结构建议：

```text
报头：姻缘日报 / 本局 CP
主标题：headline 或 title
副标题：subhead
关系标签：relationshipTag
导语：lead
双栏正文：columns
引语：pullQuote
月老批注：yuelaoComment / footerNote
按钮：存入图鉴、再撞一次、查看图鉴
```

### 4.4 图片资源与贴图

目标：替换文字/色块占位，形成统一视觉资产。

只放在：

```text
弹珠姻缘/public/assets/
```

前端引用：

```text
/assets/...
```

不要使用：

- 远程 URL。
- 本机绝对路径。
- CDN。
- 未压缩大图。
- 直接把 base64 大图写入 CSS/JS。

详细路径见 `弹珠姻缘/public/assets/README.md`。

## 5. 合并规则

每个分工必须：

1. 开工前读 `AGENTS.md`、`README.md`、`弹珠姻缘/docs/PROJECT_CONTEXT.md`、本文档和当前任务相关文件。
2. 开工前执行：

```bash
git status --short
git branch --show-current
```

3. 不回滚陌生改动。
4. 不改无关模块。
5. 改接口必须同步测试和本文档。
6. 改 Prompt 必须同步 `test/storyPrompt.test.mjs`。
7. 改图鉴存储必须同步 `test/galleryStorage.test.mjs`。
8. 改胜出规则必须同步 `test/pairing.test.mjs`。
9. 完成后更新自己的 changelog。

推荐验证：

```bash
cd 弹珠姻缘
npm test
rm -rf .next && npm run build
```

涉及 UI 的任务还要跑通：

```text
开始页 -> 选角色 -> 发射 -> AI 结果 -> 存图鉴 -> 刷新后图鉴仍存在
```

## 6. 当前不可破坏的验收点

- 首页 5 秒内能理解“选角色、撞 CP、AI 生成档案”。
- 可选择 1 个母球，剩余 9 个角色进入弹珠盘。
- 每局只发射 1 次。
- 倒计时结束后按规则锁定 CP。
- 并列使用最后一次命中对象。
- 无命中使用补签结果，不中断流程。
- AI route 不暴露 `API_KEY`。
- AI story 不直接描写物理撞击。
- 图鉴刷新后仍保留记录。
- `npm test` 和 `npm run build` 通过。
