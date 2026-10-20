import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);

/* pack.mjs：唔好包原始大圖（只留網頁用嗰個 folder） */
let p = read('tools/pack.mjs');
if (!p.includes('SKIP_DIRS')) {
  p = p.replace(
    `function walk(dir, base) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? base + '/' + name : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, rel);
    else zip.file(rel, fs.readFileSync(full));
  }
}`,
    `const SKIP_DIRS = new Set([
  'assets/img/animals/hero',
  'assets/img/animals/cutout',
  'assets/img/animals/cutout-final',
  'assets/img/animals/cutout-web',
  'assets/img/items-raw',
]);
function walk(dir, base) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? base + '/' + name : name;
    if (SKIP_DIRS.has(rel)) continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, rel);
    else zip.file(rel, fs.readFileSync(full));
  }
}`
  );
  write('tools/pack.mjs', p);
  console.log('pack.mjs updated');
}

/* .gitignore：唔好 commit 原始生成圖 */
let gi = read('.gitignore');
if (!gi.includes('hero/')) {
  gi += `
# 原始 AI 生成圖（體積大，唔入 git；網頁用嘅 hero-web / cutout-webp 就有入）
assets/img/animals/hero/
assets/img/animals/cutout/
assets/img/animals/cutout-final/
assets/img/animals/cutout-web/
assets/img/items-raw/
`;
  write('.gitignore', gi);
  console.log('.gitignore updated');
}
