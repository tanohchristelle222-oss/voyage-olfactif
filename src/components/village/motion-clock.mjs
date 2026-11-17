// Une horloge commune évite de figer toute la scène lorsque le système demande moins de mouvement.
export function createMotionClock({ fps = 24, reduced = false } = {}) {
  let previous = null, elapsed = 0, wasHidden = false;
  return {
    setReduced(value) { reduced = Boolean(value); },
    resetFrame() { previous = null; },
    tick(milliseconds, hidden = false) {
      if (hidden) { previous = milliseconds; wasHidden = true; return null; }
      if (wasHidden) { previous = milliseconds; wasHidden = false; return { time: elapsed, delta: 0 }; }
      if (previous !== null && milliseconds - previous < 1000 / fps - .01) return null;
      const delta = previous === null ? 0 : Math.min(1, Math.max(0, (milliseconds - previous) / 1000));
      previous = milliseconds;
      const scaled = delta * (reduced ? .5 : 1);
      elapsed += scaled;
      return { time: elapsed, delta: scaled };
    },
  };
}
