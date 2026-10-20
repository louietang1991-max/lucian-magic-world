/* tools/walkthrough.mjs — 行一次全流程，出「成品截圖」*/
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8128;
const BASE = `http://127.0.0.1:${PORT}/`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let i = 0;
const shot = async (page, name) => {
  i++;
  const f = path.join(OUT, `${String(i).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: f });
  console.log('  📸', path.basename(f));
};
const waitFor = async (page, fn, timeout = 12000, label = '') => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (await page.evaluate(fn)) return true; await sleep(80); }
  throw new Error('timeout: ' + label);
};
const answerLoop = async (page, count) => {
  for (let k = 0; k < count; k++) {
    let ok = false;
    for (let n = 0; n < 4 && !ok; n++) {
      await page.evaluate((idx) => { const els = document.querySelectorAll('#quiz-answers .answer'); if (els[idx]) els[idx].click(); }, n);
      await sleep(360);
      ok = await page.evaluate(() => !!document.querySelector('#quiz-answers .answer.correct'));
    }
    await sleep(1500);
  }
};

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const jsErr = [];
page.on('pageerror', (e) => jsErr.push(e.message));

try {
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await waitFor(page, () => !document.getElementById('btn-boot-start').hidden, 20000, 'boot');
  await shot(page, 'boot');
  await page.click('#btn-boot-start');
  await sleep(900);
  await shot(page, 'home');

  // 學習選單
  await page.evaluate(() => document.querySelector('[data-go="learn"]').click());
  await sleep(600);
  await shot(page, 'learn-menu');
  // 遊戲 A
  await page.evaluate(() => document.querySelector('[data-quiz="A"]').click());
  await sleep(1400);
  await shot(page, 'game-A-audio');
  await answerLoop(page, 3);
  await shot(page, 'game-A-answered');
  await answerLoop(page, 2);
  await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 10000, 'result');
  await sleep(900);
  await shot(page, 'learn-result');
  // 返回學習（用 back 掣測試全局導航）
  await page.evaluate(() => document.querySelector('#screen-result [data-go="learn"]').click());
  await sleep(500);
  if (!(await page.evaluate(() => window.Core.screen === 'learn'))) throw new Error('data-go 導航壞咗');
  // 遊戲 B
  await page.evaluate(() => document.querySelector('[data-quiz="B"]').click());
  await sleep(1300);
  await shot(page, 'game-B-word');
  await answerLoop(page, 5);
  await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 10000, 'resultB');
  await sleep(400);
  // 用 back 掣返學習
  await page.evaluate(() => { window.Core.go('learn'); });
  await sleep(300);
  // 遊戲 C
  await page.evaluate(() => document.querySelector('[data-quiz="C"]').click());
  await sleep(1300);
  await shot(page, 'game-C-picture');
  await answerLoop(page, 5);
  await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 10000, 'resultC');
  await page.evaluate(() => window.Core.go('home'));
  await sleep(400);

  // 探索
  await page.evaluate(() => document.querySelector('[data-go="explore"]').click());
  await sleep(600);
  await shot(page, 'map');
  await page.evaluate(() => document.querySelectorAll('.map-card')[0].click());
  await sleep(1300);
  await shot(page, 'place-hidden');
  // 撥開沙
  const pos = await page.evaluate(() => {
    const s = window.Explore.state.session.spots[0];
    const el = document.querySelector('.shadow-spot');
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(pos.x - 30, pos.y);
  await page.mouse.down();
  for (let k = 0; k <= 16; k++) {
    await page.mouse.move(pos.x - 70 + k * 9, pos.y + Math.sin(k / 2) * 34);
    await sleep(16);
  }
  await page.mouse.up();
  await sleep(900);
  await shot(page, 'place-revealed');
  // 撳影子 → 餵食
  await page.evaluate(() => document.querySelector('.shadow-spot').click());
  await sleep(1500);
  await shot(page, 'feed-throw');
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => document.getElementById('feed-circle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    await sleep(760);
  }
  await sleep(600);
  await shot(page, 'feed-countin');
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    if (await page.evaluate(() => window.Feed.F.stage === 'beats' || window.Feed.F.stage === 'eat' || window.Feed.F.stage === 'done')) break;
    await sleep(100);
  }
  await sleep(500);
  await shot(page, 'feed-tap');
  for (let k = 0; k < 4; k++) {
    for (let n = 0; n < 40; n++) {
      const t = await page.evaluate(() => window.Metro.toNext());
      if (t < 0.05) break;
      await sleep(25);
    }
    await page.evaluate(() => document.getElementById('feed-circle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    await sleep(200);
  }
  await sleep(900);
  await shot(page, 'feed-eat');
  await waitFor(page, () => document.getElementById('screen-reveal').classList.contains('active'), 12000, 'reveal');
  await sleep(1600);
  await shot(page, 'reveal');
  await page.click('#reveal-next');
  await sleep(800);
  await shot(page, 'place-visited');

  // 圖鑑
  await page.evaluate(() => { window.Core.go('home'); });
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-go="album"]').click());
  await sleep(800);
  await shot(page, 'album');
  await page.evaluate(() => document.querySelector('.album-card:not(.locked)').click());
  await sleep(700);
  await shot(page, 'album-detail');
  await page.evaluate(() => document.querySelector('.sheet-close').click());
  await sleep(400);

  // 設定
  await page.evaluate(() => window.Core.go('home'));
  await sleep(300);
  const gear = await page.$('#btn-settings');
  const gb = await gear.boundingBox();
  await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
  await page.mouse.down();
  await sleep(1200);
  await page.mouse.up();
  await sleep(500);
  await shot(page, 'settings-lock');
  const q = await page.evaluate(() => document.getElementById('lock-q').textContent);
  const m = q.match(/(\d+)\s*\+\s*(\d+)/);
  await page.evaluate((sum) => {
    const b = Array.from(document.querySelectorAll('#lock-options button')).find((x) => Number(x.textContent) === sum);
    if (b) b.click();
  }, Number(m[1]) + Number(m[2]));
  await sleep(600);
  await shot(page, 'settings');

  // 返回主頁（測試 back）
  await page.evaluate(() => document.querySelector('#screen-settings [data-back]').click());
  await sleep(500);
  if (!(await page.evaluate(() => window.Core.screen === 'home'))) throw new Error('back 掣壞咗');

  console.log('\n✅ walkthrough OK，截圖：', OUT);
  if (jsErr.length) console.log('JS errors:', jsErr.slice(0, 5));
} catch (e) {
  console.error('❌', e.message);
  await shot(page, 'FAIL');
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill();
}
