/* tools/test-zip.mjs — 驗證打包出嚟嘅 zip：解壓後起 server，行一次基本流程 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import JSZip from 'jszip';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIP = path.join(ROOT, 'lucian-magic-world.zip');
const TMP = path.join(process.env.TEMP || '/tmp', 'lucian-zipcheck');
const PORT = 8133;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 解壓
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
const zip = await JSZip.loadAsync(fs.readFileSync(ZIP));
for (const [name, f] of Object.entries(zip.files)) {
  if (f.dir) continue;
  const full = path.join(TMP, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, await f.async('nodebuffer'));
}
console.log('extracted to', TMP);

const server = spawn(process.execPath, [path.join(ROOT, 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore', cwd: TMP });
// serve.mjs serves its own root; 用一個細嘅 inline server 好啲
server.kill();
const http = await import('node:http');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(TMP, p);
  if (!f.startsWith(TMP) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(PORT, '127.0.0.1', r));

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const bad = [];
page.on('pageerror', (e) => bad.push('pageerror ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle2', timeout: 30000 });
await sleep(2500);
const state = await page.evaluate(() => ({
  boot: !document.getElementById('btn-boot-start').hidden,
  audioReady: window.AudioKit.ready,
  audioCount: Object.keys(window.AudioKit.manifest).length,
  animals: window.ANIMAL_DATA.length,
}));
console.log(JSON.stringify(state));
await page.click('#btn-boot-start');
await sleep(700);
const home = await page.evaluate(() => document.getElementById('screen-home').classList.contains('active'));
// 測一次語音
const audio = await page.evaluate(async () => {
  const t0 = performance.now();
  await window.AudioKit.play('v/fruit/0/yue');
  return Math.round(performance.now() - t0);
});
// 測一次餵食
await page.evaluate(() => { window.Core.go('explore'); window.Explore.enterPlace('forest'); });
await sleep(900);
await page.evaluate(() => { const s = window.Explore.state.session.spots[0]; window.Feed.start({ animal: s.animal }); });
await sleep(900);
const feedOk = await page.evaluate(() => window.Feed.F.stage === 'throw');
const uniq = [...new Set(bad)].filter((x) => !/favicon/.test(x));
console.log(JSON.stringify({ home, audioMs: audio, feedOk, problems: uniq.slice(0, 8) }, null, 2));
await browser.close();
srv.close();
const ok = home && feedOk && audio > 300 && state.audioCount > 400 && uniq.length === 0;
console.log(ok ? '\n✅ 打包版本驗證通過' : '\n❌ 打包版本有問題');
process.exit(ok ? 0 : 1);
