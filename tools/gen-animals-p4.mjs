/* tools/gen-animals-p4.mjs — 用 P4（FLUX.2 + reference art 參考）生成 35 隻動物 × 3 seeds
 *  用法: node tools/gen-animals-p4.mjs [--only=crab,lion] [--seeds=3] [--conc=3]
 *  輸出: assets/img/animals/hero/<id>_s<k>.png
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img', 'animals', 'hero');
const COMFY = 'http://127.0.0.1:8000';
const COMFY_OUT = 'C:\\Users\\louie\\Documents\\ComfyUI\\output';
fs.mkdirSync(OUT, { recursive: true });

const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const ONLY_SET = ONLY ? new Set(ONLY.split(',')) : null;
const SEEDS = Number((process.argv.find((a) => a.startsWith('--seeds=')) || '').split('=')[1] || 3);
const CONC = Number((process.argv.find((a) => a.startsWith('--conc=')) || '').split('=')[1] || 3);
const FORCE = process.argv.includes('--force');

/* ---------- 載入動物資料 ---------- */
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-animals.js'), 'utf8'), ctx, { filename: 'data-animals.js' });
const ANIMALS = ctx.window.ANIMAL_DATA;

/* ---------- 每隻動物嘅外形描述（英文） ---------- */
const ANATOMY = {
  crab: 'a hard red shell, two big claws raised, eight small legs and eyes on short stalks',
  starfish: 'a five-pointed orange starfish body with a bumpy texture and a cute face in the centre',
  seagull: 'a white bird body, grey wings, orange beak and orange legs',
  turtle: 'a green patterned shell, four flippers and a small cute head',
  fiddlercrab: 'one huge yellow claw and a small sandy body with eyes on stalks',
  dolphin: 'a smooth blue dolphin body, rounded snout, dorsal fin, flippers and tail',
  whale: 'a huge round blue whale body, wide smiling mouth, blowhole and big tail fluke',
  seal: 'a round grey seal body with flippers, whiskers and big shiny eyes',
  flyingfish: 'a blue fish with very large wing-like fins spread out',
  octopus: 'a purple round head and eight curly tentacles with pink suckers',
  clownfish: 'an orange fish with white stripes outlined in black and small fins',
  jellyfish: 'a glowing translucent dome with long soft tentacles',
  seahorse: 'an orange seahorse with a curled tail, long snout and small dorsal fin',
  shark: 'a grey shark with a tall dorsal fin, wide mouth with friendly teeth and a big tail',
  duck: 'a yellow duck with an orange beak, webbed feet and small wings',
  frog: 'a green frog with two big round eyes on top, a wide smile and long legs',
  crocodile: 'a green crocodile with a long snout, small friendly teeth, scaly back and tail',
  salmon: 'a pink-orange fish with fins and a forked tail',
  bear: 'a brown bear with round ears, big soft paws and a round muzzle',
  fox: 'an orange fox with pointed ears, white muzzle and a big bushy tail',
  squirrel: 'a brown squirrel with a huge fluffy tail and small ears',
  owl: 'a brown owl with huge round eyes, ear tufts and a small orange beak',
  bee: 'a yellow and black striped bee with translucent wings and antennae',
  lion: 'a golden lion with a big fluffy mane and a tufted tail',
  zebra: 'a white zebra body with black stripes, a short mane and small hooves',
  giraffe: 'a very long neck, yellow body with brown patches and small ossicones',
  elephant: 'a grey elephant with big ears, a long trunk and small tusks',
  monkey: 'a brown monkey with round ears and a long curled tail',
  camel: 'a tan camel with a hump, long neck and long legs',
  fennec: 'a small pale fox with huge ears and big shiny eyes',
  scorpion: 'a brown scorpion with two pincers and a curved tail with a stinger',
  rattlesnake: 'a coiled tan snake with patterned scales and a rattle tail',
  penguin: 'a black and white penguin with an orange beak, orange feet and flippers',
  polarbear: 'a big white polar bear with soft paws and a black nose',
  snowyowl: 'a white owl with bright yellow eyes and small ear tufts',
};

/* ---------- 每個地方嘅背景 ---------- */
const BG = {
  beach: 'a sunny sandy beach with palm trees, blue sky and gentle ocean waves behind',
  sea: 'the blue sea surface with gentle waves, sunlight sparkles and a clear sky',
  underwater: 'a blue underwater scene with light rays from above, floating bubbles, green seaweed and grey rocks',
  river: 'a green riverbank with reeds, calm water, trees and a soft sky',
  forest: 'a lush green forest with big trees, leaves, moss and little glowing fireflies',
  grass: 'a golden savanna grassland with acacia trees and a warm sky',
  desert: 'a warm sandy desert with dunes and a cactus, clear sky',
  snow: 'a snowy arctic landscape with snow hills, ice and a soft blue sky',
};

