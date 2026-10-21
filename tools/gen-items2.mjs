/* tools/gen-items2.mjs — 依 data-vocab.js 嘅 img prompt 生成題目圖
 *  用法: node tools/gen-items2.mjs [--only=topic1,topic2] [--conc=3] [--force]
 *  輸出: assets/img/items-raw/<topic>/<index>.png
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

/* 用 SVG 就夠清楚嘅主題（唔生成 AI 圖） */
const SKIP_TOPICS = new Set(['color', 'shape', 'number', 'measure']);

function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 21;
}

function makeWorkflow(promptText, seed, prefix) {
  const prompt = `Keep the exact same 3D rendered cartoon art style, glossy toy-like shading, soft studio lighting and children's app quality as the reference image. Draw ${promptText}. Cute, simple, for a toddler picture dictionary. The entire background is ONE single flat uniform pale blue colour (#cfe9f7) filling the whole frame edge to edge: no square, no card, no border, no frame, no outline, no sticker edge, no shadow, no ground, no scenery, no text. Only the subject, centred, ultra clean high quality 3D render.`;
  const neg = 'human baby, human face on animal, animal, mascot, text, letters, numbers, watermark, signature, deformed, extra objects, blurry, low quality, underwater, bubbles, seaweed, rocks, trees, grass, sand, sky, ground, shadow, square, card, frame, border, white outline, sticker edge, vignette, cluttered';
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'flux-2-klein-9b-fp8.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_8b_fp8mixed.safetensors', device: 'default', type: 'flux2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'flux2-vae.safetensors' } },
    '4': { class_type: 'LoadImage', inputs: { image: 'crab.png' } },
    '5': { class_type: 'ImageScaleToTotalPixels', inputs: { image: ['4', 0], megapixels: 1, resolution_steps: 1, upscale_method: 'lanczos' } },
    '6': { class_type: 'VAEEncode', inputs: { pixels: ['5', 0], vae: ['3', 0] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '8': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '9': { class_type: 'ReferenceLatent', inputs: { conditioning: ['7', 0], latent: ['6', 0] } },
    '10': { class_type: 'EmptyFlux2LatentImage', inputs: { batch_size: 1, height: 896, width: 896 } },
    '11': { class_type: 'KSampler', inputs: { cfg: 1, denoise: 1, latent_image: ['10', 0], model: ['1', 0], negative: ['8', 0], positive: ['9', 0], sampler_name: 'euler', scheduler: 'simple', seed, steps: 8 } },
    '12': { class_type: 'VAEDecode', inputs: { samples: ['11', 0], vae: ['3', 0] } },
    '13': { class_type: 'SaveImage', inputs: { filename_prefix: prefix, images: ['12', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function submit(wf) {
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: wf, client_id: 'items2' }) });
  if (!res.ok) throw new Error('submit ' + res.status + ' ' + (await res.text()).slice(0, 160));
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
    const dir = path.join(OUT, tid);
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, i + '.png');
    if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 10000) return;
    jobs.push({ tid, i, it, dest });
  });
}
console.log(`[items2] pending=${jobs.length} conc=${CONC}`);
let ok = 0, fail = 0, k = 0;
const t0 = Date.now();
async function worker() {
  while (k < jobs.length) {
    const job = jobs[k++];
    try {
      const seed = seedOf(job.tid + '/' + job.i);
      const pid = await submit(makeWorkflow(job.it.img, seed, `p4items2/${job.tid}_${job.i}`));
      const imgs = await waitDone(pid);
      if (!imgs.length) throw new Error('no image');
      fs.copyFileSync(path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename), job.dest);
      ok++;
      console.log(`[items2] ${ok}/${jobs.length} ${job.tid}/${job.i} ${job.it.zh} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    } catch (e) {
      fail++;
      console.warn(`[fail] ${job.tid}/${job.i} ${job.it.zh}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`[items2] done ok=${ok} fail=${fail} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
