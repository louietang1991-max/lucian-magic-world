import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'assets/js/screen-explore.js');
let t = fs.readFileSync(f, 'utf8');

const START = t.indexOf('  function startPeekCycle(spot) {');
const END = t.indexOf('  /* ------------------------------------------------------------ 撳影子 */');
if (START < 0 || END < 0) throw new Error('markers');
const NEW = `  function startPeekCycle(spot) {
    const isFloat = Explore.mode === 'float';
    clearSpotTimer(spot);
    // 第一輪好快就出嚟，等小朋友快啲見到嘢
    spot._cycle = setTimeout(() => comeUp(spot, isFloat), rndInt(600, 1600));
  }

  function clearSpotTimer(spot) {
    if (spot && spot._cycle) { clearTimeout(spot._cycle); spot._cycle = null; }
  }

  function comeUp(spot, isFloat) {
    if (!spot || spot.visited || spot.found || !spot.el) return;
    if (spot.peeking) return;
    spot.peeking = true;
    spot.el.classList.add('peeking');
    if (spot.wrap) spot.wrap.classList.add('peeking');
    if (Math.random() < 0.45) A().tick();
    spot._cycle = setTimeout(() => goDown(spot, isFloat), rndInt(1700, 2500));
  }

  function goDown(spot, isFloat) {
    if (!spot || spot.visited || spot.found || !spot.el) return;
    spot.peeking = false;
    spot.el.classList.remove('peeking');
    if (spot.wrap) spot.wrap.classList.remove('peeking');
    spot._cycle = setTimeout(() => comeUp(spot, isFloat), rndInt(900, 1700));
  }

`;
t = t.slice(0, START) + NEW + t.slice(END);

// clearAllTimers 亦要清 _cycle
t = t.replace(
`    (Explore.session.spots || []).forEach((s) => {
      (s._timers || []).forEach(clearTimeout);
      s._timers = [];
    });`,
`    (Explore.session.spots || []).forEach((s) => {
      (s._timers || []).forEach(clearTimeout);
      s._timers = [];
      if (s._cycle) { clearTimeout(s._cycle); s._cycle = null; }
    });`
);
// found 時清 _cycle
t = t.replace(
`    (spot._timers || []).forEach(clearTimeout);
    spot._timers = [];`,
`    (spot._timers || []).forEach(clearTimeout);
    spot._timers = [];
    if (spot._cycle) { clearTimeout(spot._cycle); spot._cycle = null; }`
);
fs.writeFileSync(f, t);
console.log('peek cycle rewritten');
