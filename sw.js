// 오프라인 플레이용 캐시. 인터넷이 되면 항상 최신 파일을 받아 오고, 안 되면 저장해 둔 파일로 실행해요.
// 새 파일을 추가하면 아래 목록에도 한 줄 넣어 주세요 (빠뜨려도 한 번 온라인으로 열면 자동 저장돼요).
const CACHE = 'dream-isle-v1';
const ASSETS = [
  "./",
  "./css/style.css",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./js/art/icons.js",
  "./js/art/sprites.js",
  "./js/audio/audio.js",
  "./js/core/util.js",
  "./js/data/achievements.js",
  "./js/data/balance.js",
  "./js/data/companions.js",
  "./js/data/enemies.js",
  "./js/data/equipment.js",
  "./js/data/prestige.js",
  "./js/data/quests.js",
  "./js/data/regions.js",
  "./js/data/skills.js",
  "./js/data/upgrades.js",
  "./js/main.js",
  "./js/pwa.js",
  "./js/render/render.js",
  "./js/systems/boss.js",
  "./js/systems/combat.js",
  "./js/systems/fx.js",
  "./js/systems/items.js",
  "./js/systems/prestige.js",
  "./js/systems/quests.js",
  "./js/systems/skills.js",
  "./js/systems/state.js",
  "./js/systems/update.js",
  "./js/systems/waves.js",
  "./js/systems/world.js",
  "./js/ui/common.js",
  "./js/ui/hud.js",
  "./js/ui/modals.js",
  "./js/ui/panel.js",
  "./manifest.webmanifest"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // 최신 우선, 실패하면 캐시
    e.respondWith(Promise.race([fetch(req), timeout(4000)]).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // 글꼴: 캐시 우선
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })).catch(() => new Response('', { status: 504 })));
  }
});
