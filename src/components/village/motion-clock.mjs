// Une horloge commune évite de figer toute la scène lorsque le système demande moins de mouvement.
export function createMotionClock({ fps = 24, reduced = false } = {}) {
  let previous = null, elapsed = 0;
  return {
    setReduced(value) { reduced = Boolean(value); },
    tick(milliseconds, hidden = false) {
      if (hidden) { previous = milliseconds; return null; }
      if (previous !== null && milliseconds - previous < 1000 / fps - .01) return null;
      const delta = previous === null ? 0 : Math.min(.1, Math.max(0, (milliseconds - previous) / 1000));
      previous = milliseconds;
      const scaled = delta * (reduced ? .5 : 1);
      elapsed += scaled;
      return { time: elapsed, delta: scaled };
    },
  };
}
