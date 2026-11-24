'use strict';
// 앱 설치(PWA) 지원: 오프라인 캐시 등록, "앱으로 설치" 버튼, 아이폰 안내
// 아티팩트 링크나 PC 프로그램(file://)에서는 아무 것도 하지 않아요.
(function () {
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const web = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (web && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  if (standalone()) return;
  const btn = document.getElementById('bInstall'), hint = document.getElementById('iosHint');
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (btn) btn.hidden = false; });
  window.addEventListener('appinstalled', () => { if (btn) btn.hidden = true; deferred = null; });
  if (btn) btn.addEventListener('click', async e => {
    e.stopPropagation();
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (err) { }
    deferred = null; btn.hidden = true;
  });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (web && ios && hint) hint.hidden = false;
})();
