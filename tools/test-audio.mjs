import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8130;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[err]', e.message));
page.on('requestfailed', (r) => console.log('[reqfail]', r.url()));
page.on('response', (r) => { if (r.status() >= 400) console.log('[http]', r.status(), r.url()); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2' });
await sleep(2000);
await page.click('#btn-boot-start');
await sleep(500);
const res = await page.evaluate(async () => {
  const out = {};
  out.ready = window.AudioKit.ready;
  out.count = Object.keys(window.AudioKit.manifest).length;
  out.has = window.AudioKit.has('v/fruit/0/yue');
  out.url = window.AudioKit.url('v/fruit/0/yue');
  // 量度播放時間（真實播放）
  const t0 = performance.now();
  await window.AudioKit.play('v/fruit/0/yue');
  out.playMs = Math.round(performance.now() - t0);
  await window.AudioKit.play('p/zh-HK/good');
  out.ok = true;
  // 檢查 mp3 真係 load 到
  const a = new Audio(window.AudioKit.url('a/turtle/yue'));
  out.loaded = await new Promise((resolve) => {
    a.addEventListener('loadedmetadata', () => resolve({ dur: a.duration, w: a.videoWidth }));
    a.addEventListener('error', () => resolve('ERROR ' + (a.error && a.error.code)));
    setTimeout(() => resolve('timeout'), 4000);
    a.load();
  });
  return out;
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
server.kill();
