/* tools/to-webp.mjs — 把 cutout-final (448 PNG) 轉做 360 WebP，減細檔案
 *  用法: node tools/to-webp.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-final');
const OUT = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-webp');
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
const files = fs.readdirSync(IN).filter((f) => f.endsWith('.png'));
let total = 0;
for (const f of files) {
  const b64 = fs.readFileSync(path.join(IN, f)).toString('base64');
  const url = await page.evaluate(async ({ b64, size }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    return cv.toDataURL('image/webp', 0.88);
  }, { b64, size: 360 });
  const buf = Buffer.from(url.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, f.replace(/\.png$/, '.webp')), buf);
  total += buf.length;
}
console.log(`[webp] ${files.length} files ${(total / 1048576).toFixed(2)}MB`);
await browser.close();
