import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);
const must = (t, a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); return t.split(a).join(b); };

/* CSS：隱藏時半透明（似匿喺植物後面），遮擋物再高啲 */
let css = read('assets/css/games.css');
css = must(css,
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
  bottom: -6%;
  width: 120%;
  height: 70%;
  transform: translateX(-50%);
  pointer-events: none;
  filter: drop-shadow(0 -4px 8px rgba(0, 0, 0, 0.22));
}`,
`.spot-wrap.mode-peek .shadow-spot {
  transform: translateY(40%) scale(0.92) rotate(var(--rot, 0deg));
  opacity: 0.34;
}
.spot-wrap.mode-peek .shadow-spot::before { opacity: 0.16; }
.spot-wrap.mode-peek.peeking .shadow-spot {
  transform: translateY(-20%) scale(1.05) rotate(var(--rot, 0deg));
  opacity: 1;
}
.spot-wrap.mode-peek.peeking .shadow-spot::before { opacity: 0.95; }
.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -8%;
  width: 124%;
  height: 80%;
  transform: translateX(-50%) scaleY(var(--osy, 1));
  transform-origin: bottom center;
  pointer-events: none;
  filter: drop-shadow(0 -4px 8px rgba(0, 0, 0, 0.22));
}`,
'peek opacity');
write('assets/css/games.css', css);

/* JS：每叢遮擋物高度／闊度有少少隨機 */
let ex = read('assets/js/screen-explore.js');
ex = must(ex,
`      if (mode === 'peek') {
        const oc = document.createElement('span');
        oc.className = 'occluder';
        oc.innerHTML = occluderSvg(loc.theme);
        wrap.appendChild(oc);
      }`,
`      if (mode === 'peek') {
        const oc = document.createElement('span');
        oc.className = 'occluder';
        oc.style.setProperty('--osy', rnd(0.86, 1.18).toFixed(2));
        oc.innerHTML = occluderSvg(loc.theme);
        wrap.appendChild(oc);
      }`,
'oc random');
write('assets/js/screen-explore.js', ex);
console.log('ok');
