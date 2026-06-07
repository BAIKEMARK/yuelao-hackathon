# Codex Changelog

时间：2026-06-06 21:06

任务：确定弹珠姻缘项目开发口径
分支：main
修改：
- 将项目方向锁定为《红绳懒得系，弹珠自己撞》
- 记录 StepFun `step-3.7-flash`、根目录 `.env` 的 `API_KEY`、服务端代理、贴图占位和 Matter.js 弹珠实现口径
- 新增 H5 实施计划，作为弹珠项目开发依据
验证：
- 检查项目文档已指向弹珠姻缘最新 PRD 和当前核心流程
- 检查计划文件位于 `弹珠姻缘/docs/plan/`
风险：
- 当时计划尚未执行，Next.js 项目和 API 调用仍需开发验证

时间：2026-06-06 21:14

任务：集中整理弹珠姻缘项目文档
分支：main
修改：
- 将产品 PRD 移入 `弹珠姻缘/docs/`
- 将 H5 实施计划移入 `弹珠姻缘/docs/plan/`
- 将 Codex changelog 移入 `弹珠姻缘/docs/changelog/`
- 更新根目录 README，统一指向当前项目目录与新文档路径
验证：
- 检查当前项目文档已集中在 `弹珠姻缘/docs/`
- 检查根目录 README 已写明当前项目目录 `弹珠姻缘/`
风险：
- 后续已清理旧方案目录和旧 PRD

时间：2026-06-06 22:35

任务：实现弹珠姻缘 AI H5 MVP 主闭环
分支：agent/codex/marble-cp
修改：
- 新增 Next.js 应用骨架、移动端全局样式和构建脚本
- 新增 10 个名著角色、母球拆分规则、碰撞胜出规则和无命中补签规则
- 新增 StepFun prompt、服务端 `/api/generate-story` 代理和结构化响应解析
- 新增开始页、母球选择、Matter.js 弹珠盘、AI 生成等待、结果卡和 CP 图鉴
- 新增 localStorage 图鉴读写与记录创建逻辑
- 新增规则、prompt、图鉴存储测试
验证：
- `cd 弹珠姻缘 && npm test`：14 个测试通过
- `cd 弹珠姻缘 && rm -rf .next && npm run build`：Next.js 构建通过，`/api/generate-story` 为动态服务端路由
- `curl --max-time 45 -X POST http://localhost:3000/api/generate-story ...`：无命中补签路径返回 HTTP 200 和四字段姻缘档案
- 浏览器验收：开始页 -> 选林黛玉 -> 弹珠盘单次发射 -> AI 结果页 -> 存入图鉴 -> 刷新后图鉴记录仍存在
- 已确认根目录 `.env` 存在，但未读取或输出密钥内容
风险：
- npm install 报告 2 个 moderate audit 项，未执行会破坏版本的 `npm audit fix --force`
- StepFun 输出偶有结构不稳定，服务端已增加结构兼容、每次请求超时、最多三次真实 AI 重试，以及 story 物理撞击词校验；连续失败时前端仍显示重试生成

时间：2026-06-06 22:55

任务：补充多 AI 分工协作文档
分支：agent/codex/marble-cp
修改：
- 更新根目录 `AGENTS.md`，改为当前《红绳懒得系，弹珠自己撞》项目协作规范
- 更新 `README.md`，补充 `弹珠姻缘/docs/AI_COLLABORATION.md` 与资源规范入口
- 新增 `弹珠姻缘/docs/AI_COLLABORATION.md`，明确 UI、AI 报纸 Prompt / Agent、报纸布局、图片资源和规则模块的分工边界
- 新增 `弹珠姻缘/public/assets/README.md`，约定背景、角色、弹珠、报纸和 UI 资源路径
验证：
- 检查 README 已写明当前项目目录 `弹珠姻缘/`
- 检查协作文档保留 `/api/generate-story` 现有四字段响应契约
- 检查资源规范统一使用 `/assets/...` 前端引用路径
- `npm test` 通过，14/14
- `rm -rf .next && npm run build` 通过
风险：
- 后续真正接入报纸字段时仍需同步 `storyPrompt` 测试和结果页兼容逻辑

时间：2026-06-06 23:08

