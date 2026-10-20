/* tools/test-v2.mjs — 驗證：返回導航、三種探索玩法（dig/float/peek） */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'screenshots', 'v2');
fs.mkdirSync(SHOTS, { recursive: true });
const PORT = 8136;
const BASE = `http://127.0.0.1:${PORT}/`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errs = [];
let n = 0;
const shot = async (page, name) => { n++; await page.screenshot({ path: path.join(SHOTS, `${String(n).padStart(2, '0')}-${name}.png`) }); };
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); };

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

try {
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(2200);
  await page.click('#btn-boot-start');
  await sleep(800);

  console.log('\n== 1. 返回導航 ==');
  await page.evaluate(() => document.querySelector('[data-go="learn"]').click());
  await sleep(400);
  await page.evaluate(() => document.querySelector('[data-quiz="A"]').click());
  await sleep(900);
  assert(await page.evaluate(() => window.Core.screen === 'quiz'), '入到 quiz');
  await page.evaluate(() => document.querySelector('[data-quiz-quit]').click());
  await sleep(500);
  assert(await page.evaluate(() => window.Core.screen === 'learn'), 'quiz ✕ → learn');
  await page.evaluate(() => document.querySelector('#screen-learn [data-back="home"]').click());
  await sleep(500);
  assert(await page.evaluate(() => window.Core.screen === 'home'), 'learn ◀ → home（唔會跳返 quiz）');
  // 去探索 → 返
  await page.evaluate(() => document.querySelector('[data-go="explore"]').click());
  await sleep(400);
  await page.evaluate(() => document.querySelector('#screen-explore [data-back="home"]').click());
  await sleep(400);
  assert(await page.evaluate(() => window.Core.screen === 'home'), 'explore ◀ → home');

  console.log('\n== 2. dig 模式（沙灘）：逐隻揭開 ==');
  await page.evaluate(() => window.Core.go('explore'));
  await sleep(300);
  await page.evaluate(() => window.Explore.enterPlace('beach'));
  await sleep(1100);
  assert(await page.evaluate(() => window.Explore.mode === 'dig'), '沙灘 = dig 模式');
  const spotPos = await page.evaluate(() => {
    const s = window.Explore.state.session.spots[0];
    const el = document.querySelector('.spot-wrap');
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, total: window.Explore.state.session.spots.length };
  });
  // 只抹第一隻
  await page.mouse.move(spotPos.x - 40, spotPos.y);
  await page.mouse.down();
  for (let i = 0; i <= 14; i++) { await page.mouse.move(spotPos.x - 60 + i * 9, spotPos.y + Math.sin(i / 2) * 26); await sleep(16); }
  await page.mouse.up();
  await sleep(700);
  const revealed = await page.evaluate(() => ({
    revealed: document.querySelectorAll('.spot-wrap.revealed').length,
    total: document.querySelectorAll('.spot-wrap').length,
    canvas: !!document.querySelector('.wipe-layer'),
  }));
  console.log('  revealed:', JSON.stringify(revealed));
  assert(revealed.revealed >= 1, '第 1 隻影子已揭開');
  if (revealed.total > 1) assert(revealed.revealed < revealed.total || !revealed.canvas, '唔會一隻就開哂全部（沙仲喺度／只揭開一部份）');
  await shot(page, 'dig-revealed');
  // 撳佢 → 餵食
  await page.evaluate(() => document.querySelector('.spot-wrap.revealed .shadow-spot').click());
  await sleep(1300);
  assert(await page.evaluate(() => window.Core.screen === 'feed'), '撳影子 → 餵食畫面');
  // 返回
  await page.evaluate(() => document.getElementById('feed-quit').click());
  await sleep(800);
  assert(await page.evaluate(() => window.Core.screen === 'place'), 'feed ◀ → place');

  console.log('\n== 3. float 模式（海面）：浮上水面先撳到 ==');
  await page.evaluate(() => { window.Core.go('explore'); });
  await sleep(250);
  await page.evaluate(() => window.Explore.enterPlace('sea'));
  await sleep(1200);
  assert(await page.evaluate(() => window.Explore.mode === 'float'), '海面 = float 模式');
  assert(await page.evaluate(() => !!document.querySelector('.water-front')), '有水面效果');
  await shot(page, 'float');
  // 等佢浮上嚟
  let peeked = false;
  for (let i = 0; i < 80; i++) {
    peeked = await page.evaluate(() => !!document.querySelector('.spot-wrap.peeking'));
    if (peeked) break;
    await sleep(120);
  }
  assert(peeked, '影子會浮上水面（peeking）');
  await shot(page, 'float-peeking');
  // 撳浮起嘅影子
  const feedOk = await page.evaluate(() => {
    const wrap = document.querySelector('.spot-wrap.peeking');
    if (!wrap) return false;
    wrap.querySelector('.shadow-spot').click();
    return true;
  });
  assert(feedOk, '撳到浮起咗嘅影子');
  await sleep(1300);
  assert(await page.evaluate(() => window.Core.screen === 'feed'), 'float 撳中 → 餵食');
  await page.evaluate(() => document.getElementById('feed-quit').click());
  await sleep(700);

  console.log('\n== 4. peek 模式（森林）：探頭先撳到 ==');
  await page.evaluate(() => { window.Core.go('explore'); });
  await sleep(250);
  await page.evaluate(() => window.Explore.enterPlace('forest'));
  await sleep(1200);
  assert(await page.evaluate(() => window.Explore.mode === 'peek'), '森林 = peek 模式');
  assert(await page.evaluate(() => !!document.querySelector('.occluder')), '有遮擋物（樹叢）');
  await shot(page, 'peek');
  // 未探頭時撳 → 唔應該入餵食
  await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('.spot-wrap')].find((w) => !w.classList.contains('peeking'));
    if (wrap) wrap.querySelector('.shadow-spot').click();
  });
  await sleep(600);
  const stillPlace = await page.evaluate(() => window.Core.screen === 'place');
  assert(stillPlace, '未探頭時撳唔會成功（有提示）');
  // 等探頭
  let pk = false;
  for (let i = 0; i < 80; i++) {
    pk = await page.evaluate(() => !!document.querySelector('.spot-wrap.peeking'));
    if (pk) break;
    await sleep(120);
  }
  assert(pk, '影子會探頭出嚟');
  await shot(page, 'peek-peeking');
  await page.evaluate(() => {
    const wrap = document.querySelector('.spot-wrap.peeking');
    wrap.querySelector('.shadow-spot').click();
  });
  await sleep(1300);
  assert(await page.evaluate(() => window.Core.screen === 'feed'), 'peek 撳中 → 餵食');

  console.log('\n== 5. 結算頁返回掣 ==');
  await page.evaluate(() => { document.getElementById('feed-quit').click(); });
  await sleep(600);
  await page.evaluate(() => { window.Core.go('learn'); });
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-quiz="A"]').click());
  await sleep(1000);
  for (let i = 0; i < 5; i++) {
    let ok = false;
    for (let k = 0; k < 4 && !ok; k++) {
      await page.evaluate((idx) => { const els = document.querySelectorAll('#quiz-answers .answer'); if (els[idx]) els[idx].click(); }, k);
      await sleep(340);
      ok = await page.evaluate(() => !!document.querySelector('#quiz-answers .answer.correct'));
    }
    await sleep(1500);
  }
  await sleep(800);
  assert(await page.evaluate(() => window.Core.screen === 'result'), '到結算頁');
  await shot(page, 'result');
  const hasExploreBtn = await page.evaluate(() => !!document.querySelector('#screen-result [data-go="explore"]'));
  assert(hasExploreBtn, '結算頁有「去搵動物」掣');
  await page.evaluate(() => document.querySelector('#screen-result [data-back="home"]').click());
  await sleep(500);
  assert(await page.evaluate(() => window.Core.screen === 'home'), '結算頁 ◀ → home');

  console.log('\n✅ v2 測試全部通過');
} catch (e) {
  console.error('\n❌ 失敗：', e.message);
  try { await shot(page, 'FAIL'); } catch (e2) {}
  process.exitCode = 1;
} finally {
  const u = [...new Set(errs)].filter((x) => !/favicon|manifest/i.test(x));
  if (u.length) { console.log('\n--- errors ---'); u.slice(0, 12).forEach((x) => console.log('  ' + x)); }
  await browser.close();
  server.kill();
}
