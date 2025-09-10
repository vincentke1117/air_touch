import { beginDrag, dispatchAtCursor, dispatchWheel, endDrag, synthClick } from './synth-events';

export function updateCursor(lm: any[], state: any, config: any) {
  const tip = lm[8];
  const x = tip.x * window.innerWidth;
  const y = tip.y * window.innerHeight;
  state.cursor.x += (x - state.cursor.x) * (1 - config.cursorSmoothing);
  state.cursor.y += (y - state.cursor.y) * (1 - config.cursorSmoothing);
}

export function handlePinch(lm: any[], state: any, config: any, now: number) {
  const thumb = lm[4];
  const index = lm[8];
  const d = Math.hypot(thumb.x - index.x, thumb.y - index.y);
  const pinching = d < config.pinchThreshold;

  if (pinching && !state.pinch.active) {
    state.pinch = { active: true, startTs: now };
  }
  if (!pinching && state.pinch.active) {
    if (state.drag.active) {
      state.drag.active = false;
      endDrag(state);
    } else if (now - state.pinch.startTs >= config.clickHoldMs) {
      synthClick(state);
    }
    state.pinch.active = false;
    state.cursor.down = false;
  }

  if (state.pinch.active && !state.drag.active) {
    if (now - state.pinch.startTs >= config.dragHoldMs) {
      state.drag.active = true;
      state.drag.startTs = now;
      beginDrag(state);
    }
  }

  if (state.drag.active) {
    dispatchAtCursor(state, 'pointermove');
  }
}

export function handleScroll(lm: any[], state: any, config: any) {
  if (state.drag.active) return;
  const prev = state.prevLandmarks;
  if (!prev) return;
  const cy = lm[0].y;
  const py = prev[0].y;
  const dy = cy - py;
  if (Math.abs(dy) > config.scrollDeadzone) {
    const deltaY = -dy * config.scrollGain;
    dispatchWheel(deltaY);
  }
}

export function handleStop(
  lm: any[],
  state: any,
  config: any,
  now: number,
  stopFn: () => void
) {
  const wrist = lm[0];
  const tips = [lm[8], lm[12], lm[16], lm[20]];
  const avg =
    tips.reduce((s, t) => s + Math.hypot(t.x - wrist.x, t.y - wrist.y), 0) /
    tips.length;
  if (avg < config.pinchThreshold && !state.stop.active) {
    state.stop = { active: true, startTs: now };
  } else if (avg >= config.pinchThreshold) {
    state.stop.active = false;
  }
  if (state.stop.active && now - state.stop.startTs >= config.stopHoldMs) {
    stopFn();
    state.stop.active = false;
  }
}
