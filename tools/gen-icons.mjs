/* tools/gen-icons.mjs — 由 logo.svg 產生 PWA PNG 圖示（用本機 Chrome + puppeteer-core）
 * 用法: node tools/gen-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'img');
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!exe) { console.error('no chrome found'); process.exit(1); }

const svgPath = path.join(IMG, 'logo.svg');
const svg = fs.readFileSync(svgPath, 'utf8');
const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();

for (const size of [192, 512, 180]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;overflow:hidden}
    img{display:block;width:${size}px;height:${size}px}
  </style></head><body><img id="i" src="${dataUrl}"></body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => new Promise((res) => {
    const img = document.getElementById('i');
    if (img.complete) res(); else img.onload = res;
  }));
  const out = path.join(IMG, `icon-${size}.png`);
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', out, fs.statSync(out).size, 'bytes');
}
await browser.close();
