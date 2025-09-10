export function dispatchAtCursor(state: any, type: string, init: PointerEventInit = {}) {
  const el = document.elementFromPoint(state.cursor.x, state.cursor.y) || document.body;
  const evt = new PointerEvent(type, {
    pointerId: 1,
    pointerType: 'mouse',
    bubbles: true,
    cancelable: true,
    clientX: state.cursor.x,
    clientY: state.cursor.y,
    buttons: state.cursor.down ? 1 : 0,
    ...init,
  });
  el.dispatchEvent(evt);
  return el;
}

export function synthClick(state: any) {
  dispatchAtCursor(state, 'pointerdown');
  const el = dispatchAtCursor(state, 'pointerup');
  (el as any)?.click?.();
}

export function beginDrag(state: any) {
  state.cursor.down = true;
  dispatchAtCursor(state, 'pointerdown');
}

export function endDrag(state: any) {
  state.cursor.down = false;
  dispatchAtCursor(state, 'pointerup');
}

export function dispatchWheel(deltaY: number) {
  window.dispatchEvent(
    new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
  );
}
