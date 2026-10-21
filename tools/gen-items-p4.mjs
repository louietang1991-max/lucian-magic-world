/* tools/gen-items-p4.mjs — 用 P4 風格生成題目字詞圖（生果／蔬菜／交通工具／屋企）
 *  用法: node tools/gen-items-p4.mjs [--only=fruit,veg] [--conc=3]
 *  輸出: assets/img/items/<topic>/<index>.png（純色背景，之後去背）
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

/* 只做具體物件嘅主題（顏色／形狀／數字／身體用 SVG 更清楚） */
const TOPICS = ['fruit', 'veg', 'vehicle', 'home'];

/* 每件物件嘅英文描述（避免模型畫錯） */
const DESC = {
  apple: 'a shiny red apple with a green leaf and a small stem',
  banana: 'a bunch of two yellow bananas',
  orange: 'a round orange fruit with a small green leaf',
  watermelon: 'a slice of watermelon with green rind, red flesh and black seeds',
  grapes: 'a bunch of purple grapes with a green stem and leaf',
  strawberry: 'a red strawberry with tiny seeds and a green leafy top',
  pear: 'a green pear with a small brown stem and leaf',
  lemon: 'a yellow lemon with a pointed tip and a small leaf',
  pineapple: 'a whole pineapple with yellow diamond-pattern skin and green spiky leaves on top',
  mango: 'a ripe yellow-orange mango with a small green leaf',
  carrot: 'an orange carrot with green leafy top',
  tomato: 'a round red tomato with a green star-shaped top',
  corn: 'a yellow corn cob with green husk leaves',
  cucumber: 'a green cucumber with small bumps',
  mushroom: 'a cute red mushroom with white spots and a pale stem',
  broccoli: 'a green broccoli with a thick pale stem',
  potato: 'a brown potato with a few spots',
  onion: 'a purple onion with a small green sprout on top',
  car: 'a small cute red car with round headlights and black wheels',
  bus: 'a cute yellow school bus with windows and black wheels',
  plane: 'a cute white and blue aeroplane with wings and a tail',
  train: 'a cute green and yellow toy train engine with a chimney and wheels',
  boat: 'a cute little boat with a white sail and a wooden hull',
  bike: 'a cute pink bicycle with two wheels and a basket',
  heli: 'a cute blue helicopter with a big rotor on top',
  firetruck: 'a cute red fire truck with a ladder on top and a yellow stripe',
  door: 'a wooden door with a round golden handle and a frame',
  window: 'a wooden window with blue glass panes and a cross frame',
  bed: 'a cute bed with a blue blanket, white pillow and wooden frame',
  cup: 'a cute orange cup with a handle and a straw',
  spoon: 'a shiny silver spoon',
  book: 'a cute open book with colourful covers',
  clock: 'a round yellow wall clock with numbers and two hands',
  chair: 'a cute yellow wooden chair',
};

function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 11;
}

function makeWorkflow(desc, seed, prefix) {
  const prompt = `Keep the exact same 3D rendered cartoon art style, glossy toy-like shading, soft studio lighting and children's app quality as the reference image. Draw ${desc}. It is a simple cute object for a children's picture dictionary, no animal, no human, no character face, no eyes, no clothes. The entire background is ONE single flat uniform pale blue colour (#cfe9f7) filling the whole frame edge to edge: no square, no card, no border, no frame, no outline, no sticker edge, no shadow, no ground, no scenery. Only the object, centred, ultra clean high quality 3D render.`;
  const neg = 'human, human baby, child, human face, animal, character, eyes, mascot, text, letters, numbers, watermark, signature, deformed, extra objects, blurry, low quality, underwater, bubbles, seaweed, rocks, trees, grass, sand, sky, ground, shadow, square, card, frame, border, white outline, sticker edge, vignette';
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
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: wf, client_id: 'p4items' }) });
  if (!res.ok) throw new Error('submit ' + res.status);
  return (await res.json()).prompt_id;
}
async function waitDone(id, timeoutMs = 180000) {
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
for (const tid of TOPICS) {
  if (ONLY_SET && !ONLY_SET.has(tid)) continue;
  const topic = VOCAB[tid];
  if (!topic) continue;
  topic.items.forEach((it, i) => {
    const dir = path.join(OUT, tid);
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, i + '.png');
    if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 10000) return;
    jobs.push({ tid, i, it, dest, desc: DESC[it.art] || `a cute cartoon ${it.en}` });
  });
}
console.log(`[items] pending=${jobs.length} conc=${CONC}`);
let ok = 0, fail = 0, i = 0;
const t0 = Date.now();
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++];
    try {
      const seed = seedOf(job.tid + '/' + job.i);
      const pid = await submit(makeWorkflow(job.desc, seed, `p4items/${job.tid}_${job.i}`));
      const imgs = await waitDone(pid);
      if (!imgs.length) throw new Error('no image');
      fs.copyFileSync(path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename), job.dest);
      ok++;
      console.log(`[items] ${ok}/${jobs.length} ${job.tid}/${job.i} ${job.it.en} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    } catch (e) {
      fail++;
      console.warn(`[fail] ${job.tid}/${job.i}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`[items] done ok=${ok} fail=${fail} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
