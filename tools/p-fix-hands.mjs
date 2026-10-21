import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);

/* ============================================================
 * 1) 餵食：加一個大啲嘅透明撳區（蓋過雙手），雙手縮細啲唔好擋圈
 * ============================================================ */
let html = read('index.html');
if (!html.includes('id="beat-hit"')) {
  const anchor = '<button class="feed-circle" id="feed-circle" aria-label="圈圈">';
  if (!html.includes(anchor)) throw new Error('MISS circle anchor');
  html = html.replace(anchor, '<div class="beat-hit" id="beat-hit" hidden aria-hidden="true"></div>\n      ' + anchor);
  write('index.html', html);
  console.log('index: beat-hit ok');
}

let css = read('assets/css/feed.css');
if (!css.includes('.beat-hit')) {
  css += `
/* 跟拍撳區：比圈大一圈，蓋過雙手，小朋友撳邊都中 */
.beat-hit {
  position: absolute;
  z-index: 6;
  border-radius: 50%;
  background: transparent;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.beat-hit[hidden] { display: none !important; }
`;
  write('assets/css/feed.css', css);
  console.log('css: beat-hit ok');
}

/* 雙手縮細：42vw → 34vw，位置向外，唔好遮住圈中心 */
let css2 = read('assets/css/feed.css');
css2 = css2.replace(/.beat-hands .hand \{\n  position: absolute;\n  width: 42vw;\n  height: 42vw;\n  max-width: 210px;\n  max-height: 210px;/,
`.beat-hands .hand {
  position: absolute;
  width: 34vw;
  height: 34vw;
  max-width: 176px;
  max-height: 176px;`);
css2 = css2.replace('  font-size: 25vw;', '  font-size: 20vw;');
write('assets/css/feed.css', css2);
console.log('css: hands smaller');

/* JS：定位撳區 + 顯示時機 + 綁定 */
let js = read('assets/js/screen-feed.js');
js = js.replace(
`    // 跟拍雙手：大隻、由左右下方包住圈圈
    const hands = document.querySelectorAll('#beat-hands .hand');
    if (hands.length >= 2) {
      const hw = Math.min(window.innerWidth * 0.42, 210);
      const hy = g.cy - hw * 0.55;
      hands[0].style.left = Math.max(-hw * 0.12, g.cx - g.r - hw * 0.82) + 'px';
      hands[0].style.top = hy + 'px';
      hands[1].style.left = Math.min(window.innerWidth - hw * 0.88, g.cx + g.r - hw * 0.18) + 'px';
      hands[1].style.top = hy + 'px';
    }`,
`    // 跟拍撳區：比圈大一圈（小朋友撳手／邊緣都中）
    const hit = $('#beat-hit');
    if (hit) {
      const hs = Math.max(g.r * 2.9, 210);
      hit.style.width = hit.style.height = hs + 'px';
      hit.style.left = g.cx - hs / 2 + 'px';
      hit.style.top = g.cy - hs / 2 + 'px';
    }
    // 跟拍雙手：細啲、放喺圈外面
    const hands = document.querySelectorAll('#beat-hands .hand');
    if (hands.length >= 2) {
      const hw = Math.min(window.innerWidth * 0.34, 176);
      const hy = g.cy - hw * 0.42;
      hands[0].style.left = Math.max(-hw * 0.2, g.cx - g.r - hw * 0.95) + 'px';
      hands[0].style.top = hy + 'px';
      hands[1].style.left = Math.min(window.innerWidth - hw * 0.8, g.cx + g.r - hw * 0.05) + 'px';
      hands[1].style.top = hy + 'px';
    }`
);

js = js.replace(
`  function setStage(name) {
    const screen = document.getElementById('screen-feed');
    if (!screen) return;
    screen.classList.remove('stage-throw', 'stage-ready', 'stage-beat', 'stage-tap', 'stage-eat');
    screen.classList.add('stage-' + name);
  }`,
`  function setStage(name) {
    const screen = document.getElementById('screen-feed');
    if (!screen) return;
    screen.classList.remove('stage-throw', 'stage-ready', 'stage-beat', 'stage-tap', 'stage-eat');
    screen.classList.add('stage-' + name);
    // 撳區只喺「跟住拍子撳」同「準備」階段開，避免擋住掟生果
    const hit = $('#beat-hit');
    if (hit) hit.hidden = !(name === 'tap' || name === 'beat' || name === 'ready');
  }`
);

/* 綁定：#beat-hit 同 #feed-circle 一樣去 tapCircle */
const bindAnchor = `  /* ================================================================== 開始 */`;
if (!js.includes("$('#beat-hit')")) {
  js = js.replace(bindAnchor, `  /* ================================================================== 開始 */`);
}
write('assets/js/screen-feed.js', js);
console.log('js: geo/stage ok');
