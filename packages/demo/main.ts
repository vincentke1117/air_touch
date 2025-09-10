import { init } from '../userscript/src/index';

const indicator = document.getElementById('clicked-indicator');

document.addEventListener('click', () => {
  if (!indicator) return;
  const count = parseInt(indicator.getAttribute('data-count') || '0', 10) + 1;
  indicator.setAttribute('data-count', String(count));
  indicator.textContent = `clicked: ${count}`;
});

document.getElementById('cta')?.addEventListener('click', () => {
  init();
});
