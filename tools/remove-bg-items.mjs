/* tools/remove-bg-items.mjs — 題目圖去背（items-raw/<topic>/<i>.png → items-clean/<topic>/<i>.webp）
 *  用法: node tools/remove-bg-items.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'items-raw');
const OUT = path.join(ROOT, 'assets', 'img', 'items');
const TOL = 42;
fs.mkdirSync(OUT, { recursive: true });

const jobs = [];
(function walk(dir, rel) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    if (fs.statSync(full).isDirectory()) walk(full, r);
    else if (name.endsWith('.png')) jobs.push({ full, rel: r });
  }
})(IN, '');
console.log(`[items-bg] ${jobs.length} files`);

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

let n = 0;
for (const job of jobs) {
  const destRel = job.rel.replace(/\.png$/, '.webp');
  const dest = path.join(OUT, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) { n++; continue; }
  const b64 = fs.readFileSync(job.full).toString('base64');
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
    // 邊緣半透明羽化
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (removed[p]) { d[p * 4 + 3] = 0; continue; }
        let near = false;
        if (x > 0 && removed[p - 1]) near = true;
        if (!near && x < w - 1 && removed[p + 1]) near = true;
        if (!near && y > 0 && removed[p - w]) near = true;
        if (!near && y < h - 1 && removed[p + w]) near = true;
        if (near) d[p * 4 + 3] = 190;
      }
    }
    ctx.putImageData(im, 0, 0);
    // 裁邊 + 統一大細 + webp
    const d2 = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d2[(y * w + x) * 4 + 3] > 24) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return null;
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const outSize = 360;
    const pad = Math.round(Math.max(bw, bh) * 0.08);
    const scale = Math.min((outSize - pad * 2) / bw, (outSize - pad * 2) / bh);
    const dw = Math.round(bw * scale), dh = Math.round(bh * scale);
    const c2 = document.createElement('canvas');
    c2.width = outSize; c2.height = outSize;
    const g2 = c2.getContext('2d');
    g2.imageSmoothingQuality = 'high';
    g2.drawImage(cv, minX, minY, bw, bh, Math.round((outSize - dw) / 2), Math.round((outSize - dh) / 2), dw, dh);
    return c2.toDataURL('image/webp', 0.9);
  }, { b64, tol: TOL });
  if (dataUrl) fs.writeFileSync(dest, Buffer.from(dataUrl.split(',')[1], 'base64'));
  n++;
  if (n % 6 === 0) console.log(`[items-bg] ${n}/${jobs.length} … ${job.rel}`);
}
console.log('[items-bg] done', n);
await browser.close();
