export async function initLandmarker() {
  const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest');
  const fileset = await vision.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  const landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/hand_landmarker.task',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });
  return landmarker;
}

export function detect(landmarker: any, video: HTMLVideoElement) {
  const result = landmarker.detectForVideo(video, performance.now());
  return result.landmarks?.[0];
}
