export function resolveWinner(hitCounts, lastHitId, targetIds) {
  if (!targetIds.length) {
    throw new Error("targetIds must not be empty");
  }

  const entries = targetIds.map((id) => [id, Number(hitCounts[id] || 0)]);
  const max = Math.max(...entries.map(([, count]) => count));

  if (max <= 0) {
    return {
      winnerId: targetIds[0],
      hitCount: 0,
      tieBreak: false,
      noHit: true
    };
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
