import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8159;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2' });
await sleep(2000);
await page.click('#btn-boot-start');
await sleep(600);

// B：睇圖揀字（動物圖鑑）
await page.evaluate(() => { window.Core.state.settings.topics = ['zoo']; window.Core.saveNow(); window.LearnGame.startGame('B'); });
await sleep(1600);
const b = await page.evaluate(() => {
  const im = document.querySelector('.prompt-pic img');
  return im ? { fit: getComputedStyle(im).objectFit, w: Math.round(im.getBoundingClientRect().width), h: Math.round(im.getBoundingClientRect().height) } : null;
});
console.log('B prompt', JSON.stringify(b));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'quiz-B-fit.png') });

// C：睇字揀圖（水果）
await page.evaluate(() => { window.Core.state.settings.topics = ['fruit']; window.Core.saveNow(); window.LearnGame.startGame('C'); });
await sleep(1600);
const c = await page.evaluate(() => [...document.querySelectorAll('#quiz-answers .ans-pic img')].map((im) => ({ fit: getComputedStyle(im).objectFit, src: im.getAttribute('src').split('/').pop() })));
console.log('C answers', JSON.stringify(c));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'quiz-C-fit.png') });
await browser.close();
server.kill();
