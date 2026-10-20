import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t);
const must = (t, a, b, label) => { if (!t.includes(a)) throw new Error('MISS ' + label); return t.split(a).join(b); };

let css = read('assets/css/feed.css');

/* 1) 淡色主題加深，增加對比 */
css = must(css, `#screen-feed.feed-beach { --fbg: linear-gradient(180deg, #a9e2ff 0%, #ffd89b 42%, #f0b86a 100%); }`,
  `#screen-feed.feed-beach { --fbg: linear-gradient(180deg, #79bfe8 0%, #e8b672 44%, #a8703a 100%); }`, 'beach');
css = must(css, `#screen-feed.feed-grass { --fbg: linear-gradient(180deg, #cdefff 0%, #ffe9a8 40%, #c8b23a 100%); }`,
  `#screen-feed.feed-grass { --fbg: linear-gradient(180deg, #8fc4e0 0%, #d8c04a 42%, #7a6a18 100%); }`, 'grass');
css = must(css, `#screen-feed.feed-snow { --fbg: linear-gradient(180deg, #cfe9f8 0%, #eef8ff 50%, #d8ecf8 100%); }`,
  `#screen-feed.feed-snow { --fbg: linear-gradient(180deg, #8fb8d0 0%, #cfe4f2 45%, #9dbdd4 100%); }`, 'snow');
css = must(css, `#screen-feed.feed-desert { --fbg: linear-gradient(180deg, #ffd08a 0%, #e8904a 50%, #a85a24 100%); }`,
  `#screen-feed.feed-desert { --fbg: linear-gradient(180deg, #e8a55c 0%, #c9762e 48%, #7a3e12 100%); }`, 'desert');
css = must(css, `#screen-feed.feed-sea { --fbg: linear-gradient(180deg, #8ee4ff 0%, #4aa8e0 45%, #1a6fa8 100%); }`,
  `#screen-feed.feed-sea { --fbg: linear-gradient(180deg, #6dbde0 0%, #2f8fc4 45%, #135c8a 100%); }`, 'sea');
css = must(css, `#screen-feed.feed-river { --fbg: linear-gradient(180deg, #cdefff 0%, #8fd8c0 40%, #4caf50 100%); }`,
  `#screen-feed.feed-river { --fbg: linear-gradient(180deg, #8fc4d8 0%, #5fa87e 42%, #2e6b32 100%); }`, 'river');

/* 2) 加一層柔和暗角，令中間嘅動物＋圈圈更突出 */
if (!css.includes('/* 餵食畫面：暗角 */')) {
  css += `
/* 餵食畫面：暗角（唔會擋到操作） */
#screen-feed::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(115% 78% at 50% 44%, rgba(20, 12, 40, 0) 34%, rgba(20, 12, 40, 0.28) 100%);
}
`;
}
write('assets/css/feed.css', css);
console.log('feed css ok');
