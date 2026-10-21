/* tools/check-headers.mjs — 驗證 _headers / _redirects 格式（避免部署時 100324 錯誤）
 *  用法: node tools/check-headers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let bad = 0;
const err = (m) => { console.error('❌ ' + m); bad++; };

/* ---------- _headers ---------- */
const hf = path.join(ROOT, '_headers');
if (!fs.existsSync(hf)) {
  console.log('（冇 _headers，跳過）');
} else {
  const lines = fs.readFileSync(hf, 'utf8').split(/\r?\n/);
  let rules = 0;
  let current = null;
  let headerCount = 0;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const n = i + 1;
    if (!line) return;
    if (line.startsWith('#')) return;
    if (line.startsWith('*') || line.endsWith('*/')) {
      return err(`第 ${n} 行：唔可以用 /* */ 註解，只可以用 # —— ${raw}`);
    }
    if (line.startsWith('/')) {
      rules++;
      current = line;
      headerCount = 0;
      return;
    }
    // 應該係 Header: value
    if (!/^[A-Za-z0-9-]+:\s*\S/.test(line)) {
      return err(`第 ${n} 行：Expected a colon-separated header pair —— ${raw}`);
    }
    if (!current) return err(`第 ${n} 行：header 前面冇路徑規則 —— ${raw}`);
    headerCount++;
    if (headerCount > 3) err(`第 ${n} 行：每個路徑最多 3 個 header（Workers 限制）`);
  });
  if (rules > 100) err(`規則太多（${rules}），Workers 上限 100`);
  if (!bad) console.log(`✅ _headers OK：${rules} 條路徑規則`);
}

/* ---------- _redirects ---------- */
const rf = path.join(ROOT, '_redirects');
if (fs.existsSync(rf)) {
  const lines = fs.readFileSync(rf, 'utf8').split(/\r?\n/);
  let n = 0;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    n++;
    const parts = line.split(/\s+/);
    if (parts.length < 2) err(`_redirects 第 ${i + 1} 行格式唔對：${raw}`);
  });
  console.log(`✅ _redirects OK：${n} 條規則`);
}

if (bad) { console.error(`\n共 ${bad} 個問題`); process.exit(1); }
console.log('全部格式正確');
