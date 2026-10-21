import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8157;
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

// 用真 pointer 掟 3 次
const geo = await page.evaluate(() => JSON.parse(JSON.stringify(window.Feed.F.geo)));
for (let i = 0; i < 3; i++) { await page.mouse.click(geo.cx, geo.cy); await sleep(700); }
for (let k = 0; k < 80; k++) { if (await page.evaluate(() => window.Feed.F.stage === 'ready')) break; await sleep(120); }

// 睇下 ready 面板兩個掣有冇被撳區蓋住
const rr = await page.evaluate(() => {
  const l = document.getElementById('rhythm-listen').getBoundingClientRect().toJSON();
  const s = document.getElementById('rhythm-start').getBoundingClientRect().toJSON();
  const hitHidden = document.getElementById('beat-hit').hidden;
  const elAtL = document.elementFromPoint(l.x + l.width / 2, l.y + l.height / 2);
  const elAtS = document.elementFromPoint(s.x + s.width / 2, s.y + s.height / 2);
  return { l, s, hitHidden, atL: elAtL && elAtL.id, atS: elAtS && elAtS.id };
});
console.log('ready', JSON.stringify({ hitHidden: rr.hitHidden, atListen: rr.atL, atStart: rr.atS }));

// 真撳「聽節拍」
await page.mouse.click(rr.l.x + rr.l.width / 2, rr.l.y + rr.l.height / 2);
await sleep(600);
const afterListen = await page.evaluate(() => ({ stage: window.Feed.F.stage }));
console.log('撳聽節拍', JSON.stringify(afterListen));

// 等返 ready，真撳「開始」
for (let k = 0; k < 200; k++) { if (await page.evaluate(() => window.Feed.F.stage === 'ready')) break; await sleep(150); }
const before = await page.evaluate(() => {
  const s = document.getElementById('rhythm-start');
  const r = s.getBoundingClientRect();
  const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { stage: window.Feed.F.stage, disabled: s.disabled, panelHidden: document.getElementById('rhythm-ready').hidden, at: el && (el.id || el.className), rect: r.toJSON() };
});
console.log('beforeStart', JSON.stringify(before));
await page.mouse.click(before.rect.x + before.rect.width / 2, before.rect.y + before.rect.height / 2);
await sleep(600);
const afterStart = await page.evaluate(() => ({ stage: window.Feed.F.stage }));
console.log('撳開始', JSON.stringify(afterStart));

for (let k = 0; k < 100; k++) { if (await page.evaluate(() => window.Feed.F.stage === 'beats')) break; await sleep(120); }
const st = await page.evaluate(() => ({ stage: window.Feed.F.stage, hitHidden: document.getElementById('beat-hit').hidden }));
console.log('入拍', JSON.stringify(st));
console.log('errors', errs.slice(0, 3));
await browser.close();
server.kill();
