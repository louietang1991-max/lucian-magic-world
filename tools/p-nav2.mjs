import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);
const must = (t, a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); return t.split(a).join(b); };

/* 1) [data-back="xxx"] 直接去指定畫面 */
let core = read('assets/js/core.js');
core = must(core,
`      const back = t.closest('[data-back]');
      if (back) {
        e.preventDefault();
        try { window.AudioKit && window.AudioKit.stop(); } catch (err) {}
        try { window.Metro && window.Metro.stop(); } catch (err) {}
        try { window.AudioKit && window.AudioKit.stopAmbient(); } catch (err) {}
        window.Core.back(back.getAttribute('data-back'));
        return;
      }`,
`      const back = t.closest('[data-back]');
      if (back) {
        e.preventDefault();
        try { window.AudioKit && window.AudioKit.stop(); } catch (err) {}
        try { window.Metro && window.Metro.stop(); } catch (err) {}
        try { window.AudioKit && window.AudioKit.stopAmbient(); } catch (err) {}
        const dest = back.getAttribute('data-back');
        if (dest && dest !== currentScreen) go(dest, { replace: true });
        else back_();
        return;
      }`,
'core back explicit');
core = core.replace('function back(fallback) {', 'function back_(fallback) {');
core = core.replace('    window.Core.back(back.getAttribute(\'data-back\'));', '    window.Core.back(dest);');
// 對外仍然 export back
core = core.replace('go, back, registerScreen,', 'go, back: back_, registerScreen,');
write('assets/js/core.js', core);
console.log('core ok');

/* 2) package.json scripts */
let pkg = JSON.parse(read('package.json'));
pkg.scripts = {
  start: 'node tools/serve.mjs 8123',
  audio: 'node tools/gen-audio.mjs',
  'audio:google': 'node tools/gen-audio-google.mjs',
  'audio:manifest': 'node tools/gen-manifest-js.mjs',
  icons: 'node tools/gen-icons.mjs',
  pack: 'node tools/pack.mjs',
  review: 'node tools/gen-review.mjs',
  test: 'node tools/test-e2e.mjs',
};
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('package.json ok');
