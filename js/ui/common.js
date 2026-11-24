'use strict';
// UI 공통: 토스트, 아이콘 이미지
const panel = $('#panel');
let TAB = 'up';
function toast(text, cls) {
  const box = $('#toasts'); if (!box) return;
  while (box.children.length > 3) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.textContent = text; box.appendChild(d);
  setTimeout(() => d.remove(), 2700);
}
let popT = 0;
function popGold() { const c = $('#curGold'); if (!c) return; c.classList.add('pop'); clearTimeout(popT); popT = setTimeout(() => c.classList.remove('pop'), 90); }
const img = (k, cls) => `<img src="${ICON.url[k] || ''}" alt=""${cls ? ` class="${cls}"` : ''}>`;
const shardI = () => img('shard');
function setIcons() { document.querySelectorAll('img[data-icon]').forEach(i => { const u = ICON.url[i.dataset.icon]; if (u) i.src = u; }); }
