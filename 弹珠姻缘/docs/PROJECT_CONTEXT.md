# Agent Notes

## Project Context

This workspace is for a hackathon entry now locked to:

```text
《红绳懒得系，弹珠自己撞》
```

The product is a mobile-first AI H5 game. The user chooses one classic-literature character as the cue ball, drags to aim and control power, fires once into a closed marble board, and lets physics decide the CP. The character hit the most times becomes the final pairing target. If there is a tie, the last tied character hit by the cue ball wins as “命运最后一撞”.

The latest product source of truth is:

```text
弹珠姻缘/docs/红绳懒得系，弹珠自己撞_PRD_产品最终版.md
```

The collaboration source of truth for future split work is:

```text
弹珠姻缘/docs/AI_COLLABORATION.md
弹珠姻缘/public/assets/README.md
```

Old “月老牵线局” PRDs and other废案 are no longer product direction. Do not restore deleted old PRD files unless the user explicitly asks.

## Current Delivery Target

Build the AI-connected version first.

Core flow:

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

## Technical Direction

- Frontend: mobile-first H5.
- Suggested app location: `弹珠姻缘/`.
- Suggested stack: Next.js + React.
- Marble board: Canvas with Matter.js or equivalent 2D physics.
- Visual assets: use placeholder text/blocks first; later replace with background images and character ball textures.
- AI model: StepFun `step-3.7-flash`.
- API key: stored in root `.env` as `API_KEY`; never expose it to frontend code.
- API access: call StepFun through a server/API proxy route.
- CP gallery persistence: start with browser local persistence unless a backend store is explicitly added later.

## Product Constraints

- Mobile portrait experience first.
- One round should finish in 60-90 seconds.
- One selected cue-ball character per round.
- Total initial character pool is 10: selected cue ball + 9 collision targets.
- One shot only. No multi-shot, no items.
- Collision board must be closed; balls cannot leave the board.
- Collision phase and story phase are separate: do not generate story on every collision.
- Final story should treat collisions as “encounters”, not literal marble impacts.

## Collaboration Notes

- Before edits, run `git status --short` and `git branch --show-current`.
- Work with existing uncommitted changes; do not revert user deletions or unrelated files.
- Keep implementation scoped to the current plan.
- Update `弹珠姻缘/docs/changelog/codex.md` after meaningful doc or code changes.
- Put current project implementation plans under `弹珠姻缘/docs/plan/`, not `docs/superpowers/plans/`, unless the user changes this convention.
- Keep `/api/generate-story` compatible with the required response fields: `title`, `relationshipTag`, `story`, `yuelaoComment`.
- If adding the AI-generated newspaper feature, add optional response fields only; do not remove or rename existing fields.
- Put static images under `弹珠姻缘/public/assets/` and reference them as `/assets/...`.
