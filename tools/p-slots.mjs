import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'assets/js/screen-explore.js');
let t = fs.readFileSync(f, 'utf8');
const before = t;
t = t.replace(
`      peek: {
        3: [[24, 50], [76, 52], [50, 72]],
        4: [[23, 47], [77, 49], [27, 70], [73, 72]],
        5: [[20, 46], [50, 43], [80, 46], [31, 68], [69, 70]],
      },`,
`      peek: {
        3: [[24, 56], [76, 58], [50, 74]],
        4: [[23, 53], [77, 55], [27, 72], [73, 74]],
        5: [[20, 52], [50, 49], [80, 52], [31, 70], [69, 72]],
      },`
);
t = t.replace("      return { x: clamp(x + jx, 14, 86), y: clamp(y + jy, 30, 80) };", "      return { x: clamp(x + jx, 14, 86), y: clamp(y + jy, 36, 82) };");
if (t === before) throw new Error('nochange');
fs.writeFileSync(f, t);
console.log('peek slots moved down');
