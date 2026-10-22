/* tools/process-scenes.mjs — 背景圖縮細做網頁用（832x1024 PNG → 600x740 JPEG）
 *  用法: node tools/process-scenes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'scenes-raw');
const OUT = path.join(ROOT, 'assets', 'img', 'scenes');
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

let total = 0;
for (const f of fs.readdirSync(IN).filter((x) => x.endsWith('.png'))) {
  const b64 = fs.readFileSync(path.join(IN, f)).toString('base64');
  const url = await page.evaluate(async ({ b64 }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const w = 600, h = Math.round((img.naturalHeight / img.naturalWidth) * 600);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, w, h);
    return cv.toDataURL('image/jpeg', 0.82);
  }, { b64 });
  const buf = Buffer.from(url.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, f.replace(/\.png$/, '.jpg')), buf);
  total += buf.length;
}
console.log(`[scenes] ${fs.readdirSync(OUT).length} jpg, ${(total / 1048576).toFixed(2)} MB`);
await browser.close();
