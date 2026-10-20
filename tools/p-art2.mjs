import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'assets/js/artwork.js');
let t = fs.readFileSync(f, 'utf8');
const must = (a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); t = t.split(a).join(b); console.log('ok', label); };

/* 顏色球：唔要樹葉（唔係生果） */
must(
`    swatch: (it) => \`\${circle(100, 106, 62, it.c)}\${circle(78, 84, 18, '#ffffff', 'opacity=".35"')}\${circle(100, 106, 62, 'none', 'stroke="rgba(0,0,0,.12)" stroke-width="6"')}\${path('M100 44 q-6 -14 6 -18 q4 8 -2 18 Z', '#59c25a')}\`,`,
`    swatch: (it) => \`\${circle(100, 106, 64, it.c)}\${circle(100, 106, 64, 'none', 'stroke="rgba(0,0,0,.10)" stroke-width="7"')}\${ellipse(74, 78, 22, 14, '#ffffff', 'opacity=".28" transform="rotate(-28 74 78)"')}\`,`,
'swatch');

/* 芒果：芒果形 + 漸變 + 葉 */
must(
`    mango: () => \`\${path('M92 58 q20 -10 30 4 q-8 8 -20 6' , '#59c25a')}\${stroke('M106 60 q6 -12 16 -14', '#7a4a1f', 5)}\${path('M82 68 q30 -14 48 8 q18 22 8 52 q-10 30 -38 32 q-28 2 -38 -26 q-10 -30 4 -50 q6 -10 16 -16 Z', '#ffb703')}\${path('M104 68 q12 6 14 20', '#ffd166', 'stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"')}\`,`,
`    mango: () => \`\${path('M96 60 q18 -14 34 4 q-6 10 -18 10 q-10 0 -16 -14 Z', '#59c25a')}\${stroke('M104 62 q8 -14 18 -16', '#7a4a1f', 5)}\${path('M88 74 q22 -18 44 -2 q22 16 14 46 q-8 30 -36 34 q-28 4 -38 -22 q-10 -26 2 -42 q6 -8 14 -14 Z', '#ffb703')}\${path('M86 96 q14 -10 30 -2 q14 8 10 26', '#ffc300', 'stroke-width="12" fill="none" stroke-linecap="round" opacity=".65"')}\${path('M118 78 q10 4 12 16', '#ffe08a', 'stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"')}\${ellipse(150, 96, 7, 10, '#e07a00', 'opacity=".35"')}\`,`,
'mango');

/* 檸檬：有兩頭尖 + 皮紋 */
must(
`    lemon: () => \`\${path('M100 56 q34 0 38 30 q6 32 -14 50 q-16 16 -24 16 q-8 0 -24 -16 q-20 -18 -14 -50 q4 -30 38 -30 Z', '#ffe14d')}\${path('M100 56 q-8 -12 2 -18 q6 6 4 18 Z', '#c8e04a')}\${st() ? '' : path('M82 84 q-10 20 -2 40', '#fff6b0', 'stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"')}\`,`,
`    lemon: () => \`\${path('M100 52 q10 -8 16 2 q30 4 32 32 q2 26 -10 44 q-10 16 -22 20 q-4 4 -8 0 q-4 -6 -10 -8 q-14 -8 -22 -24 q-10 -20 -4 -42 q6 -22 28 -24 Z', '#ffe14d')}\${stroke('M100 52 q-10 0 -14 -12', '#d9c400', 5)}\${stroke('M138 148 q8 4 6 14', '#d9c400', 5)}\${st() ? '' : path('M84 86 q-8 22 0 40', '#fff6b0', 'stroke-width="9" fill="none" stroke-linecap="round" opacity=".95"')}\${[[92, 118], [110, 108], [104, 132], [120, 124]].map(([x, y]) => circle(x, y, 1.8, '#e8d24a', 'opacity=".7"')).join('')}\`,`,
'lemon');

/* 粟米：玉米形 + 粒粒 + 兩塊葉 */
must(
`    corn: () => \`\${ellipse(100, 124, 32, 52, '#ffd60a')}\${[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => circle(84 + c * 16, 88 + r * 26, 5, '#e8b800')).join('')).join('')}\${path('M100 152 q-34 8 -44 -10 q18 -12 44 -8 Z', '#2a9d8f')}\${path('M100 152 q34 8 44 -10 q-18 -12 -44 -8 Z', '#43aa8b')}\`,`,
`    corn: () => \`\${path('M100 46 q28 0 30 34 q2 40 -6 62 q-6 16 -24 16 q-18 0 -24 -16 q-8 -22 -6 -62 q2 -34 30 -34 Z', '#ffd60a')}\${[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3].map((c) => circle(86 + c * 10, 66 + r * 16, 4.2, '#f2b900', 'opacity=".85"')).join('')).join('')}\${path('M74 66 q-26 8 -30 34 q-2 18 10 26 q10 -30 26 -44 Z', '#2a9d8f')}\${path('M126 66 q26 8 30 34 q2 18 -10 26 q-10 -30 -26 -44 Z', '#43aa8b')}\${path('M76 128 q-18 4 -24 18 q18 6 30 -4 Z', '#43aa8b')}\${path('M124 128 q18 4 24 18 q-18 6 -30 -4 Z', '#2a9d8f')}\`,`,
'corn');

/* 消防車：整走奇怪紅弧，加返梯 */
must(
`    firetruck: () => \`\${rrect(18, 88, 118, 56, 12, '#e63946')}\${path('M136 104 q26 0 34 20 l0 20 l-34 0 Z', '#e63946')}\${rrect(148, 110, 16, 14, 4, '#bfe6ff')}\${rrect(18, 118, 118, 12, 4, '#ffd60a')}\${rrect(30, 96, 40, 16, 4, '#bfe6ff')}\${stroke('M96 40 l0 48', '#8a8f9c', 5)}\${rrect(78, 88, 36, 20, 6, '#cfd8e3')}\${circle(52, 152, 18, '#3a2f4a')}\${circle(52, 152, 8, '#cfd8e3')}\${circle(140, 152, 18, '#3a2f4a')}\${circle(140, 152, 8, '#cfd8e3')}\${path('M30 60 q10 -14 20 0 q10 -14 20 0', '#ff5a5a', 'stroke-width="0"')}\`,`,
`    firetruck: () => \`\${rrect(18, 88, 118, 56, 12, '#e63946')}\${path('M136 104 q26 0 34 20 l0 20 l-34 0 Z', '#e63946')}\${rrect(146, 108, 18, 16, 4, '#bfe6ff')}\${rrect(18, 118, 118, 12, 4, '#ffd60a')}\${rrect(30, 96, 40, 16, 4, '#bfe6ff')}\${stroke('M96 40 l0 48', '#8a8f9c', 5)}\${rrect(78, 88, 36, 20, 6, '#cfd8e3')}\${circle(52, 152, 18, '#3a2f4a')}\${circle(52, 152, 8, '#cfd8e3')}\${circle(140, 152, 18, '#3a2f4a')}\${circle(140, 152, 8, '#cfd8e3')}\${stroke('M62 44 l46 -14', '#c9ced8', 7)}\${stroke('M70 52 l46 -14', '#c9ced8', 5)}\${stroke('M62 44 l8 8 M84 38 l8 8 M106 32 l8 8', '#aeb5c0', 4)}\`,`,
'firetruck');

fs.writeFileSync(f, t);
console.log('artwork fixed');
