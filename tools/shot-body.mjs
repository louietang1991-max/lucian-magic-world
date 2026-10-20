/* tools/shot-body.mjs — 身體部位圖案截圖 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8142;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${PORT}/tools/sheet.html`, { waitUntil: 'networkidle2' });
await sleep(600);
// 只顯示 body 主題
await page.evaluate(() => {
  const grid = document.getElementById('grid3');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  window.VOCAB.body.items.forEach((it) => {
    const c = document.createElement('div');
    c.className = 'cell';
    c.innerHTML = window.Art.item(it) + '<div>' + it.zh + ' / ' + it.en + '</div>';
    grid.appendChild(c);
  });
  document.querySelectorAll('h3').forEach((h, i) => { h.style.display = i === 2 ? '' : 'none'; });
  document.getElementById('grid').style.display = 'none';
  document.getElementById('grid2').style.display = 'none';
  window.scrollTo(0, 0);
});
await sleep(300);
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'body-parts.png'), fullPage: true });
console.log('ok');
await browser.close();
server.kill();
