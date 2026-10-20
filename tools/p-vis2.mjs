import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);
const must = (t, a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); return t.split(a).join(b); };

/* 1) 浮水位置落返水面，水線固定 44% */
let ex = read('assets/js/screen-explore.js');
ex = must(ex,
`      float: {
        3: [[25, 40], [75, 44], [50, 64]],
        4: [[24, 38], [76, 41], [27, 62], [73, 65]],
        5: [[20, 37], [50, 34], [80, 38], [31, 60], [69, 63]],
      },`,
`      float: {
        3: [[25, 50], [75, 53], [50, 68]],
        4: [[24, 48], [76, 51], [27, 67], [73, 69]],
        5: [[20, 47], [50, 45], [80, 48], [31, 66], [69, 68]],
      },`,
'float slots');
// 船搬去右上，唔好遮住影子
ex = must(ex,
  `        add(\`<div class="sea-boat">\${svgBoat()}</div>\`);`,
  `        add('<div class="sea-boat" style="left:auto;right:10%;bottom:62%;transform:scale(.8)">' + svgBoat() + '</div>');`,
  'boat pos');
write('assets/js/screen-explore.js', ex);

/* 2) CSS 微調：遮擋物細啲、隱藏位移大啲 */
let css = read('assets/css/games.css');
css = must(css,
`.spot-wrap.mode-peek .shadow-spot {
  transform: translateY(30%) scale(0.97) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek.peeking .shadow-spot {
  transform: translateY(-18%) scale(1.04) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -8%;
  width: 128%;
  height: 64%;
  transform: translateX(-50%);
  pointer-events: none;
  filter: drop-shadow(0 -3px 6px rgba(0, 0, 0, 0.18));
}`,
`.spot-wrap.mode-peek .shadow-spot {
  transform: translateY(54%) scale(0.94) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek .shadow-spot::before { opacity: 0.28; }
.spot-wrap.mode-peek.peeking .shadow-spot {
  transform: translateY(-24%) scale(1.05) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek.peeking .shadow-spot::before { opacity: 0.95; }
.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -4%;
  width: 116%;
  height: 62%;
  transform: translateX(-50%);
  pointer-events: none;
  filter: drop-shadow(0 -4px 8px rgba(0, 0, 0, 0.22));
}`,
'peek css');
// 浮水：隱藏時淡化虛線圈
css = must(css,
`.spot-wrap.mode-float .shadow-spot {
  transform: translateY(42%) scale(0.9) rotate(var(--rot, 0deg));
  opacity: 0.32;
  filter: blur(1.2px);
}`,
`.spot-wrap.mode-float .shadow-spot {
  transform: translateY(46%) scale(0.88) rotate(var(--rot, 0deg));
  opacity: 0.28;
  filter: blur(1.4px);
}
.spot-wrap.mode-float .shadow-spot::before { opacity: 0.2; }`,
'float css');
write('assets/css/games.css', css);
console.log('ok');
