/* =============================================================================
 *  build.mjs — Cloudflare Pages 用嘅「打包」步驟
 *  網站本身係純靜態、冇 build，但 Cloudflare 會自動 npm install，
 *  如果 output directory 設做 repo 根目錄，就會連 node_modules（134MB workerd）一齊上載而失敗。
 *  所以呢個 script 只複製「網站需要嘅檔案」去 dist/，Cloudflare 只上載 dist/。
 *
 *  用法: node build.mjs
 * ============================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');

/* 根目錄要复制嘅檔案 */
const ROOT_FILES = [
  'index.html',
  '字卡.html',
  'sw.js',
  'manifest.webmanifest',
  '_headers',
  '.nojekyll',
  'favicon.ico',
  'robots.txt',
];

/* 要复制嘅資料夾 */
const DIRS = ['assets'];

/* 唔想入 dist 嘅（原始大圖） */
const SKIP_DIRS = new Set([
  'assets/img/animals/hero',
  'assets/img/animals/cutout',
  'assets/img/animals/cutout-final',
  'assets/img/animals/cutout-web',
  'assets/img/items-raw',
]);

/* 清空 dist */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let files = 0;
let bytes = 0;

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dest = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  files++;
  bytes += fs.statSync(dest).size;
}

function walk(rel) {
  const full = path.join(ROOT, rel);
  for (const name of fs.readdirSync(full)) {
    const childRel = rel + '/' + name;
    if (SKIP_DIRS.has(childRel)) continue;
    const st = fs.statSync(path.join(ROOT, childRel));
    if (st.isDirectory()) walk(childRel);
    else copyFile(childRel);
  }
}

for (const f of ROOT_FILES) {
  if (fs.existsSync(path.join(ROOT, f))) copyFile(f);
}
for (const d of DIRS) {
  if (fs.existsSync(path.join(ROOT, d))) walk(d);
}

console.log(`[build] dist/ ready: ${files} files, ${(bytes / 1048576).toFixed(2)} MB`);
