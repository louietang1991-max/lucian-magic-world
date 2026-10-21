/* tools/regen-items.mjs — 針對個別題目圖重生成（用同 gen-items3 一樣嘅 workflow）
 *  用法: node tools/regen-items.mjs body/7 nature/2 position/1
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img', 'items-raw');
const COMFY = 'http://127.0.0.1:8000';
const COMFY_OUT = 'C:\\Users\\louie\\Documents\\ComfyUI\\output';

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-vocab.js'), 'utf8'), ctx, { filename: 'data-vocab.js' });
const VOCAB = ctx.window.VOCAB;

const STYLE = 'Cute 3D rendered cartoon illustration for a toddler picture dictionary: soft rounded shapes, glossy toy-like shading, gentle studio lighting, kawaii, ultra clean high quality 3D render, centred, plain flat light blue background filling the frame, no text, no letters, no watermark, no border, no frame, no sticker outline, no shadow, no props.';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!ids.length) { console.log('usage: node tools/regen-items.mjs body/7 nature/2'); process.exit(0); }

function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 77;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const idstr of ids) {
  const [tid, idxStr] = idstr.split('/');
  const i = Number(idxStr);
  const topic = VOCAB[tid];
  const it = topic && topic.items[i];
  if (!it || !it.img) { console.warn('skip', idstr); continue; }
  const seed = seedOf(tid + '/' + i);
  const prompt = `${STYLE} Subject: ${it.img}. Absolutely no text, no letters, no words in the image.`;
  const neg = 'crab, lobster, shell, claws, animal, bear, human, baby, text, letters, words, numbers, watermark, signature, extra objects, deformed, blurry, low quality, background scenery, trees, grass, sand, underwater, sea, bubbles, seaweed, rocks, shadow, dark background, square card, border, frame, white outline, sticker';
  const wf = {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'z_image_turbo_bf16.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_4b.safetensors', device: 'default', type: 'lumina2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'ae.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '6': { class_type: 'EmptyLatentImage', inputs: { batch_size: 1, height: 896, width: 896 } },
    '7': { class_type: 'KSampler', inputs: { cfg: 1, denoise: 1, latent_image: ['6', 0], model: ['1', 0], negative: ['5', 0], positive: ['4', 0], sampler_name: 'euler', scheduler: 'normal', seed, steps: 10 } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: `regen/${tid}_${i}`, images: ['8', 0] } },
  };
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: wf, client_id: 'regen' }) });
  if (!res.ok) { console.warn('submit fail', idstr, res.status); continue; }
  const pid = (await res.json()).prompt_id;
  let done = null;
  for (let t = 0; t < 120; t++) {
    await sleep(1000);
    const h = await (await fetch(`${COMFY}/history/${pid}`)).json();
    const item = h[pid];
    if (item && item.status && item.status.completed) { done = item; break; }
  }
  if (!done) { console.warn('timeout', idstr); continue; }
  const im = Object.values(done.outputs || {}).flatMap((o) => o.images || [])[0];
  if (!im) { console.warn('no image', idstr); continue; }
  fs.mkdirSync(path.join(OUT, tid), { recursive: true });
  fs.copyFileSync(path.join(COMFY_OUT, im.subfolder || '', im.filename), path.join(OUT, tid, i + '.png'));
  console.log('regen ok', idstr, it.zh);
}
