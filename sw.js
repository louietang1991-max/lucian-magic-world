/* =============================================================================
 *  sw.js — Service Worker：第二次開始可以完全離線玩
 *  策略：
 *   - 導航請求：network-first，失敗時用快取 index.html
 *   - 靜態資源（css/js/圖示）：stale-while-revalidate
 *   - 語音 mp3：cache-first（immutable，唔會變）
 * ============================================================================= */
const VERSION = 'lucian-magic-v1.0.0';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/theme.css',
  './assets/css/layout.css',
  './assets/css/games.css',
  './assets/css/feed.css',
  './assets/js/debug-trap.js',
  './assets/js/data-animals.js',
  './assets/js/data-vocab.js',
  './assets/js/core.js',
  './assets/js/artwork.js',
  './assets/js/zhs-map.js',
  './assets/js/i18n.js',
  './assets/js/ai-index.js',
  './assets/js/audio-manifest.js',
  './assets/js/audio.js',
  './assets/js/rhythm.js',
  './assets/js/screen-home.js',
  './assets/js/screen-settings.js',
  './assets/js/screen-learn.js',
  './assets/js/screen-explore.js',
  './assets/js/screen-feed.js',
  './assets/js/screen-album.js',
  './assets/js/app.js',
  './assets/img/logo.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/icon-180.png',
  './assets/audio/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()).catch((err) => {
      console.warn('[sw] precache partial', err);
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isAudio(url) { return /\/assets\/audio\/.*\.mp3$/.test(url.pathname); }
function isStatic(url) { return /\.(css|js|mjs|png|svg|webmanifest|json)$/.test(url.pathname); }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 語音：cache-first
  if (isAudio(url)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => new Response('', { status: 404 })))
    );
    return;
  }

  // 導航：network-first
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 靜態：stale-while-revalidate
  if (isStatic(url)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const fetchPromise = fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => hit);
        return hit || fetchPromise;
      })
    );
  }
});
