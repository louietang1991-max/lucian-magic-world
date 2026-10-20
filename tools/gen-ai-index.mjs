/* tools/gen-ai-index.mjs — 掃描 AI 圖資料夾，產生 assets/js/ai-index.js
 *  用法: node tools/gen-ai-index.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HERO = path.join(ROOT, 'assets/img/animals/hero-web');
const CUT = path.join(ROOT, 'assets/img/animals/cutout-webp');
const ITEMS = path.join(ROOT, 'assets/img/items');

const list = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)) : []);
const heroes = {};
for (const f of list(HERO, '.jpg')) {
  const m = f.match(/^(.+)_s(\d)\.jpg$/);
  if (!m) continue;
  const id = m[1];
  heroes[id] = heroes[id] || [];
  heroes[id].push('assets/img/animals/hero-web/' + f);
}
const cutouts = list(CUT, '.webp').map((f) => f.replace(/\.webp$/, ''));
const itemImgs = {};
if (fs.existsSync(ITEMS)) {
  for (const topic of fs.readdirSync(ITEMS)) {
    const dir = path.join(ITEMS, topic);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(jpg|png|webp)$/.test(f)) continue;
      const idx = f.replace(/\.(jpg|png|webp)$/, '');
      itemImgs[topic + '/' + idx] = 'assets/img/items/' + topic + '/' + f;
    }
  }
}
const js = `/* 自動產生：AI 圖索引（動物 hero / cutout / 題目圖） */
window.AI_INDEX = ${JSON.stringify({ heroes, cutouts, items: itemImgs }, null, 1)};
`;
fs.writeFileSync(path.join(ROOT, 'assets/js/ai-index.js'), js);
console.log(`[ai-index] heroes=${Object.keys(heroes).length} cutouts=${cutouts.length} items=${Object.keys(itemImgs).length}`);
