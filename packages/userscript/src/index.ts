import { defaultConfig, GestureSurfConfig } from './config';
import { initLandmarker, detect } from './landmarks';
import { updateCursor, handlePinch, handleScroll, handleStop } from './gestures';
import { drawCursor } from './ui';

interface RuntimeState {
  videoEl: HTMLVideoElement | null;
  cursor: { x: number; y: number; down: boolean };
  pinch: { active: boolean; startTs: number };
  drag: { active: boolean; startTs: number };
  scroll: { vy: number };
  stop: { active: boolean; startTs: number };
  prevLandmarks?: any;
}

let config: GestureSurfConfig = { ...defaultConfig };
const state: RuntimeState = {
  videoEl: null,
  cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false },
  pinch: { active: false, startTs: 0 },
  drag: { active: false, startTs: 0 },
  scroll: { vy: 0 },
  stop: { active: false, startTs: 0 },
};

let landmarker: any;

export async function init() {
  if (state.videoEl) return;
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;
  video.style.position = 'fixed';
  video.style.top = '-9999px';
  document.body.appendChild(video);
  state.videoEl = video;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      frameRate: { ideal: 30 },
    },
  });
  video.srcObject = stream;

  landmarker = await initLandmarker();
  loop();
}

async function loop() {
  if (!state.videoEl || !landmarker) return;
  const lms = detect(landmarker, state.videoEl);
  const now = performance.now();
  if (lms) {
    updateCursor(lms, state, config);
    drawCursor(state.cursor.x, state.cursor.y);
    handlePinch(lms, state, config, now);
    handleScroll(lms, state, config);
    handleStop(lms, state, config, now, stopCamera);
    state.prevLandmarks = lms;
  }
  requestAnimationFrame(loop);
}

export function stopCamera() {
  const tracks = (state.videoEl?.srcObject as MediaStream | null)?.getTracks?.() || [];
  tracks.forEach((t) => t.stop());
  state.videoEl?.remove();
  state.videoEl = null;
  landmarker = null;
  console.log('GestureSurf camera stopped');
}

export { config };
