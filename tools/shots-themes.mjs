/* tools/shots-themes.mjs — 8 個地點場景截圖 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots', 'themes');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8129;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2' });
await sleep(2500);
await page.click('#btn-boot-start');
await sleep(900);
for (const loc of ['beach', 'sea', 'underwater', 'river', 'forest', 'grass', 'desert', 'snow']) {
  await page.evaluate((l) => { window.Core.go('explore'); window.Explore.enterPlace(l); }, loc);
  await sleep(1100);
  await page.screenshot({ path: path.join(OUT, 'place-' + loc + '.png') });
  console.log('shot', loc);
}
// 餵食畫面（海底 + 沙漠）
for (const loc of ['underwater', 'desert']) {
  await page.evaluate((l) => {
    window.Core.go('explore');
    window.Explore.enterPlace(l);
  }, loc);
  await sleep(900);
  await page.evaluate(() => {
    const s = window.Explore.state.session.spots[0];
    window.Feed.start({ animal: s.animal });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT, 'feed-' + loc + '.png') });
  console.log('feed', loc);
}
await browser.close();
server.kill();
console.log('done ->', OUT);
