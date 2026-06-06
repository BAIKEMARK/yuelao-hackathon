# Marble CP H5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mobile-first AI H5 MVP for 《红绳懒得系，弹珠自己撞》.

**Architecture:** `弹珠姻缘/` is an independent Next.js app. UI state lives in `app/page.jsx`; deterministic rules live in `lib/` and are covered by Node tests; Matter.js handles canvas physics; a server route proxies StepFun so `API_KEY` never reaches the client.

**Tech Stack:** Next.js, React, Matter.js, Node test runner, StepFun `step-3.7-flash`, browser localStorage.

---

## File Map

- Create `弹珠姻缘/package.json`: scripts and dependencies.
- Create `弹珠姻缘/next.config.mjs`: minimal Next config.
- Create `弹珠姻缘/app/layout.jsx`: app metadata and global shell.
- Create `弹珠姻缘/app/page.jsx`: flow state machine.
- Create `弹珠姻缘/app/globals.css`: mobile-first visual system.
- Create `弹珠姻缘/app/api/generate-story/route.js`: server-only story generation endpoint.
- Create `弹珠姻缘/components/StartScreen.jsx`: start and gallery entry.
- Create `弹珠姻缘/components/CharacterSelect.jsx`: cue-ball selection.
- Create `弹珠姻缘/components/MarbleBoard.jsx`: Matter.js board, drag, one-shot launch, collision counting.
- Create `弹珠姻缘/components/ResultCard.jsx`: AI archive result and save actions.
- Create `弹珠姻缘/components/Gallery.jsx`: local CP archive list and detail view.
- Create `弹珠姻缘/lib/characters.js`: 10-character pool and selection helpers.
- Create `弹珠姻缘/lib/pairing.js`: winner and no-hit resolution.
- Create `弹珠姻缘/lib/storyPrompt.js`: StepFun prompt and response normalization.
- Create `弹珠姻缘/lib/galleryStorage.js`: localStorage serialization helpers.
- Create `弹珠姻缘/lib/stepfunClient.js`: server-only StepFun client.
- Create `弹珠姻缘/test/pairing.test.mjs`: deterministic pairing tests.
- Create `弹珠姻缘/test/storyPrompt.test.mjs`: prompt structure tests.
- Create `弹珠姻缘/test/galleryStorage.test.mjs`: storage serialization tests.
- Modify `弹珠姻缘/docs/changelog/codex.md`: add implementation entries.

## Task 1: Project Skeleton

**Files:**
- Create: `弹珠姻缘/package.json`
- Create: `弹珠姻缘/next.config.mjs`
- Create: `弹珠姻缘/app/layout.jsx`
- Create: `弹珠姻缘/app/page.jsx`
- Create: `弹珠姻缘/app/globals.css`

- [ ] **Step 1: Create app manifest**

Use this package manifest:

```json
{
  "name": "marble-cp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "node --test test/*.test.mjs"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "matter-js": "^0.20.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create minimal Next files**

`next.config.mjs`:

```js
const nextConfig = {};

export default nextConfig;
```

`app/layout.jsx`:

```jsx
import "./globals.css";

