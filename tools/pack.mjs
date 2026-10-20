/* tools/pack.mjs — 打包一個可以直接上傳嘅 zip（只包靜態網站檔案）
 * 用法: node tools/pack.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lucian-magic-world.zip');
const zip = new JSZip();

const FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'netlify.toml', '.nojekyll', 'README.md'];
const DIRS = ['assets'];

for (const f of FILES) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) zip.file(f, fs.readFileSync(p));
}
function walk(dir, base) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? base + '/' + name : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, rel);
    else zip.file(rel, fs.readFileSync(full));
  }
}
for (const d of DIRS) walk(path.join(ROOT, d), d);

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
fs.writeFileSync(OUT, buf);
const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
console.log('wrote', OUT, (buf.length / 1048576).toFixed(2), 'MB,', names.length, 'files');
