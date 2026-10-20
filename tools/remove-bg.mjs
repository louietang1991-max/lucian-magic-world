/* tools/remove-bg.mjs — 用 canvas 把「乾淨淺藍背景」嘅動物圖去背（邊緣 flood fill）
 *  用法: node tools/remove-bg.mjs [--tol=42]
 *  輸入: assets/img/animals/cutout/*.png   輸出: assets/img/animals/cutout-web/*.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'animals', 'cutout');
const OUT = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-web');
const TOL = Number((process.argv.find((a) => a.startsWith('--tol=')) || '').split('=')[1] || 42);
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

const files = fs.readdirSync(IN).filter((f) => f.endsWith('.png'));
console.log(`[bg] ${files.length} files, tol=${TOL}`);
let n = 0;
for (const f of files) {
  const dest = path.join(OUT, f);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) { n++; continue; }
  const b64 = fs.readFileSync(path.join(IN, f)).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64, tol }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const im = ctx.getImageData(0, 0, w, h);
    const d = im.data;
    // 背景色 = 四角樣本平均
    const corners = [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]];
    let R = 0, G = 0, B = 0;
    for (const [x, y] of corners) { const i = (y * w + x) * 4; R += d[i]; G += d[i + 1]; B += d[i + 2]; }
    R /= 4; G /= 4; B /= 4;
    const isBg = (x, y) => {
      const i = (y * w + x) * 4;
      const dr = d[i] - R, dg = d[i + 1] - G, db = d[i + 2] - B;
      return Math.sqrt(dr * dr + dg * dg + db * db) <= tol;
    };
    const removed = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (removed[p]) return;
      if (!isBg(x, y)) return;
      removed[p] = 1;
      stack.push(p);
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const p = stack.pop();
      const px = p % w, py = (p - px) / w;
      push(px + 1, py); push(px - 1, py); push(px, py + 1); push(px, py - 1);
    }
    // 寫 alpha（邊緣羽化：鄰近被移除像素 → 半透明）
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        const i = p * 4;
        if (removed[p]) { d[i + 3] = 0; continue; }
        let near = false;
        if (x > 0 && removed[p - 1]) near = true;
        if (!near && x < w - 1 && removed[p + 1]) near = true;
        if (!near && y > 0 && removed[p - w]) near = true;
        if (!near && y < h - 1 && removed[p + w]) near = true;
        if (near) d[i + 3] = 190;
      }
    }
    ctx.putImageData(im, 0, 0);
    let removedCount = 0;
    for (let i = 0; i < removed.length; i++) removedCount += removed[i];
    return { url: cv.toDataURL('image/png'), removedCount, w, h, bg: [R | 0, G | 0, B | 0] };
  }, { b64, tol: TOL });
  fs.writeFileSync(dest, Buffer.from(dataUrl.url.split(',')[1], 'base64'));
  n++;
  if (n % 5 === 0) console.log(`[bg] ${n}/${files.length} … ${f} removed=${dataUrl.removedCount} bg=${dataUrl.bg}`);
}
console.log('[bg] done', n);
await browser.close();
