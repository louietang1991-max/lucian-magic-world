/* tools/gen-flashcards.mjs — 生成字卡 PDF（A4，每張 3×3 = 9 格，剪開做卡）
 *  用法: node tools/gen-flashcards.mjs
 *  輸出: 字卡-學習字詞.pdf（168 個字詞）、字卡-動物.pdf（129 隻動物）
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8170;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 讀資料 */
const ANIMAL_FILES = [
  'assets/js/data-animals.js', 'assets/js/animals-beach.js', 'assets/js/animals-sea.js',
  'assets/js/animals-underwater.js', 'assets/js/animals-river.js', 'assets/js/animals-forest.js',
  'assets/js/animals-grass.js', 'assets/js/animals-desert.js', 'assets/js/animals-snow.js',
  'assets/js/data-vocab.js',
];
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ANIMAL_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const VOCAB = ctx.window.VOCAB;
const ANIMALS = ctx.window.ANIMAL_DATA;

/* 每張卡資料 */
const vocabCards = [];
for (const [tid, t] of Object.entries(VOCAB)) {
  t.items.forEach((it, i) => {
    const ext = ['color', 'shape', 'number', 'measure'].includes(tid) ? null : null;
    // 用同 ai-index 一樣嘅命名
    const cands = [
      `assets/img/items/${tid}/${i}.webp`,
      `assets/img/items/${tid}/${i}.jpg`,
    ];
    let img = null;
    for (const c of cands) if (fs.existsSync(path.join(ROOT, c))) { img = c; break; }
    vocabCards.push({
      zh: it.zh, py: it.py || '', en: it.en || '', topic: t.zh,
      img: img || `assets/img/items/${tid}/${i}.jpg`,
      emoji: '',
    });
  });
}
const animalCards = ANIMALS.map((a) => ({
  zh: a.zh, py: a.py || '', en: a.en || '', topic: (ctx.window.LOCATIONS.find((l) => l.id === a.loc) || {}).zh || '',
  img: `assets/img/animals/cutout-webp/${a.id}.webp`,
  emoji: a.emoji || '',
}));

function pageHtml(title, cards) {
  const cells = cards.map((c) => `
    <div class="card">
      <div class="pic">${c.img ? `<img src="${c.img}" onerror="this.style.display='none';this.parentElement.textContent='${c.emoji || ''}'" />` : ''}</div>
      <div class="zh">${esc(c.zh)}</div>
      <div class="py">${esc(c.py)}</div>
      <div class="en">${esc(c.en)}</div>
    </div>`).join('');
  return `<!doctype html><html lang="zh-Hant"><head><base href="http://127.0.0.1:8170/"><meta charset="utf-8"><title>${esc(title)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: "Noto Sans TC","PingFang HK","Microsoft JhengHei",sans-serif; color: #2b2140; }
    h1 { font-size: 16pt; margin: 0 0 4mm; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
    .card {
      border: 1.2pt dashed #b9a6e6; border-radius: 4mm; padding: 3mm;
      height: 84mm; display: flex; flex-direction: column; align-items: center; justify-content: center;
      page-break-inside: avoid; background: #fff;
    }
    .pic { height: 44mm; display: flex; align-items: center; justify-content: center; font-size: 28mm; }
    .pic img { max-height: 44mm; max-width: 100%; object-fit: contain; }
    .zh { font-size: 26pt; font-weight: 900; line-height: 1.1; margin-top: 1mm; }
    .py { font-size: 10pt; color: #7a6a9c; margin-top: 1mm; }
    .en { font-size: 11pt; color: #2a5fa8; font-weight: 700; margin-top: .5mm; }
    .topic { position: absolute; font-size: 7pt; color: #b9a6e6; }
  </style></head><body>
  <h1>${esc(title)}</h1>
  <div class="grid">${cells}</div>
  </body></html>`;
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* 用本地 server 開圖，puppeteer 印 PDF */
const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(600);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

async function makePdf(name, title, cards) {
  await page.setContent(pageHtml(title, cards), { waitUntil: 'load', timeout: 180000 });
  await sleep(2500);
  try {
    await page.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
  } catch (e) {}
  await sleep(800);
  const out = path.join(ROOT, name);
  await page.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
  console.log('pdf:', out, (fs.statSync(out).size / 1048576).toFixed(2), 'MB', cards.length, 'cards');
}

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
await makePdf('字卡-學習字詞.pdf', 'Lucian 魔法世界 · 學習字詞卡', vocabCards);
await makePdf('字卡-動物.pdf', 'Lucian 魔法世界 · 動物卡', animalCards);

await browser.close();
server.kill();
