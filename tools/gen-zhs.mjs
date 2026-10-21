/* tools/gen-zhs.mjs — 由所有中文字串產生「繁→簡」字對照表（assets/js/zhs-map.js）
 *  用法: node tools/gen-zhs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conv = OpenCC.Converter({ from: 't', to: 'cn' });

const FILES = [
  'index.html',
  'assets/js/data-animals.js',
  'assets/js/data-vocab.js',
  'assets/js/screen-learn.js',
  'assets/js/screen-explore.js',
  'assets/js/screen-feed.js',
  'assets/js/screen-album.js',
  'assets/js/screen-settings.js',
  'assets/js/screen-home.js',
  'assets/js/app.js',
  'assets/js/core.js',
  'assets/js/screen-boot.js',
];

const chars = new Set();
for (const rel of FILES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  for (const ch of t) {
    const code = ch.codePointAt(0);
    if (code >= 0x3400 && code <= 0x9fff) chars.add(ch);
  }
}
const map = {};
for (const ch of chars) {
  const s = conv(ch);
  if (s && s !== ch && s.length === 1) map[ch] = s;
}
const js = `/* 自動產生：繁體 → 簡體字對照（只收錄遊戲用到嘅字） */
window.ZHS_MAP = ${JSON.stringify(map)};
window.toSimp = function (str) {
  if (!str) return str;
  const m = window.ZHS_MAP;
  let out = '';
  for (const ch of String(str)) out += m[ch] || ch;
  return out;
};
`;
fs.writeFileSync(path.join(ROOT, 'assets/js/zhs-map.js'), js);
console.log(`[zhs] ${chars.size} unique han chars, ${Object.keys(map).length} need conversion`);
