# 红绳懒得系，弹珠自己撞

黑客松互动作品。用户扮演偷懒月老，选择一个名著角色作为母球，拖动瞄准并发射一次，让角色球在封闭弹珠盘里自动碰撞。母球撞到次数最多的角色成为本局 CP，随后由 AI 生成姻缘档案并存入 CP 图鉴。

## 当前项目目录

当前项目相关内容集中在：

```text
弹珠姻缘/
```

关键文档：

- `弹珠姻缘/docs/红绳懒得系，弹珠自己撞_PRD_产品最终版.md`：产品最终 PRD。
- `弹珠姻缘/docs/PROJECT_CONTEXT.md`：当前项目上下文和开发口径。
- `弹珠姻缘/docs/AI_COLLABORATION.md`：后续多 AI 分工、接口、Prompt、报纸布局和资源路径协作规范。
- `弹珠姻缘/docs/plan/2026-06-06-marble-cp-h5.md`：H5 实施计划。
- `弹珠姻缘/docs/changelog/codex.md`：Codex 工作日志。

仓库级协作入口：

- `AGENTS.md`：AI 协作开发规范。

## 技术方向

- 手机端 H5，竖屏优先。
- Next.js + React。
- Canvas + Matter.js 实现封闭弹珠盘。
- 视觉先用文字/色块占位，后续替换背景图和角色球贴图。
- AI 接入 StepFun `step-3.7-flash`。
- 根目录 `.env` 中的 `API_KEY` 只能由服务端代理读取，不能暴露给前端。

## 快速启动

macOS：

```bash
./start-mac.command
```

Windows：

```bat
start-win.bat
```

脚本会进入 `弹珠姻缘/`，缺少 `node_modules` 时自动执行 `npm install`，然后启动 `npm run dev`。启动后打开：

```text
http://localhost:3000
```

## 当前核心流程

```text
开始界面
  -> 选择 1 个母球角色
  -> 剩余 9 个角色进入封闭弹珠盘
  -> 拖动瞄准并控制力度
  -> 发射 1 次
  -> 倒计时内自动碰撞统计
  -> 最高碰撞次数锁定 CP
  -> AI 生成姻缘档案
  -> 存入 CP 图鉴
```

旧“月老牵线局”PRD 和废案不再作为当前产品方向。

## 后续分工入口

后续拆分 UI 优化、AI 报纸 Prompt / Agent、报纸结果页布局、图片资源时，先读：

```text
弹珠姻缘/docs/AI_COLLABORATION.md
弹珠姻缘/public/assets/README.md
```

必须保持 `/api/generate-story` 现有四字段响应兼容：`title`、`relationshipTag`、`story`、`yuelaoComment`。新增报纸字段只能作为可选扩展，不能破坏当前结果页和图鉴。
