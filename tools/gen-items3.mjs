/* tools/gen-items3.mjs — 題目圖（純文生圖，唔用 reference，避免隻蟹污染）
 *  用法: node tools/gen-items3.mjs [--only=topic] [--conc=3] [--force]
 *  模型: Z-Image Turbo（快），統一「3D 膠質玩具風 + 淨色淺藍背景」
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img', 'items-raw');
const COMFY = 'http://127.0.0.1:8000';
const COMFY_OUT = 'C:\\Users\\louie\\Documents\\ComfyUI\\output';
fs.mkdirSync(OUT, { recursive: true });

const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const ONLY_SET = ONLY ? new Set(ONLY.split(',')) : null;
const CONC = Number((process.argv.find((a) => a.startsWith('--conc=')) || '').split('=')[1] || 3);
const FORCE = process.argv.includes('--force');

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-vocab.js'), 'utf8'), ctx, { filename: 'data-vocab.js' });
const VOCAB = ctx.window.VOCAB;
const SKIP_TOPICS = new Set(['color', 'shape', 'number', 'measure']);

const STYLE = 'Cute 3D rendered cartoon illustration for a toddler picture dictionary: soft rounded shapes, glossy toy-like shading, gentle studio lighting, kawaii, ultra clean high quality 3D render, centred, plain flat light blue background filling the frame, no text, no letters, no watermark, no border, no frame, no sticker outline, no shadow, no props.';

function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 31;
}

function makeWorkflow(desc, seed, prefix) {
  const prompt = `${STYLE} Subject: ${desc}.`;
  const neg = 'crab, lobster, shell, claws, animal, human, baby, text, letters, numbers, watermark, signature, extra objects, deformed, blurry, low quality, background scenery, trees, grass, sand, sky, underwater, sea, bubbles, seaweed, rocks, shadow, dark background, square card, border, frame, white outline, sticker';
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'z_image_turbo_bf16.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_4b.safetensors', device: 'default', type: 'lumina2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'ae.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '6': { class_type: 'EmptyLatentImage', inputs: { batch_size: 1, height: 896, width: 896 } },
    '7': { class_type: 'KSampler', inputs: { cfg: 1, denoise: 1, latent_image: ['6', 0], model: ['1', 0], negative: ['5', 0], positive: ['4', 0], sampler_name: 'euler', scheduler: 'normal', seed, steps: 10 } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: prefix, images: ['8', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function submit(wf) {
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: wf, client_id: 'items3' }) });
  if (!res.ok) throw new Error('submit ' + res.status + ' ' + (await res.text()).slice(0, 200));
  return (await res.json()).prompt_id;
}
async function waitDone(id, timeoutMs = 200000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const res = await fetch(`${COMFY}/history/${id}`);
    if (res.ok) {
      const item = (await res.json())[id];
      if (item && item.status && item.status.completed) {
        const imgs = [];
        for (const out of Object.values(item.outputs || {})) for (const im of out.images || []) imgs.push(im);
        return imgs;
      }
    }
    await sleep(900);
  }
  throw new Error('timeout');
}

const jobs = [];
for (const [tid, topic] of Object.entries(VOCAB)) {
  if (SKIP_TOPICS.has(tid)) continue;
  if (ONLY_SET && !ONLY_SET.has(tid)) continue;
  topic.items.forEach((it, i) => {
    if (!it.img) return;
    fs.mkdirSync(path.join(OUT, tid), { recursive: true });
    const dest = path.join(OUT, tid, i + '.png');
    if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 10000) return;
    jobs.push({ tid, i, it, dest });
  });
}
console.log(`[items3] pending=${jobs.length} conc=${CONC}`);
let ok = 0, fail = 0, k = 0;
const t0 = Date.now();
async function worker() {
  while (k < jobs.length) {
    const job = jobs[k++];
    try {
      const seed = seedOf(job.tid + '/' + job.i);
      const pid = await submit(makeWorkflow(job.it.img, seed, `p4items3/${job.tid}_${job.i}`));
      const imgs = await waitDone(pid);
      if (!imgs.length) throw new Error('no image');
      fs.copyFileSync(path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename), job.dest);
      ok++;
      if (ok % 5 === 0) console.log(`[items3] ${ok}/${jobs.length} ${job.tid}/${job.i} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    } catch (e) {
      fail++;
      console.warn(`[fail] ${job.tid}/${job.i}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`[items3] done ok=${ok} fail=${fail} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
