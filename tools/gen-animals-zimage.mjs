/* tools/gen-animals-zimage.mjs — 新動物圖（純文生圖，冇 reference，避免隻蟹污染）
 *  用法: node tools/gen-animals-zimage.mjs --kind=hero|cutout [--conc=4] [--force]
 *  hero:   assets/img/animals/hero/<id>_s1.png（有背景）
 *  cutout: assets/img/animals/cutout/<id>.png（純色背景，之後去背）
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMFY = 'http://127.0.0.1:8000';
const COMFY_OUT = 'C:\\Users\\louie\\Documents\\ComfyUI\\output';
const KIND = (process.argv.find((a) => a.startsWith('--kind=')) || '--kind=hero').split('=')[1];
const CONC = Number((process.argv.find((a) => a.startsWith('--conc=')) || '').split('=')[1] || 4);
const FORCE = process.argv.includes('--force');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const ONLY_SET = ONLY ? new Set(ONLY.split(',')) : null;

const ANIMAL_FILES = [
  'assets/js/data-animals.js', 'assets/js/animals-beach.js', 'assets/js/animals-sea.js',
  'assets/js/animals-underwater.js', 'assets/js/animals-river.js', 'assets/js/animals-forest.js',
  'assets/js/animals-grass.js', 'assets/js/animals-desert.js', 'assets/js/animals-snow.js',
];
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ANIMAL_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const ANIMALS = ctx.window.ANIMAL_DATA;

const ANATOMY = {
  ...JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/animal-anatomy.json'), 'utf8')),
  ...JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/animal-anatomy2.json'), 'utf8')),
};
const BG = {
  beach: 'a sunny sandy beach with palm trees and blue ocean behind',
  sea: 'the blue sea surface with gentle waves and a clear sky',
  underwater: 'a blue underwater scene with light rays, bubbles and green seaweed',
  river: 'a green riverbank with reeds, calm water and trees',
  forest: 'a lush green forest with big trees and moss',
  grass: 'a golden savanna grassland with acacia trees',
  desert: 'a warm sandy desert with dunes and a cactus',
  snow: 'a snowy arctic landscape with snow hills and a soft blue sky',
};
const STYLE = "Cute 3D rendered cartoon illustration for a children's app: soft rounded toy-like shapes, glossy highlights, gentle studio lighting, kawaii, ultra clean high quality 3D render, centred subject, no text, no letters, no watermark.";

/* 原有 35 隻唔重出 */
const oldCtx = { window: {}, console };
vm.createContext(oldCtx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-animals.js'), 'utf8'), oldCtx, { filename: 'x' });
const OLD = new Set(oldCtx.window.ANIMAL_DATA.map((a) => a.id));

function seedOf(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 41;
}

function build(id, prompt) {
  const seed = seedOf(id);
  const neg = 'human, human baby, child, human face, human skin, person, costume, clothes, crab, lobster, claws, pincers, text, letters, watermark, deformed, extra limbs, blurry, low quality, background scenery clutter';
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'z_image_turbo_bf16.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_4b.safetensors', device: 'default', type: 'lumina2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'ae.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '6': { class_type: 'EmptyLatentImage', inputs: { batch_size: 1, height: 1024, width: 832 } },
    '7': { class_type: 'KSampler', inputs: { cfg: 1, denoise: 1, latent_image: ['6', 0], model: ['1', 0], negative: ['5', 0], positive: ['4', 0], sampler_name: 'euler', scheduler: 'normal', seed, steps: 10 } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: `zanim/${id}`, images: ['8', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function submit(wf) {
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: wf, client_id: 'zanim' }) });
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
        for (const o of Object.values(item.outputs || {})) for (const im of o.images || []) imgs.push(im);
        return imgs;
      }
    }
    await sleep(900);
  }
  throw new Error('timeout');
}

const jobs = [];
for (const a of ANIMALS) {
  if (!ONLY_SET && (OLD.has(a.id))) continue;
  if (ONLY_SET && !ONLY_SET.has(a.id)) continue;
  const anatomy = ANATOMY[a.id] || `a cute ${a.en.toLowerCase()} with its own animal features`;
  let dest;
  let prompt;
  if (KIND === 'hero') {
    dest = path.join(ROOT, 'assets/img/animals/hero', `${a.id}_s1.png`);
    prompt = `${STYLE} A cute cartoon ${a.en.toUpperCase()} animal: ${anatomy}. It must look like a real ${a.en.toLowerCase()} animal, not a crab and not a human. Background: ${BG[a.loc] || BG.beach}. Full body centred.`;
  } else {
    dest = path.join(ROOT, 'assets/img/animals/cutout', `${a.id}.png`);
    prompt = `${STYLE} A cute cartoon ${a.en.toUpperCase()} animal: ${anatomy}. It must look like a real ${a.en.toLowerCase()} animal, not a crab and not a human. Background: one single flat uniform pale blue colour filling the whole frame, no scenery, no ground, no shadow, no border, no outline.`;
  }
  if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 10000) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  jobs.push({ a, dest, prompt });
}
console.log(`[zanim] kind=${KIND} pending=${jobs.length} conc=${CONC}`);

let ok = 0, fail = 0, i = 0;
const t0 = Date.now();
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++];
    try {
      const pid = await submit(build(job.a.id, job.prompt));
      const imgs = await waitDone(pid);
      if (!imgs.length) throw new Error('no image');
      fs.copyFileSync(path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename), job.dest);
      ok++;
      if (ok % 8 === 0) console.log(`[zanim] ${ok}/${jobs.length} ${job.a.id} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    } catch (e) {
      fail++;
      console.warn(`[fail] ${job.a.id}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`[zanim] done ok=${ok} fail=${fail} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
