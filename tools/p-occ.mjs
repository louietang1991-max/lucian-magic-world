import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'assets/js/screen-explore.js');
let t = fs.readFileSync(f, 'utf8');

const START = t.indexOf('  function occluderSvg(theme) {');
const END = t.indexOf('  /* ---------------------------------------------------------------- 玩樂點 */');
if (START < 0 || END < 0) throw new Error('markers');

const NEW = `  function occluderSvg(theme) {
    // 注意：圖案要填滿整個 viewBox（0–100），咁「遮擋高度」先等於真實覆蓋高度
    if (theme === 'underwater') {
      return \`<svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M4 100 Q0 46 10 4 Q14 -2 18 6 Q14 52 14 100 Z" fill="#1b7a5a"/>
        <path d="M22 100 Q16 44 28 8 Q33 0 37 12 Q30 56 32 100 Z" fill="#2e9e74"/>
        <path d="M44 100 Q40 40 52 6 Q57 -2 61 10 Q54 54 56 100 Z" fill="#1b7a5a"/>
        <path d="M66 100 Q62 46 74 10 Q79 2 83 14 Q76 56 78 100 Z" fill="#3cb389"/>
        <path d="M86 100 Q84 52 92 16 Q96 6 100 16 Q94 60 96 100 Z" fill="#2e9e74"/>
        <ellipse cx="30" cy="72" rx="16" ry="10" fill="#43aa8b" opacity=".85"/>
        <ellipse cx="70" cy="58" rx="14" ry="9" fill="#43aa8b" opacity=".85"/>
      </svg>\`;
    }
    if (theme === 'forest') {
      return \`<svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="20" cy="52" rx="30" ry="46" fill="#2e7d32"/>
        <ellipse cx="52" cy="44" rx="34" ry="44" fill="#43a047"/>
        <ellipse cx="82" cy="54" rx="28" ry="44" fill="#2e7d32"/>
        <ellipse cx="34" cy="82" rx="34" ry="24" fill="#1b5e20"/>
        <ellipse cx="72" cy="86" rx="30" ry="22" fill="#388e3c"/>
        <ellipse cx="52" cy="20" rx="16" ry="14" fill="#66bb6a" opacity=".9"/>
        <ellipse cx="18" cy="24" rx="12" ry="12" fill="#66bb6a" opacity=".7"/>
      </svg>\`;
    }
    // grass
    return \`<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M2 100 Q0 44 8 2 Q11 -4 14 4 Q10 48 12 100 Z" fill="#3d7a1f"/>
      <path d="M16 100 Q14 38 24 0 Q28 -6 31 4 Q26 46 28 100 Z" fill="#6ab04c"/>
      <path d="M32 100 Q31 46 42 4 Q46 -4 49 6 Q42 50 44 100 Z" fill="#3d7a1f"/>
      <path d="M48 100 Q47 40 58 2 Q62 -6 65 4 Q58 48 60 100 Z" fill="#6ab04c"/>
      <path d="M64 100 Q63 46 74 6 Q78 -2 81 8 Q74 52 76 100 Z" fill="#3d7a1f"/>
      <path d="M80 100 Q80 44 90 10 Q94 2 97 12 Q90 56 92 100 Z" fill="#6ab04c"/>
      <path d="M0 100 Q20 84 50 88 Q80 92 100 100 Z" fill="#2f6b1a"/>
    </svg>\`;
  }

`;
t = t.slice(0, START) + NEW + t.slice(END);
fs.writeFileSync(f, t);
console.log('occluders redrawn');

// CSS：遮擋物大啲（蓋到影子大半）
const cf = path.join(ROOT, 'assets/css/games.css');
let css = fs.readFileSync(cf, 'utf8');
css = css.replace(
`.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -4%;
  width: 116%;
  height: 62%;`,
`.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -6%;
  width: 120%;
  height: 70%;`
);
fs.writeFileSync(cf, css);
console.log('css ok');
