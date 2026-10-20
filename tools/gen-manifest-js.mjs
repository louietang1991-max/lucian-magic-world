import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manPath = path.join(ROOT, 'assets/audio/manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
// 只保留 f 欄位，慳位
const slim = {};
for (const [k, v] of Object.entries(man)) slim[k] = v.f;
const js = '/* 自動產生：語音清單（fetch manifest.json 失敗時嘅後備） */\nwindow.__AUDIO_MANIFEST = ' + JSON.stringify(slim) + ';\n';
fs.writeFileSync(path.join(ROOT, 'assets/js/audio-manifest.js'), js);
console.log('wrote assets/js/audio-manifest.js', js.length, 'chars,', Object.keys(slim).length, 'entries');
