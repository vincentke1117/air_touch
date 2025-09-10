export type GestureSurfConfig = {
  enabled: boolean;
  cursorSmoothing: number;
  pinchThreshold: number;
  clickHoldMs: number;
  dragHoldMs: number;
  scrollGain: number;
  scrollDeadzone: number;
  zoom: { enabled: boolean; min: number; max: number; step: number };
  hud: { enabled: boolean; showFps: boolean; showLandmarks: boolean };
  hands: { maxNumHands: number; handedness: "auto" | "left" | "right" };
  activationMode: "toggle" | "holdSpace";
  siteAllowlist: string[];
  stopHoldMs: number;
};

export const defaultConfig: GestureSurfConfig = {
  enabled: true,
  cursorSmoothing: 0.35,
  pinchThreshold: 0.07,
  clickHoldMs: 90,
  dragHoldMs: 160,
  scrollGain: 28,
  scrollDeadzone: 0.02,
  zoom: { enabled: false, min: 0.6, max: 2.0, step: 0.05 },
  hud: { enabled: true, showFps: true, showLandmarks: false },
  hands: { maxNumHands: 1, handedness: "auto" },
  activationMode: "toggle",
  siteAllowlist: [],
  stopHoldMs: 1000
};
