/* tools/trim-cutouts.mjs — 自動裁走透明邊 + 統一 448x448
 *  用法: node tools/trim-cutouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-web');
const OUT = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-final');
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

const files = fs.readdirSync(IN).filter((f) => f.endsWith('.png'));
console.log('[trim]', files.length, 'files');
for (const f of files) {
  const b64 = fs.readFileSync(path.join(IN, f)).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64 }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 24) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return null;
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const pad = Math.round(Math.max(bw, bh) * 0.06);
    const out = 448;
    const scale = Math.min((out - pad * 2) / bw, (out - pad * 2) / bh);
    const dw = Math.round(bw * scale), dh = Math.round(bh * scale);
    const c2 = document.createElement('canvas');
    c2.width = out; c2.height = out;
    const g2 = c2.getContext('2d');
    g2.imageSmoothingQuality = 'high';
    g2.drawImage(img, minX, minY, bw, bh, Math.round((out - dw) / 2), Math.round((out - dh) / 2), dw, dh);
    return c2.toDataURL('image/png');
  }, { b64 });
  if (dataUrl) fs.writeFileSync(path.join(OUT, f), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
console.log('[trim] done');
await browser.close();
