/* =========================================================================
 *  gen-audio.mjs — 用 Google Translate TTS 預先產生所有語音檔
 *  用法: node tools/gen-audio.mjs [--force] [--only=v,p,a,f]
 *  輸出: assets/audio/*.mp3  +  assets/audio/manifest.json
 * ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio');
const FORCE = process.argv.includes('--force');
const ONLY_ARG = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const ONLY = ONLY_ARG ? new Set(ONLY_ARG.split(',')) : null;

fs.mkdirSync(OUT, { recursive: true });

/* ---------- 載入資料檔（瀏覽器全域風格） ---------- */
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['assets/js/data-animals.js', 'assets/js/data-vocab.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const ANIMALS = ctx.window.ANIMAL_DATA;
const LOCATIONS = ctx.window.LOCATIONS;
const VOCAB = ctx.window.VOCAB;
const ANIMAL_TOPIC = ctx.window.buildAnimalTopic();
const ALL_TOPICS = { ...VOCAB, animal: ANIMAL_TOPIC };

/* ---------- 粵語句子 ---------- */
const PHRASES = {
  // 通用
  'hi': '哈囉！我係魔法精靈，一齊玩啦！',
  'tap-start': '撳個掣開始啦！',
  'game-a-title': '聽聲音，揀圖案！',
  'game-b-title': '睇圖案，揀字詞！',
  'game-c-title': '睇字詞，揀圖案！',
  'listen': '聽下係咩字？',
  'listen-replay': '再聽一次！',
  'choose': '揀一個啦！',
  'good': '好叻呀！',
  'great': '嘩！好犀利呀！',
  'try-again': '唔緊要，再試一次啦！',
  'wrong-gentle': '呢個唔係喎，再試一次啦。',
  'all-done': '好叻呀！你完成咗啦！',
  'you-got': '你攞到魔法生果呀！',
  'well-done': '做得好！',
  'back': '返去啦。',
  'lets-go': '我哋出發啦！',
  // 第一部分結果
  'fruits-earned': '你贏到魔法生果啦！',
  'play-again': '再玩一次！',
  // 第二部分
  'meet-animals': '一齊去搵動物啦！',
  'find-shadow': '你見到動物嘅影子未呀？',
  'wipe-sand': '用手指抹開啲沙同水，睇下係邊個？',
  'found-animal': '你搵到動物啦！',
  'feed-it': '餵佢食魔法生果啦！',
  'throw-fruit': '用手指將魔法生果掟入圈圈裡面！',
  'throw-more': '再掟多一個！',
  'nice-throw': '掟得好準呀！',
  'drum-time': '跟住個圈，一齊數拍子！',
  'ready-count': '準備，一，二，三，四！',
  'tap-now': '跟住拍子，撳個圈！',
  'good-beat': '拍得好準呀！',
  'animal-happy': '佢食得好開心呀！',
  'reveal': '係咩動物呢？',
  'now-you-know': '而家你識佢啦！',
  'new-animal': '新嘅動物朋友呀！',
  'rare-animal': '嘩！好稀有嘅動物呀！',
  'fact': '冷知識時間！',
  'done': '搞掂啦！',
  'next-place': '去下一個地方啦！',
  'visit-again': '再嚟呢度玩！',
  'no-more': '我哋下次再嚟啦！',
  'great-score': '好好分呀！',
  'close': '閂咗佢。',
  'settings-locked': '呢度係大人用嘅。',
};

const EN_PHRASES = {
  'good': 'Great job!',
  'great': 'Wow, amazing!',
  'try-again': "It's okay, try again!",
  'listen': 'Listen!',
  'well-done': 'Well done!',
};

/* ---------- 建立工作清單 ---------- */
const jobs = []; // {key, text, lang, tl}
const add = (key, text, lang, tl) => {
  if (!text) return;
  jobs.push({ key, text: String(text), lang, tl });
};

// 題庫字詞（粵/普/英）
for (const [tid, topic] of Object.entries(ALL_TOPICS)) {
  if (tid === 'animal') continue; // 動物題庫用動物名音檔
  topic.items.forEach((it, i) => {
    add(`v/${tid}/${i}/yue`, it.yue || it.zh, 'yue', 'zh-HK');
    add(`v/${tid}/${i}/man`, it.zh, 'man', 'zh-CN');
    add(`v/${tid}/${i}/en`, it.en, 'en', 'en');
  });
}
// 動物名
for (const a of ANIMALS) {
  add(`a/${a.id}/yue`, a.yue || a.zh, 'yue', 'zh-HK');
  add(`a/${a.id}/man`, a.zh, 'man', 'zh-CN');
  add(`a/${a.id}/en`, a.en, 'en', 'en');
}
// 動物冷知識（粵）
for (const a of ANIMALS) {
  a.facts.forEach((f, i) => add(`f/${a.id}/${i}`, f, 'yue', 'zh-HK'));
}
// 句子
for (const [k, t] of Object.entries(PHRASES)) add(`p/zh-HK/${k}`, t, 'yue', 'zh-HK');
for (const [k, t] of Object.entries(EN_PHRASES)) add(`p/en/${k}`, t, 'en', 'en');

if (ONLY) {
  const keep = jobs.filter((j) => ONLY.has(j.key.split('/')[0]));
  jobs.length = 0;
  jobs.push(...keep);
}

// 過濾已存在
const pending = jobs.filter((j) => {
  const p = path.join(OUT, j.key.replace(/\//g, '_') + '.mp3');
  if (!FORCE && fs.existsSync(p) && fs.statSync(p).size > 1500) return false;
  return true;
});

console.log(`[audio] total=${jobs.length} pending=${pending.length} out=${OUT}`);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(job) {
  const q = encodeURIComponent(job.text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=${job.tl}&client=tw-ob&ttsspeed=1`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://translate.google.com/' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('too small ' + buf.length);
  if (!(buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) throw new Error('not mp3');
  return buf;
}

let ok = 0, fail = 0, i = 0;
const CONC = 3;
async function worker() {
  while (i < pending.length) {
    const job = pending[i++];
    const file = path.join(OUT, job.key.replace(/\//g, '_') + '.mp3');
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const buf = await fetchOne(job);
        fs.writeFileSync(file, buf);
        ok++;
        if (ok % 25 === 0) console.log(`[audio] ${ok}/${pending.length} … ${job.key}`);
        break;
      } catch (e) {
        if (attempt === 4) { fail++; console.warn(`[fail] ${job.key}: ${e.message}`); }
        else await sleep(700 * attempt);
      }
    }
    await sleep(120 + Math.random() * 120);
  }
}
const t0 = Date.now();
await Promise.all(Array.from({ length: CONC }, worker));

/* ---------- manifest ---------- */
const manifest = {};
for (const j of jobs) {
  const name = j.key.replace(/\//g, '_') + '.mp3';
  const p = path.join(OUT, name);
  if (fs.existsSync(p)) {
    manifest[j.key] = { f: 'assets/audio/' + name, t: j.text, lang: j.lang };
  }
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`[audio] done ok=${ok} fail=${fail} manifest=${Object.keys(manifest).length} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