任务：清理旧版本并降低 Agent 文档命名混淆
分支：agent/codex/marble-cp
修改：
- 将根目录 `Agent.md` 改名为 `弹珠姻缘/docs/PROJECT_CONTEXT.md`
- 更新 `AGENTS.md`、`README.md` 和 `弹珠姻缘/docs/AI_COLLABORATION.md` 中的开工必读路径
- 保留根目录 `AGENTS.md` 作为 AI 工具约定入口
- 删除旧方案目录 `传杯/`、`废案/`、`.superpowers/` 和 `docs/superpowers/`
- 删除旧“月老牵线”PRD 和根目录旧 changelog
验证：
- `find . -maxdepth 3 ...` 未发现旧“月老牵线”、`传杯`、`废案`、`pass-the-cup` 文件或目录残留
- 检查 `AGENTS.md`、`README.md`、`AI_COLLABORATION.md` 已指向 `弹珠姻缘/docs/PROJECT_CONTEXT.md`
- `npm test` 通过，14/14
- `rm -rf .next && npm run build` 通过
风险：
- 根目录 `AGENTS.md` 会保留，因为它是 AI 工具默认协作入口

时间：2026-06-06 23:18

任务：精简 changelog 为弹珠版本记录
分支：agent/codex/marble-cp
修改：
- 删除旧项目初始化和旧协作规范记录
- 仅保留弹珠项目锁定后的开发、文档、清理和验证记录
- 将当前项目上下文统一指向 `弹珠姻缘/docs/PROJECT_CONTEXT.md`
验证：
- 检查 changelog 不再包含旧项目初始化记录
- `git diff --check -- 弹珠姻缘/docs/changelog/codex.md` 通过
- `npm test` 通过，14/14
风险：
- 无

时间：2026-06-06 23:30

任务：新增跨平台快速启动脚本
分支：agent/codex/marble-cp
修改：
- 新增根目录 `start-mac.command`
- 新增根目录 `start-win.bat`
- 更新 README，补充 macOS 和 Windows 快速启动方式
验证：
- `bash -n start-mac.command` 通过
- 检查 `start-mac.command` 权限为可执行
- 检查 `start-win.bat` 使用 `%~dp0` 定位仓库根目录，并进入 `弹珠姻缘`
- `git diff --check` 通过
- `npm test` 通过，14/14
- `rm -rf .next && npm run build` 通过
风险：
- Windows 脚本需在 Windows 环境实际双击复验；当前先验证脚本语法和路径约定

时间：2026-06-06 23:45

任务：修复 StepFun 生成看似未接 API Key 的问题
分支：agent/codex/marble-cp
修改：
- 确认根目录 `.env` 可读取 `API_KEY`，不需要移动到 `弹珠姻缘/`
- 将 `.env` 加载路径改为基于 `lib/stepfunClient.js` 所在位置，避免受启动工作目录影响
- 移除 StepFun 请求里的 `response_format: { type: "json_object" }`，避免模型返回畸形空字段 JSON
验证：
- 从 `弹珠姻缘` 目录加载 `../.env`，确认 `API_KEY` 已设置
- 从仓库根目录直接调用 `generateStory`，返回 `title,relationshipTag,story,yuelaoComment`
- 本地 dev server 调用 `POST /api/generate-story` 返回 HTTP 200 和四字段结果
- `npm test` 通过，15/15
- `rm -rf .next && npm run build` 通过
风险：
- 仍依赖 StepFun 返回可解析 JSON；已有最多三次重试和结构化解析兜底

时间：2026-06-07 08:01

任务：优化弹珠发射手感、碰撞节奏和计数布局
分支：agent/codex/marble-cp
修改：
- 去掉点击发射兜底，改为拖动母球后松手立即发射，并用 pointer capture 避免拖出画布后丢失松手事件
- 提高母球初速、降低空气阻尼、加强墙体和目标球反弹
- 增加无新碰撞提前结算，倒计时只作为兜底
- 放大移动端弹珠盘空间，将碰撞计数改为默认一行摘要、展开为底部浮层明细
验证：
- `npm test` 通过，15/15
- `npm run build` 通过
- 浏览器 390x844 视口验证：拖拽松手直接发射，约 6 秒无新碰撞后进入 AI 生成页，计数摘要和展开抽屉可见
风险：
- 提前结算使用“2.6 秒无新母球碰撞”作为体验阈值，后续可根据现场手感继续微调

时间：2026-06-07 08:13

任务：移除倒计时并增强球体反弹反馈
分支：agent/codex/marble-cp
修改：
- 删除碰撞倒计时显示和倒计时结算机制，发射后改为显示“碰撞中”
- 结算条件改为所有球低于运动阈值并连续停稳 1 秒
- 提高发射初速并降低球体摩擦，让碰撞更激烈
- 所有球-球碰撞追加受控反弹冲量，并在碰撞点绘制短暂光圈反馈
验证：
- `npm test` 通过，15/15
- 停止 dev server 后执行 `npm run build` 通过
- 重启 dev server 后浏览器确认首页正常渲染，不再白屏
- 浏览器移动端流程验证：发射后显示“碰撞中”，停稳后进入 AI 生成页
风险：
- 反弹冲量做了最高速度限制，现场如果仍觉得不够强，可以继续调大 `extraSpeed` 上限
