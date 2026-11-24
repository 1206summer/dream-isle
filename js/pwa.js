'use strict';
// 앱 설치(PWA) 지원: 오프라인 캐시 등록, "앱으로 설치" 버튼, 아이폰 안내
// 아티팩트 링크나 PC 프로그램(file://)에서는 아무 것도 하지 않아요.
(function () {
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const web = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (web && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  // 아이폰 홈 화면 앱: 화면 맨 위(상태 표시줄)가 게임 위로 겹쳐 뿌옇게 보이지 않도록 띠를 확보해요.
  // 보통은 CSS 의 env(safe-area-inset-top) 이 처리하지만, 다른 페이지 안에 들어가 실행될 때는 0 으로 나와서 직접 정해요.
  const iosDev = /iphone|ipod/i.test(navigator.userAgent);
  if (iosDev && standalone()) {
    const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;top:0;height:env(safe-area-inset-top);visibility:hidden';
    document.body.appendChild(probe); const inset = probe.getBoundingClientRect().height; probe.remove();
    if (inset < 1) {
      document.documentElement.style.setProperty('--safe-top', (Math.max(screen.width, screen.height) >= 812 ? 50 : 20) + 'px');
      window.dispatchEvent(new Event('resize'));
    }
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
