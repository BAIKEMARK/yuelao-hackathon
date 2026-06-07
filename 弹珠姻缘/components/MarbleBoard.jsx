"use client";

import { useEffect, useRef, useState } from "react";
import { resolveWinner } from "../lib/pairing.js";

const BOARD_PADDING = 28;
const BALL_RADIUS = 24;
const ROUND_SECONDS = 16;
const MIN_DRAG_DISTANCE = 12;
const SETTLE_SPEED = 0.7;
const SETTLE_FRAMES = 30;
const MIN_SETTLE_MS = 1600;
const NO_RECENT_HIT_MS = 2600;

export default function MarbleBoard({ cue, targets, onComplete, onBack }) {
  const canvasRef = useRef(null);
  const matterRef = useRef(null);
  const dragPointRef = useRef(null);
  const launchedRef = useRef(false);
  const completedRef = useRef(false);
  const launchedAtRef = useRef(0);
  const lastCollisionAtRef = useRef(0);
  const settledFramesRef = useRef(0);
  const hitCountsRef = useRef({});
  const lastHitIdRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [hitCounts, setHitCounts] = useState({});
  const [lastHitName, setLastHitName] = useState("尚未相遇");
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animationId = 0;
    let Matter;
    let countdownId;

    async function setupBoard() {
      Matter = await import("matter-js");
      if (disposed || !canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(420, rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
      const cueBody = Matter.Bodies.circle(width / 2, height - 88, BALL_RADIUS, {
        restitution: 0.99,
        frictionAir: 0.006,
        label: "cue"
      });
      cueBody.characterId = cue.id;

      const targetBodies = createTargetBodies(Matter, targets, width, height);
      const walls = [
        Matter.Bodies.rectangle(width / 2, -10, width, 20, wallOptions()),
        Matter.Bodies.rectangle(width / 2, height + 10, width, 20, wallOptions()),
        Matter.Bodies.rectangle(-10, height / 2, 20, height, wallOptions()),
        Matter.Bodies.rectangle(width + 10, height / 2, 20, height, wallOptions())
      ];

      Matter.Composite.add(engine.world, [cueBody, ...targetBodies, ...walls]);
      Matter.Events.on(engine, "collisionStart", (event) => {
        if (!launchedRef.current || completedRef.current) {
          return;
        }

        for (const pair of event.pairs) {
          const targetBody = getCueTargetCollision(pair.bodyA, pair.bodyB);
          if (!targetBody) {
            continue;
          }
          const targetId = targetBody.characterId;
          hitCountsRef.current = {
            ...hitCountsRef.current,
            [targetId]: (hitCountsRef.current[targetId] || 0) + 1
          };
          lastHitIdRef.current = targetId;
          lastCollisionAtRef.current = window.performance.now();
          setHitCounts(hitCountsRef.current);
          setLastHitName(targets.find((target) => target.id === targetId)?.name || "命定对象");
        }
      });

      matterRef.current = { Matter, engine, cueBody, targetBodies, width, height, dpr };
      setReady(true);

      function tick() {
        if (!disposed) {
          Matter.Engine.update(engine, 1000 / 60);
          clampBodies(Matter, [cueBody, ...targetBodies], width, height);
          maybeFinishSettled([cueBody, ...targetBodies]);
          drawBoard(canvas, matterRef.current, cue, targets, dragPointRef.current, launchedRef.current);
          animationId = window.requestAnimationFrame(tick);
        }
      }

      tick();
    }

    setupBoard();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationId);
      window.clearInterval(countdownId);
      if (matterRef.current?.Matter && matterRef.current?.engine) {
        matterRef.current.Matter.Engine.clear(matterRef.current.engine);
      }
    };
  }, [cue, targets]);

  useEffect(() => {
    if (!launched) {
      return undefined;
    }

    const countdownId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdownId);
          finishRound();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdownId);
  }, [launched]);

  function handlePointerDown(event) {
    event.preventDefault();
    if (!ready || launchedRef.current || completedRef.current) {
      return;
    }

    const point = getCanvasPoint(event);
    const cueBody = matterRef.current.cueBody;
    const distance = Math.hypot(point.x - cueBody.position.x, point.y - cueBody.position.y);

    if (distance <= BALL_RADIUS * 1.8) {
      dragPointRef.current = point;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  }

  function handlePointerMove(event) {
    event.preventDefault();
    if (!dragPointRef.current || launchedRef.current) {
      return;
    }

    dragPointRef.current = getCanvasPoint(event);
  }

  function handlePointerUp(event) {
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!dragPointRef.current || launchedRef.current || completedRef.current) {
      return;
    }

    const cueBody = matterRef.current.cueBody;
    const point = getCanvasPoint(event);
    const vector = {
      x: cueBody.position.x - point.x,
      y: cueBody.position.y - point.y
    };

    if (Math.hypot(vector.x, vector.y) < MIN_DRAG_DISTANCE) {
      dragPointRef.current = null;
      return;
    }

    launchCue(vector);
    dragPointRef.current = null;
  }

  function handlePointerCancel(event) {
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragPointRef.current = null;
  }

  function launchCue(vector) {
    const distance = Math.min(Math.hypot(vector.x, vector.y), 280);
    const force = Math.max(distance / 12, 4.6);
    const length = Math.max(Math.hypot(vector.x, vector.y), 1);

    matterRef.current.Matter.Body.setVelocity(matterRef.current.cueBody, {
      x: (vector.x / length) * force,
      y: (vector.y / length) * force
    });
    launchedRef.current = true;
    launchedAtRef.current = window.performance.now();
    lastCollisionAtRef.current = launchedAtRef.current;
    settledFramesRef.current = 0;
    setLaunched(true);
  }

  function maybeFinishSettled(bodies) {
    if (!launchedRef.current || completedRef.current) {
      return;
    }

    if (window.performance.now() - launchedAtRef.current < MIN_SETTLE_MS) {
      return;
    }

    const now = window.performance.now();
    const noRecentHit = now - lastCollisionAtRef.current >= NO_RECENT_HIT_MS;
    if (noRecentHit) {
      finishRound();
      return;
    }

    const allSlow = bodies.every((body) => Math.hypot(body.velocity.x, body.velocity.y) < SETTLE_SPEED);
    settledFramesRef.current = allSlow ? settledFramesRef.current + 1 : 0;

    if (settledFramesRef.current >= SETTLE_FRAMES) {
      finishRound();
    }
  }

  function finishRound() {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;

    const targetIds = targets.map((target) => target.id);
    const result = resolveWinner(hitCountsRef.current, lastHitIdRef.current, targetIds);
    onComplete({
      ...result,
      hitCounts: hitCountsRef.current
    });
  }

  function getCanvasPoint(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  const leader = getLeader(targets, hitCounts);
  const totalHits = Object.values(hitCounts).reduce((total, count) => total + count, 0);
  const leaderLabel = leader ? `领先：${leader.name}` : lastHitName;

  return (
    <section className="screen-stack board-screen">
      <div className="board-topbar">
        <button className="text-button" type="button" onClick={onBack} disabled={launched}>
          返回
        </button>
        <div>
          <p className="eyebrow">母球：{cue.name}</p>
          <h2>{launched ? `${secondsLeft}s` : "拖动母球发射"}</h2>
        </div>
        <div className="leader-pill">{leaderLabel}</div>
      </div>
      <div className="marble-stage">
        <canvas
          ref={canvasRef}
          className="marble-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>
      <div className="board-help">
        {launched ? "碰撞基本停下就会锁定 CP，倒计时只是兜底。" : "按住底部母球向后拖，松手立即发射。"}
      </div>
      <div className={`hit-dock${statsOpen ? " is-open" : ""}`}>
        <button
          className="hit-dock-summary"
          type="button"
          onClick={() => setStatsOpen((current) => !current)}
          aria-expanded={statsOpen}
        >
          <span>碰撞 {totalHits}</span>
          <b>{leaderLabel}</b>
          <span>{statsOpen ? "收起" : "计数"}</span>
        </button>
        {statsOpen ? (
          <div className="hit-board">
            {targets.map((target) => (
              <div className="hit-row" key={target.id}>
                <span>{target.name}</span>
                <b>{hitCounts[target.id] || 0}</b>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function wallOptions() {
  return {
    isStatic: true,
    restitution: 1,
    friction: 0,
    frictionStatic: 0
  };
}

function createTargetBodies(Matter, targets, width, height) {
  const columns = 3;
  const startY = 92;
  const gapX = (width - BOARD_PADDING * 2) / columns;
  const gapY = 78;

  return targets.map((target, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = BOARD_PADDING + gapX * column + gapX / 2;
    const y = startY + row * gapY + (column % 2) * 14;
    const body = Matter.Bodies.circle(x, y, BALL_RADIUS, {
      restitution: 0.99,
      frictionAir: 0.008,
      label: "target"
    });
    body.characterId = target.id;
    return body;
  });
}

function getCueTargetCollision(bodyA, bodyB) {
  if (bodyA.label === "cue" && bodyB.label === "target") {
    return bodyB;
  }
  if (bodyB.label === "cue" && bodyA.label === "target") {
    return bodyA;
  }
  return null;
}

function clampBodies(Matter, bodies, width, height) {
  for (const body of bodies) {
    const x = Number.isFinite(body.position.x) ? body.position.x : width / 2;
    const y = Number.isFinite(body.position.y) ? body.position.y : height / 2;
    const nextX = Math.min(width - BALL_RADIUS, Math.max(BALL_RADIUS, x));
    const nextY = Math.min(height - BALL_RADIUS, Math.max(BALL_RADIUS, y));

    if (nextX !== x || nextY !== y) {
      Matter.Body.setPosition(body, { x: nextX, y: nextY });
    }
    if (!Number.isFinite(body.velocity.x) || !Number.isFinite(body.velocity.y)) {
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
    }
  }
}

function drawBoard(canvas, state, cue, targets, dragPoint, launched) {
  if (!state) {
    return;
  }

  const context = canvas.getContext("2d");
  const { cueBody, targetBodies, width, height, dpr } = state;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#5a241d";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#f7dca8";
  context.fillRect(12, 12, width - 24, height - 24);
  context.strokeStyle = "#7b3027";
  context.lineWidth = 3;
  context.strokeRect(12, 12, width - 24, height - 24);

  for (const body of targetBodies) {
    const target = targets.find((item) => item.id === body.characterId);
    drawBall(context, body.position.x, body.position.y, target, false);
  }

  drawBall(context, cueBody.position.x, cueBody.position.y, cue, true);

  if (dragPoint && !launched) {
    context.beginPath();
    context.moveTo(cueBody.position.x, cueBody.position.y);
    context.lineTo(cueBody.position.x * 2 - dragPoint.x, cueBody.position.y * 2 - dragPoint.y);
    context.strokeStyle = "#c82f2f";
    context.lineWidth = 4;
    context.setLineDash([9, 8]);
    context.stroke();
    context.setLineDash([]);
  }
}

function drawBall(context, x, y, character, isCue) {
  context.beginPath();
  context.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  context.fillStyle = character?.color || "#9b5b40";
  context.fill();
  context.lineWidth = isCue ? 4 : 2;
  context.strokeStyle = isCue ? "#fff4cf" : "rgba(71, 28, 21, 0.42)";
  context.stroke();
  context.fillStyle = "#fff8e7";
  context.font = "700 13px serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(character?.name?.slice(0, 2) || "缘", x, y);
}

function getLeader(targets, hitCounts) {
  let leader = null;
  let max = 0;
  for (const target of targets) {
    const count = hitCounts[target.id] || 0;
    if (count > max) {
      max = count;
      leader = target;
    }
  }
  return leader;
}
