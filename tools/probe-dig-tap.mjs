import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8155;
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

/* ---------- 1. 沙漠：刮少少就要撳得到 ---------- */
await page.evaluate(() => { window.Core.go('explore'); window.Explore.enterPlace('desert'); });
await sleep(1200);
const spot = await page.evaluate(() => {
  const w = document.querySelector('.spot-wrap');
  const r = w.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
});
// 只刮一下（短距離）
await page.mouse.move(spot.x, spot.y);
await page.mouse.down();
for (let i = 1; i <= 4; i++) { await page.mouse.move(spot.x + i * 6, spot.y + i * 5); await sleep(25); }
await page.mouse.up();
await sleep(500);
const afterWipe = await page.evaluate(() => ({
  revealed: document.querySelectorAll('.spot-wrap.revealed').length,
  total: document.querySelectorAll('.spot-wrap').length,
}));
console.log('沙漠刮一下', JSON.stringify(afterWipe));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'desert-partial.png') });

// 撳已揭開嘅影子（沙未刮完）→ 應該入餵食畫面
const tapTarget = await page.evaluate(() => {
  const w = document.querySelector('.spot-wrap.revealed');
  if (!w) return null;
  const r = w.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
if (tapTarget) {
  await page.mouse.move(tapTarget.x, tapTarget.y);
  await page.mouse.down();
  await page.mouse.up();
  await sleep(1200);
  const st = await page.evaluate(() => ({ screen: window.Core.screen, feedStage: window.Feed && window.Feed.F ? window.Feed.F.stage : null }));
  console.log('撳影子之後', JSON.stringify(st));
} else {
  console.log('冇揭開到影子 ❌');
}

await browser.close();
server.kill();
