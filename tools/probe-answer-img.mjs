import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8158;
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
// 只開動物圖鑑，玩 A（聽聲揀圖）
await page.evaluate(() => { window.Core.state.settings.topics = ['zoo']; window.Core.saveNow(); window.LearnGame.startGame('A'); });
await sleep(1800);
const info = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('#quiz-answers .ans-pic img')];
  return imgs.map((im) => ({
    src: im.getAttribute('src').split('/').pop(),
    fit: getComputedStyle(im).objectFit,
    w: Math.round(im.getBoundingClientRect().width),
    h: Math.round(im.getBoundingClientRect().height),
    nw: im.naturalWidth, nh: im.naturalHeight,
    cls: im.className,
  }));
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: path.join(ROOT, 'screenshots', 'quiz-A-animal.png') });
await browser.close();
server.kill();
