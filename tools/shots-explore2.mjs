/* tools/shots-explore2.mjs — 8 個地點新玩法截圖（隱藏 + 探頭） */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'screenshots', 'explore2');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8137;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2' });
await sleep(2200);
await page.click('#btn-boot-start');
await sleep(800);
for (const loc of ['beach', 'desert', 'snow', 'sea', 'river', 'underwater', 'forest', 'grass']) {
  await page.evaluate((l) => { window.Core.go('explore'); window.Explore.enterPlace(l); }, loc);
  await sleep(2800);
  await page.screenshot({ path: path.join(OUT, loc + '-a.png') });
  // 等有影子探頭
  for (let i = 0; i < 40; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('.spot-wrap.peeking').length);
    if (n > 0) break;
    await sleep(120);
  }
  await sleep(200);
  await page.screenshot({ path: path.join(OUT, loc + '-b.png') });
  console.log('shot', loc, await page.evaluate(() => ({ mode: window.Explore.mode, peeking: document.querySelectorAll('.spot-wrap.peeking').length })));
}
await browser.close();
server.kill();
console.log('done');
