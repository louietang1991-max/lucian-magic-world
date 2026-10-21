import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);

/* 1) stingray 同 mantaray 撞名 → 改 stingray */
let sea = read('assets/js/animals-sea.js');
sea = sea.replace(
  "zh: '魔鬼魚', py: 'mó guǐ yú', yue: '黃貂魚', en: 'Stingray'",
  "zh: '黃貂魚', py: 'huáng diāo yú', yue: '黃貂魚', en: 'Stingray'"
);
write('assets/js/animals-sea.js', sea);

/* 2) ermine emoji 撞土撥鼠 → 改 */
let snow = read('assets/js/animals-snow.js');
snow = snow.replace("emoji: '🐹', loc: 'snow', rarity: 3, size: 0.75,", "emoji: '🦡', loc: 'snow', rarity: 3, size: 0.75,");
write('assets/js/animals-snow.js', snow);

/* 3) 用 vm 載入所有動物檔，檢查數目 + 重複 */
import vm from 'node:vm';
const FILES = [
  'assets/js/data-animals.js',
  'assets/js/animals-beach.js',
  'assets/js/animals-sea.js',
  'assets/js/animals-underwater.js',
  'assets/js/animals-river.js',
  'assets/js/animals-forest.js',
  'assets/js/animals-grass.js',
  'assets/js/animals-desert.js',
  'assets/js/animals-snow.js',
];
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of FILES) vm.runInContext(read(f), ctx, { filename: f });
const A = ctx.window.ANIMAL_DATA;
const byLoc = {};
const ids = new Set();
const zhSet = new Set();
let dupId = 0, dupZh = 0;
for (const a of A) {
  byLoc[a.loc] = (byLoc[a.loc] || 0) + 1;
  if (ids.has(a.id)) { dupId++; console.log('dup id', a.id); }
  ids.add(a.id);
  if (zhSet.has(a.zh)) { dupZh++; console.log('dup zh', a.zh, a.id); }
  zhSet.add(a.zh);
  if (!a.facts || a.facts.length < 4) console.log('facts short', a.id, a.facts && a.facts.length);
  if (!a.py || !a.en || !a.yue || !a.emoji) console.log('missing field', a.id);
}
console.log('total', A.length, byLoc, 'dupId', dupId, 'dupZh', dupZh);
