# 《红绳懒得系，弹珠自己撞》H5 设计说明

时间：2026-06-06

## 目标

按当前 PRD 与实施计划交付一个手机端优先的 AI H5 MVP：

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

本期只做这条闭环。不增加多次发射、道具、账号、分享长图、离线故事兜底或旧版三回合相亲玩法。

## 架构

`弹珠姻缘/` 作为独立 Next.js 应用。页面状态由 `app/page.jsx` 管理，流程组件只负责自己的界面和事件回传。确定性业务规则放在 `lib/`，用 Node 内置 test runner 覆盖；Canvas 和 Matter.js 只负责物理表现，不承担最终规则判定。

推荐文件边界：

```text
弹珠姻缘/
  package.json
  next.config.mjs
  app/
    layout.jsx
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
    storyPrompt.js
    galleryStorage.js
    stepfunClient.js
  test/
    pairing.test.mjs
    storyPrompt.test.mjs
    galleryStorage.test.mjs
```

## 页面与数据流

`StartScreen` 展示标题、玩法口径、开始按钮和图鉴入口。点击开始进入 `CharacterSelect`，点击图鉴读取本地保存档案。

`CharacterSelect` 使用 `characters` 的 10 个角色。用户只能选 1 个母球；选中后返回 `{ cue, targets }`，其中 `targets` 为剩余 9 个角色。

`MarbleBoard` 初始化封闭弹珠盘、母球和目标球。用户拖动母球后松手发射；发射后锁定操作并启动倒计时。碰撞监听只记录母球与目标球的直接接触，更新 `hitCounts` 和 `lastHitId`。倒计时结束后停止统计，调用 `resolveWinner` 输出最终对象。

`page.jsx` 收到碰撞结果后进入 AI 生成状态，调用 `/api/generate-story`。接口返回结构化姻缘档案后进入 `ResultCard`。

`ResultCard` 展示 CP 双方、关系标签、故事、月老批注和碰撞摘要。点击存入图鉴时写入 localStorage，点击再撞一次回到选角或开始页。

`Gallery` 从 `marble_cp_gallery_v1` 读取档案列表，展示 CP 双方、标题、关系标签、故事摘要和创建时间。

## 规则

胜出规则必须可预测：

```js
resolveWinner(hitCounts, lastHitId)
```

- 唯一最高碰撞次数者胜出。
- 并列时取 `lastHitId`，产品解释为“命运最后一撞”。
- 若没有任何命中，返回目标池中的第一个角色，并标记 `noHit: true`，避免流程停住。AI prompt 要把它描述为“红绳簿自动补签”，不假装发生过碰撞。

球体边界规则由 Matter.js 墙体和每帧位置夹取共同保证：球体不能离开盘面；若出现异常坐标，按最近合法位置拉回。

## AI 生成

前端只请求本项目的 `/api/generate-story`，不直接读取密钥。服务端 route 读取仓库根目录 `.env` 的 `API_KEY`，调用 StepFun `step-3.7-flash`。

请求输入包含：

- 母球角色姓名、来源、标签。
- 命定对象姓名、来源、标签。
- 命中次数。
- 是否命运最后一撞。
- 是否无命中自动补签。

响应结构：

```js
{
  title: string,
  relationshipTag: string,
  story: string,
  yuelaoComment: string
}
```

本期按 PRD 不做离线固定故事兜底。若接口失败，页面保持错误状态并允许用户重试生成，不自动编造故事。

## 测试与验证

测试优先覆盖无需浏览器的确定性逻辑：

- 角色池拆分后目标数量恒为 9。
- 唯一最高碰撞次数胜出。
- 并列时 `lastHitId` 胜出。
- 无命中时有明确补签结果。
- prompt 包含双方角色、命中次数、命运最后一撞或补签标记。
- 图鉴存储能序列化、反序列化、按时间保留记录。

验收命令：

```bash
cd 弹珠姻缘
npm test
npm run build
npm run dev
```

手动验收：

1. 打开开始页，5 秒内能理解选择角色并撞 CP。
2. 选择任意母球后，盘面出现 9 个目标角色。
3. 拖动发射只能执行一次。
4. 倒计时内碰撞统计可见，倒计时后锁定 CP。
5. AI 生成状态不暴露 `API_KEY`。
6. 姻缘档案可存入图鉴。
7. 刷新页面后图鉴仍能看到此前记录。

## 范围风险

- StepFun 接口字段以实际调通为准，但前端只依赖本项目 route 的稳定响应结构。
- Matter.js 移动触摸需要专门处理 pointer 坐标和 canvas 缩放。
- 现有仓库有未提交迁移改动，本任务只新增当前项目文件，不回滚旧 PRD 删除和废案整理。
