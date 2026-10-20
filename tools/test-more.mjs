/* tools/test-more.mjs — 第二輪測試：遊戲 B/C、中英文字、細螢幕、圖鑑詳情、設定 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'tools', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const PORT = 8127;
const BASE = `http://127.0.0.1:${PORT}/`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
let n = 0;
const shot = async (page, name) => {
  n++;
  await page.screenshot({ path: path.join(SHOTS, `m${String(n).padStart(2, '0')}-${name}.png`) });
};
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✓ ' + m); }
const waitFor = async (page, fn, timeout = 8000, label = '') => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (await page.evaluate(fn)) return true; await sleep(80); }
  throw new Error('timeout: ' + label);
};

async function answerLoop(page, count) {
  for (let i = 0; i < count; i++) {
    let ok = false;
    for (let k = 0; k < 4 && !ok; k++) {
      await page.evaluate((idx) => {
        const els = document.querySelectorAll('#quiz-answers .answer');
        if (els[idx]) els[idx].click();
      }, k);
      await sleep(380);
      ok = await page.evaluate(() => !!document.querySelector('#quiz-answers .answer.correct'));
    }
    if (!ok) throw new Error('answer loop failed at q' + (i + 1));
    await sleep(1500);
  }
}

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
await sleep(500);
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

try {
  // ---------- 細螢幕：360x640 ----------
  console.log('\n== A. 細螢幕 360x640 ==');
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await waitFor(page, () => !document.getElementById('btn-boot-start').hidden, 15000, 'boot');
  await page.click('#btn-boot-start');
  await sleep(800);
  await shot(page, 'sm-home');
  const overflow = await page.evaluate(() => {
    const el = document.getElementById('screen-home');
    return { sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight };
  });
  assert(overflow.sw <= overflow.cw + 2, '主頁無橫向溢出 ' + JSON.stringify(overflow));

  // 遊戲 B：睇圖揀字（中文）
  console.log('\n== B. 遊戲 B（中文）==');
  await page.evaluate(() => window.Core.go('learn'));
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-quiz="B"]').click());
  await sleep(1200);
  await shot(page, 'sm-quiz-B');
  const bInfo = await page.evaluate(() => ({
    han: document.querySelectorAll('#quiz-answers .ans-han').length,
    en: document.querySelectorAll('#quiz-answers .ans-en').length,
    pic: !!document.querySelector('.prompt-pic svg'),
  }));
  assert(bInfo.han === 4, '遊戲 B 有 4 個中文字選項');
  assert(bInfo.pic, '遊戲 B 題目有圖');
  await answerLoop(page, 5);
  await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 9000, 'result B');
  await shot(page, 'sm-result-B');

  // 遊戲 C：睇字揀圖（英文）
  console.log('\n== C. 遊戲 C（英文）==');
  await page.evaluate(() => {
    window.Core.state.settings.textLang = 'en';
    window.Core.saveNow();
    window.Core.go('learn');
  });
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-quiz="C"]').click());
  await sleep(1200);
  await shot(page, 'sm-quiz-C');
  const cInfo = await page.evaluate(() => ({
    pic: document.querySelectorAll('#quiz-answers .ans-pic').length,
    promptEn: (document.querySelector('#quiz-prompt-text') || {}).textContent || '',
  }));
  assert(cInfo.pic === 4, '遊戲 C 有 4 個圖案選項');
  assert(cInfo.promptEn.trim().length > 0, '遊戲 C 題目顯示英文字：' + cInfo.promptEn.trim());
  await answerLoop(page, 5);
  await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 9000, 'result C');

  // ---------- 大螢幕：390x844 ----------
  console.log('\n== D. 圖鑑詳情 ==');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle2' });
  await waitFor(page, () => !document.getElementById('btn-boot-start').hidden, 15000, 'boot2');
  await page.click('#btn-boot-start');
  await sleep(600);
  // 直接餵一隻動物，令圖鑑有資料
  await page.evaluate(() => { window.Core.go('explore'); });
  await sleep(250);
  await page.evaluate(() => { window.Explore.enterPlace('forest'); });
  await sleep(1200);
  await page.evaluate(() => { const s = window.Explore.state.session.spots[0]; window.Feed.start({ animal: s.animal }); });
  await sleep(900);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => document.getElementById('feed-circle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    await sleep(750);
  }
  const tb = Date.now();
  while (Date.now() - tb < 15000) {
    if (await page.evaluate(() => window.Feed.F.stage === 'beats')) break;
    await sleep(120);
  }
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 40; k++) {
      const t = await page.evaluate(() => window.Metro.toNext());
      if (t < 0.05) break;
      await sleep(25);
    }
    await page.evaluate(() => document.getElementById('feed-circle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    await sleep(180);
  }
  await waitFor(page, () => document.getElementById('screen-reveal').classList.contains('active'), 12000, 'reveal');
  await sleep(1200);
  await page.click('#reveal-next');
  await sleep(600);
  await page.evaluate(() => window.Core.go('album'));
  await sleep(700);
  await page.evaluate(() => document.querySelector('.album-card:not(.locked)').click());
  await sleep(700);
  await shot(page, 'album-detail');
  const sheet = await page.evaluate(() => ({
    name: (document.querySelector('.animal-sheet .as-name') || {}).textContent,
    facts: document.querySelectorAll('.animal-sheet .fact-row').length,
    sayBtns: document.querySelectorAll('.animal-sheet [data-say]').length,
  }));
  assert(!!sheet.name, '圖鑑詳情顯示動物名：' + sheet.name);
  assert(sheet.facts === 4, '詳情有 4 條冷知識');
  assert(sheet.sayBtns === 3, '詳情有 3 個語言發音按鈕');
  await page.evaluate(() => { const b = document.querySelector('#layer-popup [data-close]'); if (b) b.click(); else document.getElementById('layer-popup').click(); });
  await sleep(400);

  // ---------- 設定：題目庫 ----------
  console.log('\n== E. 設定題目庫 ==');
  await page.evaluate(() => {
    window.Core.go('home');
  });
  await sleep(250);
  const gear = await page.$('#btn-settings');
  const gb = await gear.boundingBox();
  await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
  await page.mouse.down();
  await sleep(1150);
  await page.mouse.up();
  await sleep(600);
  const ans = await page.evaluate(() => document.getElementById('lock-q').textContent);
  const m = ans.match(/(\d+)\s*\+\s*(\d+)/);
  await page.evaluate((sum) => {
    const b = Array.from(document.querySelectorAll('#lock-options button')).find((x) => Number(x.textContent) === sum);
    if (b) b.click();
  }, Number(m[1]) + Number(m[2]));
  await sleep(500);
  const chipInfo = await page.evaluate(() => ({
    chips: document.querySelectorAll('#set-topics .chip').length,
    on: document.querySelectorAll('#set-topics .chip.on').length,
  }));
  assert(chipInfo.chips >= 9, '題目庫有 ' + chipInfo.chips + ' 個主題');
  // 加開「數字」
  await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('#set-topics .chip')).find((c) => c.textContent.includes('數字'));
    if (chip) chip.click();
  });
  await sleep(300);
  const nowOn = await page.evaluate(() => window.Core.state.settings.topics.includes('number'));
  assert(nowOn, '可以加入「數字」題目庫');
  await shot(page, 'settings-more');
  // 揀返出嚟
  await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('#set-topics .chip')).find((c) => c.textContent.includes('數字'));
    if (chip) chip.click();
  });
  await sleep(200);

  // ---------- 英文發音 ----------
  console.log('\n== F. 英文發音 + 語速 ==');
  await page.evaluate(() => {
    document.querySelector('#set-speak button[data-v="en"]').click();
  });
  await sleep(300);
  const lang = await page.evaluate(() => window.Core.state.settings.speakLang);
  assert(lang === 'en', '發音語言轉咗英文');
  await page.evaluate(() => {
    window.Core.state.settings.textLang = 'zh';
    window.Core.saveNow();
    window.Core.go('learn');
  });
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-quiz="A"]').click());
  await sleep(1500);
  await shot(page, 'quiz-A-en');
  await answerLoop(page, 5);

  // ---------- 橫向提示 ----------
  console.log('\n== G. 橫向提示 ==');
  await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sleep(600);
  const rotateVisible = await page.evaluate(() => {
    const el = document.getElementById('rotate-hint');
    return getComputedStyle(el).display !== 'none';
  });
  assert(rotateVisible, '橫向時顯示「請將手機打直」提示');
  await shot(page, 'landscape-hint');

  console.log('\n✅ 第二輪測試全部通過');
} catch (e) {
  console.error('\n❌ 失敗：', e.message);
  try { await shot(page, 'FAIL'); } catch (e2) {}
  process.exitCode = 1;
} finally {
  const jsErrs = await page.evaluate(() => window.__errs || []).catch(() => []);
  if (jsErrs.length) { console.log('\n--- JS 錯誤 ---'); jsErrs.slice(0, 20).forEach((x) => console.log('  ' + x)); }
  const uniq = [...new Set(errors)].filter((x) => !/favicon|manifest/i.test(x));
  if (uniq.length) { console.log('\n--- console/page 錯誤 ---'); uniq.slice(0, 20).forEach((x) => console.log('  ' + x)); }
  await browser.close();
  server.kill();
}
