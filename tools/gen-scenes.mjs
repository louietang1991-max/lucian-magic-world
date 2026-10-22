/* tools/gen-scenes.mjs — 生成 8 個地方嘅背景圖（純文生圖，統一 3D 卡通風格）
 *  用法: node tools/gen-scenes.mjs [--conc=3] [--force]
 *  輸出: assets/img/scenes-raw/<theme>.png → 之後 resize 做 assets/img/scenes/<theme>.jpg
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img', 'scenes-raw');
const COMFY = 'http://127.0.0.1:8000';
const COMFY_OUT = 'C:\\Users\\louie\\Documents\\ComfyUI\\output';
const CONC = Number((process.argv.find((a) => a.startsWith('--conc=')) || '').split('=')[1] || 3);
const FORCE = process.argv.includes('--force');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = "Cute 3D rendered cartoon game background for a children's app: soft rounded shapes, glossy highlights, gentle warm lighting, kawaii, ultra clean high quality 3D render, wide empty foreground in the middle of the frame where characters stand, no characters, no animals, no people, no text, no letters, no watermark, no ui, no border.";

const SCENES = {
  beach: 'A sunny tropical beach: golden sand covering the lower half, calm turquoise sea and bright blue sky behind, two cartoon palm trees at the far left and far right edges, a few shells and a beach ball at the very sides. Leave the centre sand empty.',
  sea: 'A calm blue sea surface with gentle cartoon waves, a bright sky with soft clouds, sunlight sparkles on the water, tiny distant islands at the horizon edges. Leave the centre water empty.',
  underwater: 'An underwater scene: deep blue water with light rays shining from above, bubbles floating, green seaweed and grey rocks only along the bottom edges and corners, sandy sea floor at the bottom. Leave the centre water and floor empty.',
  river: 'A green riverbank scene: calm river water across the middle, reeds and tall grass at the left and right edges, willow trees behind. Leave the centre bank and water empty.',
  forest: 'A lush green forest clearing: big cartoon trees with rounded canopies at the left and right edges, mossy green ground, soft light beams, a few mushrooms and fireflies at the sides. Leave the centre clearing empty.',
  grass: 'A golden savanna grassland: dry yellow grass covering the ground, flat-topped acacia trees in the distance, warm orange sky with a big soft sun. Leave the centre grass empty.',
  desert: 'A warm sandy desert: rolling orange sand dunes, a cactus and a few dry rocks at the left and right edges, warm hazy sky. Leave the centre sand empty.',
  snow: 'A snowy arctic landscape: soft white snow covering the ground, rounded snow hills, a few snow-covered pine trees at the edges, pale blue sky with soft clouds. Leave the centre snow empty.',
};

function seedOf(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 900000 + 59;
}

function wf(prompt, seed, prefix) {
  const neg = 'characters, animals, people, faces, text, letters, numbers, watermark, ui, border, frame, low quality, blurry, deformed, dark, scary, realistic photo';
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'z_image_turbo_bf16.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_4b.safetensors', device: 'default', type: 'lumina2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'ae.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '5': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '6': { class_type: 'EmptyLatentImage', inputs: { batch_size: 1, height: 1024, width: 832 } },
    '7': { class_type: 'KSampler', inputs: { cfg: 1, denoise: 1, latent_image: ['6', 0], model: ['1', 0], negative: ['5', 0], positive: ['4', 0], sampler_name: 'euler', scheduler: 'normal', seed, steps: 10 } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: prefix, images: ['8', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function submit(w) {
  const res = await fetch(`${COMFY}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: w, client_id: 'scenes' }) });
  if (!res.ok) throw new Error('submit ' + res.status);
  return (await res.json()).prompt_id;
}
async function waitDone(id) {
  for (let i = 0; i < 200; i++) {
    await sleep(1000);
    const r = await fetch(`${COMFY}/history/${id}`);
    if (r.ok) {
      const item = (await r.json())[id];
      if (item && item.status && item.status.completed) {
        const imgs = [];
        for (const o of Object.values(item.outputs || {})) for (const im of o.images || []) imgs.push(im);
        return imgs;
      }
    }
  }
  throw new Error('timeout');
}

const jobs = Object.entries(SCENES).filter(([t]) => FORCE || !fs.existsSync(path.join(OUT, t + '.png')));
console.log('[scenes] pending', jobs.length);
let ok = 0;
async function worker(list) {
  for (const [theme, desc] of list) {
    try {
      const pid = await submit(wf(`${STYLE} ${desc}`, seedOf(theme), `scene/${theme}`));
      const imgs = await waitDone(pid);
      fs.copyFileSync(path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename), path.join(OUT, theme + '.png'));
      ok++;
      console.log('[scenes]', theme, 'ok');
    } catch (e) { console.warn('[scenes] fail', theme, e.message); }
  }
}
const chunks = Array.from({ length: CONC }, (_, i) => jobs.filter((_, j) => j % CONC === i));
await Promise.all(chunks.map((c) => worker(c)));
console.log('[scenes] done', ok);
