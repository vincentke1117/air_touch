// ==UserScript==
// @name         GestureSurf - Camera Gesture Control for Web
// @namespace    https://gesturesurf.app/assumption
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/config.ts
  var defaultConfig = {
    enabled: true,
    cursorSmoothing: 0.35,
    pinchThreshold: 0.07,
    clickHoldMs: 90,
    dragHoldMs: 160,
    scrollGain: 28,
    scrollDeadzone: 0.02,
    zoom: { enabled: false, min: 0.6, max: 2, step: 0.05 },
    hud: { enabled: true, showFps: true, showLandmarks: false },
    hands: { maxNumHands: 1, handedness: "auto" },
    activationMode: "toggle",
    siteAllowlist: [],
    stopHoldMs: 1e3
  };

  // src/landmarks.ts
  async function initLandmarker() {
    const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const landmarker2 = await vision.HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/hand_landmarker.task"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
    return landmarker2;
  }
  function detect(landmarker2, video) {
    var _a;
    const result = landmarker2.detectForVideo(video, performance.now());
    return (_a = result.landmarks) == null ? void 0 : _a[0];
  }

  // src/synth-events.ts
  function dispatchAtCursor(state2, type, init2 = {}) {
    const el = document.elementFromPoint(state2.cursor.x, state2.cursor.y) || document.body;
    const evt = new PointerEvent(type, __spreadValues({
      pointerId: 1,
      pointerType: "mouse",
      bubbles: true,
      cancelable: true,
      clientX: state2.cursor.x,
      clientY: state2.cursor.y,
      buttons: state2.cursor.down ? 1 : 0
    }, init2));
    el.dispatchEvent(evt);
    return el;
  }
  function synthClick(state2) {
    var _a;
    dispatchAtCursor(state2, "pointerdown");
    const el = dispatchAtCursor(state2, "pointerup");
    (_a = el == null ? void 0 : el.click) == null ? void 0 : _a.call(el);
  }
  function beginDrag(state2) {
    state2.cursor.down = true;
    dispatchAtCursor(state2, "pointerdown");
  }
  function endDrag(state2) {
    state2.cursor.down = false;
    dispatchAtCursor(state2, "pointerup");
  }
  function dispatchWheel(deltaY) {
    window.dispatchEvent(
      new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true })
    );
  }

  // src/gestures.ts
  function updateCursor(lm, state2, config2) {
    const tip = lm[8];
    const x = tip.x * window.innerWidth;
    const y = tip.y * window.innerHeight;
    state2.cursor.x += (x - state2.cursor.x) * (1 - config2.cursorSmoothing);
    state2.cursor.y += (y - state2.cursor.y) * (1 - config2.cursorSmoothing);
  }
  function handlePinch(lm, state2, config2, now) {
    const thumb = lm[4];
    const index = lm[8];
    const d = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    const pinching = d < config2.pinchThreshold;
    if (pinching && !state2.pinch.active) {
      state2.pinch = { active: true, startTs: now };
    }
    if (!pinching && state2.pinch.active) {
      if (state2.drag.active) {
        state2.drag.active = false;
        endDrag(state2);
      } else if (now - state2.pinch.startTs >= config2.clickHoldMs) {
        synthClick(state2);
      }
      state2.pinch.active = false;
      state2.cursor.down = false;
    }
    if (state2.pinch.active && !state2.drag.active) {
      if (now - state2.pinch.startTs >= config2.dragHoldMs) {
        state2.drag.active = true;
        state2.drag.startTs = now;
        beginDrag(state2);
      }
    }
    if (state2.drag.active) {
      dispatchAtCursor(state2, "pointermove");
    }
  }
  function handleScroll(lm, state2, config2) {
    if (state2.drag.active) return;
    const prev = state2.prevLandmarks;
    if (!prev) return;
    const cy = lm[0].y;
    const py = prev[0].y;
    const dy = cy - py;
    if (Math.abs(dy) > config2.scrollDeadzone) {
      const deltaY = -dy * config2.scrollGain;
      dispatchWheel(deltaY);
    }
  }
  function handleStop(lm, state2, config2, now, stopFn) {
    const wrist = lm[0];
    const tips = [lm[8], lm[12], lm[16], lm[20]];
    const avg = tips.reduce((s, t) => s + Math.hypot(t.x - wrist.x, t.y - wrist.y), 0) / tips.length;
    if (avg < config2.pinchThreshold && !state2.stop.active) {
      state2.stop = { active: true, startTs: now };
    } else if (avg >= config2.pinchThreshold) {
      state2.stop.active = false;
    }
    if (state2.stop.active && now - state2.stop.startTs >= config2.stopHoldMs) {
      stopFn();
      state2.stop.active = false;
    }
  }

  // src/ui.ts
  var cursorEl = null;
  function drawCursor(x, y) {
    if (!cursorEl) {
      cursorEl = document.createElement("div");
      cursorEl.style.position = "fixed";
      cursorEl.style.width = "12px";
      cursorEl.style.height = "12px";
      cursorEl.style.borderRadius = "50%";
      cursorEl.style.background = "red";
      cursorEl.style.pointerEvents = "none";
      cursorEl.style.zIndex = "2147483647";
      document.body.appendChild(cursorEl);
    }
    cursorEl.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
  }

  // src/index.ts
  var config = __spreadValues({}, defaultConfig);
  var state = {
    videoEl: null,
    cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false },
    pinch: { active: false, startTs: 0 },
    drag: { active: false, startTs: 0 },
    scroll: { vy: 0 },
    stop: { active: false, startTs: 0 }
  };
  var landmarker;
  async function init() {
    if (state.videoEl) return;
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.style.position = "fixed";
    video.style.top = "-9999px";
    document.body.appendChild(video);
    state.videoEl = video;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        frameRate: { ideal: 30 }
      }
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
  function stopCamera() {
    var _a, _b, _c, _d;
    const tracks = ((_c = (_b = (_a = state.videoEl) == null ? void 0 : _a.srcObject) == null ? void 0 : _b.getTracks) == null ? void 0 : _c.call(_b)) || [];
    tracks.forEach((t) => t.stop());
    (_d = state.videoEl) == null ? void 0 : _d.remove();
    state.videoEl = null;
    landmarker = null;
    console.log("GestureSurf camera stopped");
  }
})();
