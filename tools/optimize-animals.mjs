/* tools/optimize-animals.mjs — 把生成圖縮細做網頁用
 *  hero: 832x1024 PNG -> 416x512 JPG (quality 84)
 *  cutout: 896x896 PNG -> 448x448 PNG (保留透明)
 *  用法: node tools/optimize-animals.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const HERO_IN = path.join(ROOT, 'assets', 'img', 'animals', 'hero');
const HERO_OUT = path.join(ROOT, 'assets', 'img', 'animals', 'hero-web');
const CUT_IN = path.join(ROOT, 'assets', 'img', 'animals', 'cutout');
const CUT_OUT = path.join(ROOT, 'assets', 'img', 'animals', 'cutout-web');
fs.mkdirSync(HERO_OUT, { recursive: true });
fs.mkdirSync(CUT_OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

async function convert(srcFile, destFile, w, h, type, quality) {
  const b64 = fs.readFileSync(srcFile).toString('base64');
  const mime = 'image/png';
  const dataUrl = await page.evaluate(async ({ b64, mime, w, h, type, quality }) => {
    const img = new Image();
    img.src = `data:${mime};base64,${b64}`;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return cv.toDataURL(type, quality);
  }, { b64, mime, w, h, type, quality });
  fs.writeFileSync(destFile, Buffer.from(dataUrl.split(',')[1], 'base64'));
}

let heroN = 0, heroBytes = 0;
if (fs.existsSync(HERO_IN)) {
  for (const f of fs.readdirSync(HERO_IN).filter((x) => x.endsWith('.png'))) {
    const dest = path.join(HERO_OUT, f.replace(/\.png$/, '.jpg'));
    if (!fs.existsSync(dest)) {
      await convert(path.join(HERO_IN, f), dest, 416, 512, 'image/jpeg', 0.85);
    }
    heroN++;
    heroBytes += fs.statSync(dest).size;
  }
}
let cutN = 0, cutBytes = 0;
if (fs.existsSync(CUT_IN)) {
  for (const f of fs.readdirSync(CUT_IN).filter((x) => x.endsWith('.png'))) {
    const dest = path.join(CUT_OUT, f);
    if (!fs.existsSync(dest)) {
      await convert(path.join(CUT_IN, f), dest, 448, 448, 'image/png');
    }
    cutN++;
    cutBytes += fs.statSync(dest).size;
  }
}
console.log(`hero ${heroN} files ${(heroBytes / 1048576).toFixed(2)}MB · cutout ${cutN} files ${(cutBytes / 1048576).toFixed(2)}MB`);
await browser.close();
