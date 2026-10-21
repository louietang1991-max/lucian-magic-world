/* tools/test-e2e.mjs — 用手機尺寸嘅 Chrome 行一次全流程，收集錯誤 + 截圖
 * 用法: node tools/test-e2e.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'tools', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}/`;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p));

const errors = [];
const logs = [];
let shotIdx = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  shotIdx++;
  const f = path.join(SHOTS, `${String(shotIdx).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: f });
  return f;
}

async function waitFor(page, fn, timeout = 8000, label = '') {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (await page.evaluate(fn)) return true;
    await sleep(80);
  }
  throw new Error('timeout waiting: ' + label);
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT: ' + msg);
  console.log('  ✓ ' + msg);
}

async function main() {
  // 起本機 server
  const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
  await sleep(500);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-features=Translate'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const client = await page.target().createCDPSession();
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  page.on('console', (m) => {
    const t = m.type();
    if (t === 'error' || t === 'warning') logs.push(`[${t}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('reqfail: ' + r.url() + ' ' + (r.failure() || {}).errorText));

  try {
    console.log('\n== 1. 開機 ==');
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluateOnNewDocument(() => {
      window.__testMode = true;
    });
    await waitFor(page, () => !document.getElementById('btn-boot-start').hidden, 15000, 'boot start button');
    await shot(page, 'boot');
    await page.click('#btn-boot-start');
    await sleep(900);
    const homeActive = await page.evaluate(() => document.getElementById('screen-home').classList.contains('active'));
    assert(homeActive, '入到主頁');
    await shot(page, 'home');

    console.log('\n== 2. 學習遊戲 A ==');
    await page.click('[data-go="learn"]');
    await sleep(500);
    assert(await page.evaluate(() => document.getElementById('screen-learn').classList.contains('active')), '入到學習選單');
    await shot(page, 'learn');
    await page.click('[data-quiz="A"]');
    await sleep(1200);
    assert(await page.evaluate(() => document.getElementById('screen-quiz').classList.contains('active')), '入到答題畫面');
    await shot(page, 'quiz-A');
    // 答 5 題（每題揀正確答案）
    for (let i = 0; i < 5; i++) {
      const info = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('#quiz-answers .answer'));
        return {
          n: els.length,
          screen: window.Core.screen,
          prompt: (document.getElementById('quiz-prompt-text') || {}).textContent,
          answers: els.map((e) => e.dataset.id),
        };
      });
      if (info.n !== 4) console.log('  [debug] 怪題', JSON.stringify(info));
      assert(info.n === 4, `第 ${i + 1} 題有 4 個選項`);
      // 由游戲邏輯攞正確答案：全部逐個試，用 data 對比 prompt 嘅 target（唔可靠）→ 用 addInitScript hook
      const picked = await page.evaluate(() => {
        // 靠 Art/DOM 冇 target 資料，改用「答啱會 .correct」
        return null;
      });
      // 逐個揀，直到有 .correct 出現
      let answered = false;
      for (let k = 0; k < 4 && !answered; k++) {
        await page.evaluate((idx) => {
          const els = document.querySelectorAll('#quiz-answers .answer');
          if (els[idx]) els[idx].click();
        }, k);
        await sleep(420);
        answered = await page.evaluate(() => !!document.querySelector('#quiz-answers .answer.correct'));
      }
      assert(answered, `第 ${i + 1} 題答啱`);
      await sleep(1600);
    }
    await waitFor(page, () => document.getElementById('screen-result').classList.contains('active'), 8000, 'result screen');
    await sleep(700);
    await shot(page, 'result');
    assert(true, '完成 5 題，到結算畫面');
    const fruitsAfter = await page.evaluate(() => window.Core.state.progress.fruits);
    assert(fruitsAfter >= 3, '魔法生果有增加 (' + fruitsAfter + ')');

    console.log('\n== 3. 探索：沙灘 ==');
    await page.evaluate(() => window.Core.go('home'));
    await sleep(400);
    await page.click('[data-go="explore"]');
    await sleep(500);
    assert(await page.evaluate(() => document.querySelectorAll('.map-card').length === 8), '8 個地點');
    await shot(page, 'map');
    await page.evaluate(() => document.querySelectorAll('.map-card')[0].click());
    await sleep(1200);
    assert(await page.evaluate(() => document.getElementById('screen-place').classList.contains('active')), '入到沙灘');
    await shot(page, 'place');
    const spots = await page.evaluate(() => document.querySelectorAll('.shadow-spot').length);
    assert(spots >= 3 && spots <= 5, `隨機 3-5 個影子 (${spots})`);
    // 撥開沙：喺影子位置上面掃
    const box = await page.evaluate(() => {
      const el = document.querySelector('.shadow-spot');
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.move(box.x - 60, box.y);
    await page.mouse.down();
    for (let i = 0; i <= 12; i++) {
      await page.mouse.move(box.x - 60 + i * 10, box.y + Math.sin(i) * 30);
      await sleep(20);
    }
    await page.mouse.up();
    await sleep(900);
    await shot(page, 'place-wiped');
    // 撳影子
    await page.evaluate(() => document.querySelector('.shadow-spot').click());
    await sleep(1400);
    assert(await page.evaluate(() => document.getElementById('screen-feed').classList.contains('active')), '入到餵食畫面');
    await shot(page, 'feed-throw');
    // 掟 3 個生果
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => document.getElementById('feed-circle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 })));
      await sleep(900);
    }
    await shot(page, 'feed-beat');
    await shot(page, 'feed-eat-prep');
    // 掟完 3 個 → 動物食嘢 → 揭曉（已冇拍子環節）
    const tEat = Date.now();
    let eatSeen = false;
    while (Date.now() - tEat < 20000) {
      const st = await page.evaluate(() => window.Feed && window.Feed.F.stage);
      if (st === 'eat' || st === 'done') { eatSeen = true; break; }
      await sleep(150);
    }
    assert(eatSeen, '掟完生果 → 餵動物食嘢');
    const noRhythm = await page.evaluate(() => !document.getElementById('rhythm-ready') && !document.getElementById('beat-hands'));
    assert(noRhythm, '拍子環節已移除（冇節奏面板／雙手）');
    await sleep(600);
    await shot(page, 'feed-eat');
    await shot(page, 'feed-eat');
    await waitFor(page, () => document.getElementById('screen-reveal').classList.contains('active'), 12000, 'reveal screen');
    await sleep(1600);
    await shot(page, 'reveal');
    const revealed = await page.evaluate(() => ({
      name: document.getElementById('reveal-name').textContent,
      facts: document.querySelectorAll('#reveal-facts .fact-row').length,
      stars: document.querySelectorAll('#reveal-stars .star.on').length,
    }));
    assert(!!revealed.name, '獎勵卡顯示動物名：' + revealed.name);
    assert(revealed.facts >= 1, '解鎖冷知識 ' + revealed.facts + ' 條');
    const collected = await page.evaluate(() => Object.keys(window.Core.state.progress.collected));
    assert(collected.length >= 1, '圖鑑記錄咗動物：' + collected.join(','));
    await page.click('#reveal-next');
    await sleep(900);
    assert(await page.evaluate(() => document.getElementById('screen-place').classList.contains('active')), '返回場景');

    console.log('\n== 4. 圖鑑 ==');
    await page.evaluate(() => window.Core.go('album'));
    await sleep(700);
    await shot(page, 'album');
    const cards = await page.evaluate(() => document.querySelectorAll('.album-card').length);
    assert(cards >= 120, '圖鑑有 ' + cards + ' 隻動物（每個地方 16 種）');
    const unlocked = await page.evaluate(() => document.querySelectorAll('.album-card:not(.locked)').length);
    assert(unlocked >= 1, '有已解鎖動物 (' + unlocked + ')');

    console.log('\n== 5. 設定 ==');
    await page.evaluate(() => window.Core.go('home'));
    await sleep(300);
    // 長按齒輪
    const gear = await page.$('#btn-settings');
    const gb = await gear.boundingBox();
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
    await page.mouse.down();
    await sleep(1200);
    await page.mouse.up();
    await sleep(700);
    assert(await page.evaluate(() => document.getElementById('screen-settings').classList.contains('active')), '長按入到設定');
    await shot(page, 'settings-lock');
    const answer = await page.evaluate(() => document.getElementById('lock-q').textContent);
    const m = answer.match(/(\d+)\s*\+\s*(\d+)/);
    const sum = Number(m[1]) + Number(m[2]);
    await page.evaluate((ans) => {
      const btns = Array.from(document.querySelectorAll('#lock-options button'));
      const b = btns.find((x) => Number(x.textContent) === ans);
      if (b) b.click();
    }, sum);
    await sleep(600);
    assert(await page.evaluate(() => !document.getElementById('set-content').hidden), '解鎖設定頁');
    await shot(page, 'settings');
    // 轉英文
    await page.evaluate(() => document.querySelector('#set-speak button[data-v="en"]').click());
    await sleep(300);
    await page.evaluate(() => window.Core.go('home'));
    await sleep(400);

    console.log('\n== 6. 刷新後保存 ==');
    await page.reload({ waitUntil: 'networkidle2' });
    await waitFor(page, () => !document.getElementById('btn-boot-start').hidden, 12000, 'boot after reload');
    await page.click('#btn-boot-start');
    await sleep(800);
    const persisted = await page.evaluate(() => ({
      lang: window.Core.state.settings.speakLang,
      fruits: window.Core.state.progress.fruits,
      collected: Object.keys(window.Core.state.progress.collected).length,
    }));
    assert(persisted.lang === 'en', '語言設定有保存');
    assert(persisted.collected >= 1, '圖鑑進度有保存');
    await shot(page, 'home-after-reload');

    console.log('\n== 7. 所有畫面 screenshot ==');
    for (const s of ['learn', 'explore', 'album', 'settings']) {
      await page.evaluate((x) => window.Core.go(x), s);
      await sleep(500);
      await shot(page, 'screen-' + s);
    }

    console.log('\n✅ 全部測試通過');
  } catch (e) {
    console.error('\n❌ 測試失敗：', e.message);
    try { await shot(page, 'FAIL'); } catch (e2) {}
    process.exitCode = 1;
  } finally {
    if (errors.length) {
      console.log('\n--- 錯誤 ---');
      errors.slice(0, 30).forEach((e) => console.log('  ' + e));
    }
    try {
      const jsErrs = await page.evaluate(() => window.__errs || []);
      if (jsErrs.length) {
        console.log('\n--- JS 錯誤 ---');
        jsErrs.slice(0, 30).forEach((e) => console.log('  ' + e));
      }
    } catch (e) {}
    const badLogs = logs.filter((l) => !/DevTools|Download the React|favicon/i.test(l));
    if (badLogs.length) {
      console.log('\n--- console ---');
      badLogs.slice(0, 40).forEach((l) => console.log('  ' + l));
    }
    await browser.close();
    server.kill();
  }
}

main();
