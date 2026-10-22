/* tools/process-items.mjs — 題目圖後處理
 *  - 物件類：去背 + 裁邊 + 360 WebP
 *  - 場景類（形容詞／位置／動詞／人物／季節）：保留背景，440 JPEG
 *  - 有 arrow 值（人物題）：喺圖上加一支紅色箭嘴指住目標人物
 *  輸入: assets/img/items-raw/<topic>/<i>.png   輸出: assets/img/items/<topic>/<i>.webp|jpg
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'assets', 'img', 'items-raw');
const OUT = path.join(ROOT, 'assets', 'img', 'items');
fs.mkdirSync(OUT, { recursive: true });

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-vocab.js'), 'utf8'), ctx, { filename: 'data-vocab.js' });
const VOCAB = ctx.window.VOCAB;

const FULL_TOPICS = new Set(['adj', 'position', 'verb', 'people']);
const FULL_ARTS = new Set(['sky', 'field', 'spring', 'summer', 'autumn', 'winter']);

const jobs = [];
for (const [tid, topic] of Object.entries(VOCAB)) {
  topic.items.forEach((it, i) => {
    const src = path.join(IN, tid, i + '.png');
    if (!fs.existsSync(src)) return;
    const full = FULL_TOPICS.has(tid) || FULL_ARTS.has(it.art);
    jobs.push({ tid, i, src, full, arrow: it.arrow || 0 });
  });
}
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const onlyTops = new Set(only.filter((x) => !x.includes('/')));
const onlyPairs = new Set(only.filter((x) => x.includes('/')));
console.log(`[process] ${jobs.length} files (${jobs.filter((j) => j.full).length} 場景)${only.length ? ' → 只做 ' + only.join(',') : ''}`);

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

let n = 0;
for (const job of jobs) {
  if (only.length && !onlyTops.has(job.tid) && !onlyPairs.has(job.tid + '/' + job.i)) continue;
  const ext = job.full ? '.jpg' : '.webp';
  const dest = path.join(OUT, job.tid, job.i + ext);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const b64 = fs.readFileSync(job.src).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64, full, tol, arrow }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx2 = cv.getContext('2d', { willReadFrequently: true });
    ctx2.drawImage(img, 0, 0);

    if (full) {
      const out = 440;
      const c2 = document.createElement('canvas');
      c2.width = out; c2.height = out;
      const g2 = c2.getContext('2d');
      g2.imageSmoothingQuality = 'high';
      const side = Math.min(w, h);
      g2.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, out, out);
      /* 紅色箭嘴指住目標人物 */
      if (arrow) {
        const ax = out * arrow;
        const y0 = out * 0.02, y1 = out * 0.17, y2 = out * 0.27;
        g2.save();
        g2.lineCap = 'round';
        g2.lineJoin = 'round';
        g2.shadowColor = 'rgba(0,0,0,0.35)';
        g2.shadowBlur = 6;
        g2.strokeStyle = '#ff2d55';
        g2.fillStyle = '#ff2d55';
        g2.lineWidth = 9;
        g2.beginPath(); g2.moveTo(ax, y0); g2.lineTo(ax, y1); g2.stroke();
        g2.beginPath();
        g2.moveTo(ax, y2);
        g2.lineTo(ax - 20, y1 + 2);
        g2.lineTo(ax + 20, y1 + 2);
        g2.closePath();
        g2.fill();
        g2.restore();
      }
      return c2.toDataURL('image/jpeg', 0.86);
    }

    const im = ctx2.getImageData(0, 0, w, h);
    const d = im.data;
    const corners = [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]];
    let R = 0, G = 0, B = 0;
    for (const [x, y] of corners) { const i2 = (y * w + x) * 4; R += d[i2]; G += d[i2 + 1]; B += d[i2 + 2]; }
    R /= 4; G /= 4; B /= 4;
    const isBg = (x, y) => {
      const i2 = (y * w + x) * 4;
      const dr = d[i2] - R, dg = d[i2 + 1] - G, db = d[i2 + 2] - B;
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
    ctx2.putImageData(im, 0, 0);
    const d2 = ctx2.getImageData(0, 0, w, h).data;
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
  }, { b64, full: job.full, tol: 42, arrow: job.arrow });
  if (dataUrl) fs.writeFileSync(dest, Buffer.from(dataUrl.split(',')[1], 'base64'));
  n++;
}
console.log('[process] done', n);
await browser.close();
