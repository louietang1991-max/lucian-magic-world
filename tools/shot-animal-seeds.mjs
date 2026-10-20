import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8147;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 1.4 });
await page.goto(`http://127.0.0.1:${PORT}/${encodeURIComponent('動物圖-選擇.html')}`, { waitUntil: 'networkidle2' });
await sleep(1200);
// 只截頭幾隻動物
await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.row')];
  rows.forEach((r, i) => { if (i > 2) r.style.display = 'none'; });
});
await sleep(400);
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'animal-seeds.png'), fullPage: true });
console.log('ok');
await browser.close();
server.kill();
