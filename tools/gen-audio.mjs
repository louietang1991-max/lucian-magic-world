/* =========================================================================
 *  gen-audio.mjs — 用 Microsoft Edge（Azure Neural）語音合成所有語音檔
 *  - 粵語：zh-HK-HiuMaanNeural（自然女聲）
 *  - 普通話：zh-CN-XiaoxiaoNeural
 *  - 英語：en-US-JennyNeural
 *  用法: node tools/gen-audio.mjs [--force] [--only=v,p,a,f] [--conc=3]
 *  輸出: assets/audio/*.mp3 + manifest.json
 * ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { EdgeTTS } from '@andresaya/edge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio');
const FORCE = process.argv.includes('--force');
const ONLY_ARG = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const ONLY = ONLY_ARG ? new Set(ONLY_ARG.split(',')) : null;
const CONC_ARG = (process.argv.find((a) => a.startsWith('--conc=')) || '').split('=')[1];
const CONC = Number(CONC_ARG || 3);

fs.mkdirSync(OUT, { recursive: true });

/* ---------- 載入資料檔 ---------- */
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['assets/js/data-animals.js', 'assets/js/data-vocab.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const ANIMALS = ctx.window.ANIMAL_DATA;
const VOCAB = ctx.window.VOCAB;
const ANIMAL_TOPIC = ctx.window.buildAnimalTopic();
const ALL_TOPICS = { ...VOCAB, animal: ANIMAL_TOPIC };

/* ---------- 粵語句子 ---------- */
const PHRASES = {
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
  'fruits-earned': '你贏到魔法生果啦！',
  'play-again': '再玩一次！',
  'meet-animals': '一齊去搵動物啦！',
  'find-shadow': '你見到動物嘅影子未呀？',
  'wipe-sand': '用手指撥開啲沙，睇下係邊個？',
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
  'peek-grass': '啲動物匿埋喺草同樹後面，等佢哋出嚟嗰陣撳佢啦！',
  'peek-water': '啲動物會喺水底浮上嚟，等佢浮上水面先撳佢啦！',
  'wait-peek': '等佢出嚟先撳啦！',
  'dig-hint': '用手指撥開啲沙，見到影子就撳佢！',
};

const EN_PHRASES = {
  'good': 'Great job!',
  'great': 'Wow, amazing!',
  'try-again': "It's okay, try again!",
  'listen': 'Listen!',
  'well-done': 'Well done!',
};

/* ---------- 聲音設定 ---------- */
const VOICE = {
  yue: { voice: 'zh-HK-HiuMaanNeural', rate: '-8%', pitch: '+2Hz' },
  man: { voice: 'zh-CN-XiaoxiaoNeural', rate: '-10%', pitch: '+2Hz' },
  en: { voice: 'en-US-JennyNeural', rate: '-8%', pitch: '+2Hz' },
};

/* ---------- 建立工作清單 ---------- */
const jobs = [];
const add = (key, text, lang) => { if (text) jobs.push({ key, text: String(text), lang }); };

for (const [tid, topic] of Object.entries(ALL_TOPICS)) {
  if (tid === 'animal') continue;
  topic.items.forEach((it, i) => {
    add(`v/${tid}/${i}/yue`, it.yue || it.zh, 'yue');
    add(`v/${tid}/${i}/man`, it.zh, 'man');
    add(`v/${tid}/${i}/en`, it.en, 'en');
  });
}
for (const a of ANIMALS) {
  add(`a/${a.id}/yue`, a.yue || a.zh, 'yue');
  add(`a/${a.id}/man`, a.zh, 'man');
  add(`a/${a.id}/en`, a.en, 'en');
}
for (const a of ANIMALS) a.facts.forEach((f, i) => add(`f/${a.id}/${i}`, f, 'yue'));
for (const [k, t] of Object.entries(PHRASES)) add(`p/zh-HK/${k}`, t, 'yue');
for (const [k, t] of Object.entries(EN_PHRASES)) add(`p/en/${k}`, t, 'en');

if (ONLY) {
  const keep = jobs.filter((j) => ONLY.has(j.key.split('/')[0]));
  jobs.length = 0;
  jobs.push(...keep);
}

const fileOf = (key) => path.join(OUT, key.replace(/\//g, '_') + '.mp3');
const pending = jobs.filter((j) => {
  const p = fileOf(j.key);
  if (!FORCE && fs.existsSync(p) && fs.statSync(p).size > 2000) return false;
  return true;
});

console.log(`[edge-tts] total=${jobs.length} pending=${pending.length} conc=${CONC}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tts = new EdgeTTS();

async function synthOne(job) {
  const cfg = VOICE[job.lang] || VOICE.yue;
  const res = await tts.generate(job.text, cfg.voice, {
    rate: cfg.rate,
    pitch: cfg.pitch,
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    timeout: 25000,
  });
  const buf = Buffer.isBuffer(res.audio) ? res.audio : Buffer.from(res.audio);
  if (buf.length < 800) throw new Error('too small ' + buf.length);
  if (!(buf[0] === 0xff || (buf[0] === 0x49 && buf[1] === 0x44))) throw new Error('not mp3');
  return buf;
}

let ok = 0, fail = 0, i = 0;
const failures = [];
async function worker() {
  while (i < pending.length) {
    const job = pending[i++];
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const buf = await synthOne(job);
        fs.writeFileSync(fileOf(job.key), buf);
        ok++;
        if (ok % 20 === 0) console.log(`[edge-tts] ${ok}/${pending.length} … ${job.key}`);
        break;
      } catch (e) {
        if (attempt === 4) { fail++; failures.push(job.key + ': ' + e.message); console.warn(`[fail] ${job.key}: ${e.message}`); }
        else await sleep(500 * attempt);
      }
    }
    await sleep(60);
  }
}
const t0 = Date.now();
await Promise.all(Array.from({ length: CONC }, worker));

/* ---------- manifest ---------- */
const manifest = {};
let totalBytes = 0;
for (const j of jobs) {
  const p = fileOf(j.key);
  if (!fs.existsSync(p)) continue;
  const size = fs.statSync(p).size;
  totalBytes += size;
  manifest[j.key] = { f: 'assets/audio/' + path.basename(p), t: j.text, lang: j.lang, s: size };
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`[edge-tts] done ok=${ok} fail=${fail} manifest=${Object.keys(manifest).length} size=${(totalBytes / 1048576).toFixed(2)}MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (failures.length) { console.log('--- failures ---'); failures.slice(0, 20).forEach((f) => console.log(f)); }
