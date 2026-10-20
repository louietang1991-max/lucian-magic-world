/* tools/gen-voice-samples.mjs — 產生粵語聲音樣本（俾家長揀聲） */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EdgeTTS } from '@andresaya/edge-tts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '樣本語音');
fs.mkdirSync(OUT, { recursive: true });

const LINES = [
  { id: 'A', text: '喂，我係魔法精靈，一齊去搵動物啦！' },
  { id: 'B', text: '跟住個圈，一齊數拍子！' },
  { id: 'C', text: '海龜游水好叻，但係行路好慢。' },
  { id: 'D', text: '蘋果' },
];

const VOICES = [
  { key: 'hiaumaan', name: 'HiuMaan 曉曼', desc: '溫柔女聲（現時用緊）', voice: 'zh-HK-HiuMaanNeural', rate: '-8%', pitch: '+2Hz' },
  { key: 'hiugaai', name: 'HiuGaai 曉佳', desc: '年輕女聲，輕快啲', voice: 'zh-HK-HiuGaaiNeural', rate: '-8%', pitch: '+2Hz' },
  { key: 'wanlung', name: 'WanLung 雲龍', desc: '男聲，講故事感覺', voice: 'zh-HK-WanLungNeural', rate: '-6%', pitch: '+0Hz' },
];

const tts = new EdgeTTS();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const v of VOICES) {
  fs.mkdirSync(path.join(OUT, v.key), { recursive: true });
  for (const l of LINES) {
    const res = await tts.generate(l.text, v.voice, {
      rate: v.rate, pitch: v.pitch,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3', timeout: 25000,
    });
    const buf = Buffer.isBuffer(res.audio) ? res.audio : Buffer.from(res.audio);
    fs.writeFileSync(path.join(OUT, v.key, l.id + '.mp3'), buf);
    console.log(v.key, l.id, buf.length);
    await sleep(120);
  }
}

const html = `<!DOCTYPE html>
<html lang="zh-Hant-HK"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>粵語語音樣本</title>
<style>
 body{font-family:"PingFang HK","Microsoft JhengHei",system-ui;background:#faf8ff;color:#2b2140;margin:0;padding:20px;line-height:1.6}
 h1{font-size:20px;margin:0 0 4px} .sub{color:#6b5b8a;font-size:13px;margin-bottom:18px}
 .voice{background:#fff;border:1px solid #e4dcf2;border-radius:14px;padding:14px 18px;margin-bottom:14px}
 .voice h2{font-size:16px;margin:0 0 2px;color:#4a3670}
 .voice .desc{font-size:12.5px;color:#8d7fab;margin-bottom:10px}
 .line{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px dashed #eee}
 .line b{flex:0 0 22px;color:#7c4dff}
 .line span{flex:1;font-size:14px}
 audio{width:220px;max-width:45vw}
 .tip{background:#f1ecff;border-radius:10px;padding:10px 14px;font-size:12.5px;color:#4a3670;margin-top:6px}
</style></head><body>
<h1>粵語語音樣本（揀聲用）</h1>
<div class="sub">同樣 4 句，用 3 把唔同嘅粵語 Neural 聲音讀出。聽完話我知你鍾意邊把，我就整套遊戲轉過去。</div>
${VOICES.map((v) => `
<div class="voice">
  <h2>${v.name}</h2>
  <div class="desc">${v.desc}　·　${v.voice}　·　語速 ${v.rate}　音調 ${v.pitch}</div>
  ${LINES.map((l) => `<div class="line"><b>${l.id}</b><span>${l.text}</span><audio controls preload="none" src="樣本語音/${v.key}/${l.id}.mp3"></audio></div>`).join('')}
</div>`).join('')}
<div class="tip">📌 現時遊戲用緊 <b>HiuMaan 曉曼</b>（第一把）。如果想再自然啲、似真人講嘢，可以考慮用 Azure 官方 API（有免費額度）加 SSML 語氣，或者搵真人錄音。</div>
</body></html>`;
fs.writeFileSync(path.join(ROOT, '粵語語音樣本.html'), html);
console.log('wrote 粵語語音樣本.html');
