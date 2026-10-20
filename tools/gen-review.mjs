/* tools/gen-review.mjs — 由「題目庫對照表.html」生成 PDF（＋截圖檢查） */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8140;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 1.5 });
page.on('pageerror', (e) => console.log('[err]', e.message));
page.on('response', (r) => { if (r.status() >= 400) console.log('[404]', r.url()); });
await page.goto(`http://127.0.0.1:${PORT}/${encodeURIComponent('題目庫對照表.html')}`, { waitUntil: 'networkidle2' });
await page.waitForFunction(() => document.body.dataset.ready === '1', { timeout: 20000 });
await sleep(400);

const counts = await page.evaluate(() => ({
  topics: document.querySelectorAll('#topics h3').length,
  items: document.querySelectorAll('#topics .item').length,
  animals: document.querySelectorAll('.animal-card').length,
  phrases: document.querySelectorAll('#phrases tr').length,
  noAudio: document.querySelectorAll('#topics .tag.warn').length,
}));
console.log('counts', JSON.stringify(counts));

const html = path.join(ROOT, '題目庫對照表.html');
const pdfPath = path.join(ROOT, '題目庫對照表.pdf');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', bottom: '10mm', left: '9mm', right: '9mm' },
});
console.log('pdf:', pdfPath, (fs.statSync(pdfPath).size / 1024).toFixed(0), 'KB');

await page.screenshot({ path: path.join(ROOT, 'screenshots', 'review-top.png') });
await page.evaluate(() => document.querySelector('.animal-card').scrollIntoView());
await sleep(300);
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'review-animal.png') });

await browser.close();
server.kill();