/* ---------- 固定 seed（可重現） ---------- */
function seedOf(id, k) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (Math.abs(h) % 900000) + k * 7919;
}

/* ---------- 組 workflow ---------- */
const REF_IMAGE = 'crab.png';
function makeWorkflow(animal, seed) {
  const bg = BG[animal.loc] || BG.underwater;
  const anatomy = ANATOMY[animal.id] || `a cute ${animal.en.toLowerCase()} body with animal features`;
  const prompt = `Keep the exact same 3D rendered cartoon art style, glossy toy-like shading, soft studio lighting and children's app quality as the reference image. Replace the subject with a cute cartoon ${animal.en.toUpperCase()} character. It is an ANIMAL character with ${anatomy}; not a human, not a baby, no human skin, no clothes. Background: ${bg}. Full body centred, ultra clean high quality 3D render, kids app illustration.`;
  let neg = 'human, human baby, child, human face, human skin, person, costume, onesie, clothes, text, watermark, signature, deformed, extra limbs, blurry, low quality';
  if (animal.loc !== 'underwater' && animal.loc !== 'sea') neg += ', underwater, bubbles, seaweed, coral, blue water background';
  if (animal.loc !== 'snow') neg += ', snow';
  return {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'flux-2-klein-9b-fp8.safetensors', weight_dtype: 'default' } },
    '2': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_3_8b_fp8mixed.safetensors', device: 'default', type: 'flux2' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'flux2-vae.safetensors' } },
    '4': { class_type: 'LoadImage', inputs: { image: REF_IMAGE } },
    '5': { class_type: 'ImageScaleToTotalPixels', inputs: { image: ['4', 0], megapixels: 1, resolution_steps: 1, upscale_method: 'lanczos' } },
    '6': { class_type: 'VAEEncode', inputs: { pixels: ['5', 0], vae: ['3', 0] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: prompt } },
    '8': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 0], text: neg } },
    '9': { class_type: 'ReferenceLatent', inputs: { conditioning: ['7', 0], latent: ['6', 0] } },
    '10': { class_type: 'EmptyFlux2LatentImage', inputs: { batch_size: 1, height: 1024, width: 832 } },
    '11': {
      class_type: 'KSampler',
      inputs: {
        cfg: 1, denoise: 1, latent_image: ['10', 0], model: ['1', 0], negative: ['8', 0], positive: ['9', 0],
        sampler_name: 'euler', scheduler: 'simple', seed, steps: 8,
      },
    },
    '12': { class_type: 'VAEDecode', inputs: { samples: ['11', 0], vae: ['3', 0] } },
    '13': { class_type: 'SaveImage', inputs: { filename_prefix: `p4animals/${animal.id}_${seed}`, images: ['12', 0] } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function submit(wf) {
  const res = await fetch(`${COMFY}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: wf, client_id: 'p4gen' }),
  });
  if (!res.ok) throw new Error('submit ' + res.status + ' ' + (await res.text()).slice(0, 300));
  const json = await res.json();
  return json.prompt_id;
}
async function waitDone(id, timeoutMs = 180000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const res = await fetch(`${COMFY}/history/${id}`);
    if (res.ok) {
      const json = await res.json();
      const item = json[id];
      if (item && item.status && item.status.completed) {
        const imgs = [];
        for (const out of Object.values(item.outputs || {})) {
          for (const im of out.images || []) imgs.push(im);
        }
        return imgs;
      }
      if (item && item.status && item.status.status_str === 'error') throw new Error('comfy error');
    }
    await sleep(900);
  }
  throw new Error('timeout waiting ' + id);
}

/* ---------- 任務清單 ---------- */
const jobs = [];
for (const a of ANIMALS) {
  if (ONLY_SET && !ONLY_SET.has(a.id)) continue;
  for (let k = 1; k <= SEEDS; k++) {
    const seed = seedOf(a.id, k);
    const dest = path.join(OUT, `${a.id}_s${k}.png`);
    if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 10000) continue;
    jobs.push({ animal: a, seed, k, dest });
  }
}
console.log(`[p4] animals=${ANIMALS.length} seeds=${SEEDS} pending=${jobs.length} conc=${CONC}`);

let ok = 0, fail = 0, i = 0;
const t0 = Date.now();
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++];
    try {
      const wf = makeWorkflow(job.animal, job.seed);
      const pid = await submit(wf);
      const imgs = await waitDone(pid);
      if (!imgs.length) throw new Error('no image');
      const src = path.join(COMFY_OUT, imgs[0].subfolder || '', imgs[0].filename);
      if (!fs.existsSync(src)) throw new Error('missing file ' + src);
      fs.copyFileSync(src, job.dest);
      ok++;
      console.log(`[p4] ${ok}/${jobs.length} ${job.animal.id} s${job.k} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    } catch (e) {
      fail++;
      console.warn(`[fail] ${job.animal.id} s${job.k}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`[p4] done ok=${ok} fail=${fail} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
