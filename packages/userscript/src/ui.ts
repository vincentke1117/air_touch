let cursorEl: HTMLDivElement | null = null;

export function drawCursor(x: number, y: number) {
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.style.position = 'fixed';
    cursorEl.style.width = '12px';
    cursorEl.style.height = '12px';
    cursorEl.style.borderRadius = '50%';
    cursorEl.style.background = 'red';
    cursorEl.style.pointerEvents = 'none';
    cursorEl.style.zIndex = '2147483647';
    document.body.appendChild(cursorEl);
  }
  cursorEl.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
}
