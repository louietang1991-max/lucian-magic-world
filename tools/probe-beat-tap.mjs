import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8156;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2' });
await sleep(2200);
await page.click('#btn-boot-start');
await sleep(600);
await page.evaluate(() => { window.Core.go('explore'); window.Explore.enterPlace('beach'); });
await sleep(900);
await page.evaluate(() => { const s = window.Explore.state.session.spots[0]; window.Feed.start({ animal: s.animal }); });
await sleep(900);

// 掟 3 個生果（用真 pointer 撳圈）
const geo = await page.evaluate(() => JSON.parse(JSON.stringify(window.Feed.F.geo)));
for (let i = 0; i < 3; i++) {
  await page.mouse.click(geo.cx, geo.cy);
  await sleep(700);
}
// 等 ready 面板
for (let k = 0; k < 60; k++) { if (await page.evaluate(() => window.Feed.F.stage === 'ready')) break; await sleep(120); }
const readyState = await page.evaluate(() => ({
  stage: window.Feed.F.stage,
  hitHidden: document.getElementById('beat-hit').hidden,
  hitRect: document.getElementById('beat-hit').getBoundingClientRect().toJSON(),
  panel: !document.getElementById('rhythm-ready').hidden,
}));
console.log('ready', JSON.stringify({ stage: readyState.stage, panel: readyState.panel, hitHidden: readyState.hitHidden }));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'feed-ready-new.png') });

// 撳「開始」
await page.evaluate(() => document.getElementById('rhythm-start').click());
for (let k = 0; k < 100; k++) { if (await page.evaluate(() => window.Feed.F.stage === 'beats')) break; await sleep(120); }
await sleep(400);
const beatInfo = await page.evaluate(() => ({
  stage: window.Feed.F.stage,
  hands: [...document.querySelectorAll('#beat-hands .hand')].map((h) => h.getBoundingClientRect().toJSON()),
  circle: document.getElementById('feed-circle').getBoundingClientRect().toJSON(),
  hit: document.getElementById('beat-hit').getBoundingClientRect().toJSON(),
  taps: window.Feed.F.taps,
}));
console.log('beats', JSON.stringify({ stage: beatInfo.stage, taps: beatInfo.taps }));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'feed-beat-new.png') });

// 撳「手」嘅位置（圈外面）— 應該要計拍子
const handX = beatInfo.hands[0].x + beatInfo.hands[0].width / 2;
const handY = beatInfo.hands[0].y + beatInfo.hands[0].height / 2;
const before = await page.evaluate(() => window.Feed.F.taps);
await page.mouse.click(handX, handY);
await sleep(300);
const afterHand = await page.evaluate(() => window.Feed.F.taps);
// 撳圈中心
await page.mouse.click(beatInfo.circle.x + beatInfo.circle.width / 2, beatInfo.circle.y + beatInfo.circle.height / 2);
await sleep(300);
const afterCenter = await page.evaluate(() => window.Feed.F.taps);
console.log(JSON.stringify({ tapsBefore: before, afterHandTap: afterHand, afterCenterTap: afterCenter, errors: errs.slice(0, 3) }));

await browser.close();
server.kill();
