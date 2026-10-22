/* tools/stamp.mjs — 幫 index.html / 字卡.html 嘅 JS、CSS 加版本號（破瀏覽器 HTTP 快取）
 *  用法: node tools/stamp.mjs
 *  每次出街前行一次；會將 assets/js/xxx.js → assets/js/xxx.js?v=<時間戳>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VER = Date.now().toString(36).slice(-6);

const FILES = ['index.html', '字卡.html'];
let changed = 0;
for (const rel of FILES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, 'utf8');
  const before = t;
  // script src
  t = t.replace(/<script src="(assets\/js\/[^"?]+)(\?v=[^"]*)?"/g, `<script src="$1?v=${VER}"`);
  t = t.replace(/<link rel="stylesheet" href="(assets\/css\/[^"?]+)(\?v=[^"]*)?"/g, `<link rel="stylesheet" href="$1?v=${VER}"`);
  if (t !== before) { fs.writeFileSync(p, t); changed++; }
}
console.log('[stamp] version', VER, 'files', changed);

/* 同時更新 sw.js 版本（cache 名）→ 舊 cache 會自動清 */
const swPath = path.join(ROOT, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
const m = sw.match(/const VERSION = 'lucian-magic-v([^']+)'/);
if (m) {
  const base = m[1].split('-r')[0];
  const next = base + '-r' + VER;
  sw = sw.replace(m[0], `const VERSION = 'lucian-magic-v${next}'`);
  fs.writeFileSync(swPath, sw);
  console.log('[stamp] sw version →', next);
}
