# GestureSurf

GestureSurf aims to translate hand gestures captured by the front-facing camera into traditional pointer interactions like clicking, dragging, and scrolling. The project starts with a Tampermonkey userscript and can later evolve into a full MV3 extension.

This repository currently contains initial scaffolding for a demo page and configuration used by the userscript.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-user>/air_touch.git
   cd air_touch
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```

> At this stage there are no runtime dependencies, but running the command prepares the workspaces for future development.

## Usage

### Demo playground

1. Start a static file server in the `packages/demo` directory. One quick option is:
   ```bash
   npx serve packages/demo
   ```
2. Open the served URL in a browser and click **“立即启用手势控制”** to activate the camera stream and see a basic click counter.

### Tampermonkey userscript

1. Build the single-file userscript:
   ```bash
   npm run build:userscript
   ```
   This outputs `packages/userscript/dist/gesturesurf.user.js`.
2. In Tampermonkey, open **Utilities → Install from file** and pick the generated `gesturesurf.user.js`.
3. Enable the script and refresh any page to experiment with pinch‑to‑click, drag, and scrolling gestures.

The project is still in an early prototype stage, so the build pipeline and full gesture set are subject to change.