export const metadata = {
  title: "红绳懒得系，弹珠自己撞",
  description: "选择名著角色当母球，撞出 AI 姻缘档案"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.jsx` initially renders a start shell:

```jsx
"use client";

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">月老今日罢工</p>
        <h1>红绳懒得系，弹珠自己撞</h1>
        <p>选择一个名著角色当母球，拖动发射，撞谁最多就生成本局 CP 档案。</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
cd 弹珠姻缘
npm install
```

Expected: `package-lock.json` is created and install exits 0.

- [ ] **Step 4: Verify skeleton builds**

Run:

```bash
cd 弹珠姻缘
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit skeleton**

```bash
git add 弹珠姻缘/package.json 弹珠姻缘/package-lock.json 弹珠姻缘/next.config.mjs 弹珠姻缘/app
git commit -m "feat: initialize marble cp app"
```

## Task 2: Deterministic Rules and Tests

**Files:**
- Create: `弹珠姻缘/lib/characters.js`
- Create: `弹珠姻缘/lib/pairing.js`
- Create: `弹珠姻缘/test/pairing.test.mjs`

- [ ] **Step 1: Write failing pairing tests**

`test/pairing.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { characters, splitCueAndTargets } from "../lib/characters.js";
import { resolveWinner } from "../lib/pairing.js";

test("splitCueAndTargets returns selected cue and the remaining nine targets", () => {
  const result = splitCueAndTargets("lin-daiyu");
  assert.equal(result.cue.name, "林黛玉");
  assert.equal(result.targets.length, 9);
  assert.equal(result.targets.some((character) => character.id === "lin-daiyu"), false);
});

test("character pool contains exactly ten unique characters", () => {
  assert.equal(characters.length, 10);
  assert.equal(new Set(characters.map((character) => character.id)).size, 10);
});

test("resolveWinner selects the unique highest hit count", () => {
  const result = resolveWinner({ "sun-wukong": 3, "jia-baoyu": 1 }, "jia-baoyu", ["sun-wukong", "jia-baoyu"]);
  assert.equal(result.winnerId, "sun-wukong");
  assert.equal(result.tieBreak, false);
  assert.equal(result.noHit, false);
});

test("resolveWinner uses lastHitId when tied for highest count", () => {
  const result = resolveWinner({ "sun-wukong": 2, "jia-baoyu": 2 }, "jia-baoyu", ["sun-wukong", "jia-baoyu"]);
  assert.equal(result.winnerId, "jia-baoyu");
  assert.equal(result.tieBreak, true);
});

test("resolveWinner returns first target as no-hit fallback", () => {
  const result = resolveWinner({}, null, ["sun-wukong", "jia-baoyu"]);
  assert.equal(result.winnerId, "sun-wukong");
  assert.equal(result.noHit, true);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
cd 弹珠姻缘
npm test
```

Expected: FAIL because `lib/characters.js` and `lib/pairing.js` do not exist.

- [ ] **Step 3: Implement character data and pairing**

Create `lib/characters.js` with the 10 PRD characters and:

```js
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
```

Create `lib/pairing.js`:

```js
export function resolveWinner(hitCounts, lastHitId, targetIds) {
  if (!targetIds.length) {
    throw new Error("targetIds must not be empty");
  }

  const entries = targetIds.map((id) => [id, Number(hitCounts[id] || 0)]);
  const max = Math.max(...entries.map(([, count]) => count));

  if (max <= 0) {
    return { winnerId: targetIds[0], hitCount: 0, tieBreak: false, noHit: true };
  }

  const tied = entries.filter(([, count]) => count === max).map(([id]) => id);
  const winnerId = tied.length === 1 ? tied[0] : tied.includes(lastHitId) ? lastHitId : tied[0];

  return {
    winnerId,
    hitCount: max,
    tieBreak: tied.length > 1,
    noHit: false
  };
}
```

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
cd 弹珠姻缘
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit rules**

```bash
git add 弹珠姻缘/lib/characters.js 弹珠姻缘/lib/pairing.js 弹珠姻缘/test/pairing.test.mjs
git commit -m "feat: add marble pairing rules"
```

## Task 3: Prompt and Gallery Storage

**Files:**
- Create: `弹珠姻缘/lib/storyPrompt.js`
- Create: `弹珠姻缘/lib/galleryStorage.js`
- Create: `弹珠姻缘/test/storyPrompt.test.mjs`
- Create: `弹珠姻缘/test/galleryStorage.test.mjs`

- [ ] **Step 1: Write failing prompt and storage tests**

Tests assert:

```js
const messages = buildStoryMessages({
  cue: { name: "林黛玉", source: "红楼梦", tag: "嘴上带刺，心里很明" },
  target: { name: "孙悟空", source: "西游记", tag: "不会弯弯绕，但敢闯敢认" },
  hitCount: 5,
  tieBreak: true,
  noHit: false
});
```

Expected: serialized messages include both names, `5`, and `命运最后一撞`.

Storage tests use a fake storage object with `getItem` and `setItem`; `saveGalleryRecord` should prepend the new record and preserve existing records.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
cd 弹珠姻缘
npm test
```

Expected: FAIL because prompt/storage modules do not exist.

- [ ] **Step 3: Implement prompt and storage helpers**

`buildStoryMessages(input)` returns system and user chat messages. `normalizeStoryPayload(text)` parses JSON when possible and otherwise throws. `readGallery(storage)` returns `[]` on missing or invalid JSON. `saveGalleryRecord(storage, record)` stores `[record, ...existing]`.

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
cd 弹珠姻缘
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit helpers**

```bash
git add 弹珠姻缘/lib/storyPrompt.js 弹珠姻缘/lib/galleryStorage.js 弹珠姻缘/test/storyPrompt.test.mjs 弹珠姻缘/test/galleryStorage.test.mjs
git commit -m "feat: add story prompt and gallery storage"
```

## Task 4: Flow Components

**Files:**
- Create: `弹珠姻缘/components/StartScreen.jsx`
- Create: `弹珠姻缘/components/CharacterSelect.jsx`
- Create: `弹珠姻缘/components/ResultCard.jsx`
- Create: `弹珠姻缘/components/Gallery.jsx`
- Modify: `弹珠姻缘/app/page.jsx`

- [ ] **Step 1: Implement screen state**

Use these states in `app/page.jsx`: `start`, `select`, `board`, `generating`, `result`, `gallery`.

- [ ] **Step 2: Wire start and selection**

`StartScreen` exposes `onStart` and `onOpenGallery`. `CharacterSelect` exposes `onSelect(cueId)` and calls `splitCueAndTargets(cueId)`.

- [ ] **Step 3: Wire result and gallery**

`ResultCard` saves records through `saveGalleryRecord(window.localStorage, record)`. `Gallery` reads through `readGallery(window.localStorage)`.

- [ ] **Step 4: Run build**

Run:

```bash
cd 弹珠姻缘
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit flow components**

```bash
git add 弹珠姻缘/app/page.jsx 弹珠姻缘/components
git commit -m "feat: add marble cp flow screens"
```

## Task 5: AI Proxy

**Files:**
- Create: `弹珠姻缘/lib/stepfunClient.js`
- Create: `弹珠姻缘/app/api/generate-story/route.js`
- Modify: `弹珠姻缘/app/page.jsx`

- [ ] **Step 1: Implement server client**

`generateStory(input)` reads root `.env` with `dotenv.config({ path: path.resolve(process.cwd(), "../.env") })`, requires `API_KEY`, posts to `https://api.stepfun.com/v1/chat/completions`, and returns normalized story JSON.

- [ ] **Step 2: Implement route**

`POST /api/generate-story` validates the request body fields needed by `buildStoryMessages`, calls `generateStory`, and returns `NextResponse.json(payload)`.

- [ ] **Step 3: Wire frontend generation**

After `MarbleBoard` resolves a winner, `page.jsx` posts cue, target, hitCount, tieBreak, and noHit. During request, show generating state. On error, show retry controls rather than a fixed story fallback.

- [ ] **Step 4: Verify route shape**

With dev server running, run:

```bash
curl -X POST http://localhost:3000/api/generate-story \
  -H 'Content-Type: application/json' \
  -d '{"cue":{"name":"林黛玉","source":"红楼梦","tag":"嘴上带刺，心里很明"},"target":{"name":"孙悟空","source":"西游记","tag":"不会弯弯绕，但敢闯敢认"},"hitCount":5,"tieBreak":false,"noHit":false}'
```

Expected with valid `API_KEY`: JSON includes `title`, `relationshipTag`, `story`, `yuelaoComment`. Expected without key: non-2xx error that does not expose the key.

- [ ] **Step 5: Commit AI proxy**

```bash
git add 弹珠姻缘/lib/stepfunClient.js 弹珠姻缘/app/api/generate-story/route.js 弹珠姻缘/app/page.jsx
git commit -m "feat: add StepFun story generation proxy"
```

## Task 6: Marble Board

**Files:**
- Create: `弹珠姻缘/components/MarbleBoard.jsx`
- Modify: `弹珠姻缘/app/page.jsx`
- Modify: `弹珠姻缘/app/globals.css`

- [ ] **Step 1: Create Matter.js board**

Initialize engine, runner, render loop, static walls, cue body, and 9 target bodies in a `useEffect`.

- [ ] **Step 2: Add pointer drag and one-shot launch**

Before launch, pointer down near the cue ball starts drag. Pointer move updates aim vector. Pointer up applies velocity once and disables future launch.

- [ ] **Step 3: Count direct cue-target collisions**

Listen for `collisionStart`; when one body is cue and the other has a target id, increment that target, set `lastHitId`, and show a short `+1` visual.

- [ ] **Step 4: End countdown and resolve winner**

After 18 seconds, stop counting, call `resolveWinner(hitCounts, lastHitId, targetIds)`, and call `onComplete(result)`.

- [ ] **Step 5: Keep balls in bounds**

Each animation frame clamps any body center to the board rectangle and resets invalid velocities.

- [ ] **Step 6: Build**

Run:

```bash
cd 弹珠姻缘
npm run build
```

Expected: build exits 0.

- [ ] **Step 7: Commit board**

```bash
git add 弹珠姻缘/components/MarbleBoard.jsx 弹珠姻缘/app/page.jsx 弹珠姻缘/app/globals.css
git commit -m "feat: add one-shot marble board"
```

## Task 7: Mobile Visual Pass and Changelog

**Files:**
- Modify: `弹珠姻缘/app/globals.css`
- Modify: `弹珠姻缘/docs/changelog/codex.md`

- [ ] **Step 1: Apply mobile-first styles**

Style the app for 390px-wide mobile portrait first: fixed-width shell max `430px`, clear action buttons, readable character grid, board aspect ratio, no text overflow.

- [ ] **Step 2: Add implementation changelog entry**

Append date, task, branch, changed files, verification, and risks to `弹珠姻缘/docs/changelog/codex.md`.

- [ ] **Step 3: Run final checks**

Run:

```bash
cd 弹珠姻缘
npm test
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 4: Browser verification**

Run `npm run dev`, open the local URL, verify desktop and mobile viewports can complete: start, select, launch, wait for result, handle AI response/error, save to gallery, refresh, reopen gallery.

- [ ] **Step 5: Commit visual pass**

```bash
git add 弹珠姻缘/app/globals.css 弹珠姻缘/docs/changelog/codex.md
git commit -m "feat: polish marble cp mobile experience"
```

## Self-Review

- Spec coverage: tasks cover app skeleton, 10 characters, one cue plus 9 targets, one-shot board, direct collision counts, tie break, AI route, result card, gallery persistence, and mobile visual validation.
- Marker scan: no open deferred-work markers or unspecified implementation slots remain.
- Type consistency: shared payload uses `cue`, `target`, `hitCount`, `tieBreak`, `noHit`, `title`, `relationshipTag`, `story`, and `yuelaoComment` throughout.
