import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);
const must = (t, a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); return t.split(a).join(b); };

/* ---------- 1. core.js：用固定 parent 關聯做「返回」 ---------- */
let core = read('assets/js/core.js');
core = must(core,
`  function back(fallback) {
    const prev = screenStack.pop();
    if (prev) go(prev, { replace: true });
    else go(fallback || 'home', { replace: true });
  }`,
`  /**
   * 每個畫面固定嘅「上一層」——咁樣返上一頁永遠可預測，
   * 唔會因為之前去過邊度而跳去奇怪嘅畫面。
   */
  const PARENT = {
    home: null,
    learn: 'home',
    quiz: 'learn',
    result: 'learn',
    explore: 'home',
    place: 'explore',
    feed: 'place',
    reveal: 'place',
    album: 'home',
    settings: 'home',
  };

  function back(fallback) {
    const p = PARENT[currentScreen];
    screenStack.length = 0;
    const target = p || fallback || 'home';
    if (target === currentScreen) return;
    go(target, { replace: true });
  }`,
'core back');

// go() 唔再需要 stack：避免歷史累積
core = must(core,
`    if (!opts.replace && prev && prev !== id) screenStack.push(prev);
    currentScreen = id;
    if (opts.resetStack) screenStack.length = 0;`,
`    currentScreen = id;
    screenStack.length = 0;`,
'core go stack');
write('assets/js/core.js', core);
console.log('core ok');

/* ---------- 2. quiz 離開掣用 back() ---------- */
let learn = read('assets/js/screen-learn.js');
learn = must(learn,
`    if (quit) quit.addEventListener('click', () => { A().stop(); C.go('learn'); });`,
`    if (quit) quit.addEventListener('click', () => { A().stop(); C.back('learn'); });`,
'learn quit');
// 結算畫面：加多個「返主頁」
write('assets/js/screen-learn.js', learn);
console.log('learn ok');

/* ---------- 3. index.html：結算畫面加 topbar + 返主頁掣 ---------- */
let html = read('index.html');
html = must(html,
`  <section class="screen" id="screen-result">
    <div class="result-wrap">`,
`  <section class="screen" id="screen-result">
    <header class="topbar result-top">
      <button class="icon-btn back" data-back="home" aria-label="返主頁">◀</button>
      <h2 class="topbar-title">完成啦！</h2>
      <div style="width:44px"></div>
    </header>
    <div class="result-wrap">`,
'result topbar');
html = must(html,
`      <button class="btn ghost big" data-go="learn">揀第二個遊戲</button>
    </div>
  </section>`,
`      <button class="btn ghost big" data-go="learn">揀第二個遊戲</button>
      <button class="btn ghost big" data-go="explore">去搵動物 🔭</button>
      <button class="btn text big" data-back="home">返主頁</button>
    </div>
  </section>`,
'result actions');
write('index.html', html);
console.log('html ok');

/* ---------- 4. CSS：結果頁排版 + text 掣 ---------- */
let css = read('assets/css/layout.css');
if (!css.includes('.result-top')) {
  css += `
/* 結算頁 topbar */
.result-top .topbar-title { color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.25); }
.result-top .icon-btn.back { background: rgba(255,255,255,.92); }
.btn.text {
  background: transparent;
  color: rgba(255,255,255,.85);
  box-shadow: none;
  min-height: 46px;
  font-size: 16px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.result-wrap .btn.big { min-height: 58px; }
#screen-result .result-wrap { gap: 10px; }
`;
  write('assets/css/layout.css', css);
  console.log('css ok');
}
console.log('all ok');
