import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'assets/css/games.css');
let t = fs.readFileSync(f, 'utf8');
t = t.split('/* ====== 探險 v2 ====== */')[0];
t += `
/* ====== 探險 v2：位（wrapper）＋影子／遮擋物／水面 ====== */
.scene-shadows, .scene-fg { position: absolute; inset: 0; }
.scene-shadows { z-index: 5; }
.scene-fg { z-index: 6; pointer-events: none; }

.spot-wrap {
  position: absolute;
  width: var(--sz, 140px);
  height: var(--sz, 140px);
  transform: translate(-50%, -50%);
  z-index: 4;
}
.spot-wrap .shadow-spot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 0;
  background: none;
  border: 0;
  pointer-events: auto;
  transform: translateY(0) rotate(var(--rot, 0deg));
  transition: transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.45s ease, filter 0.45s ease;
  -webkit-tap-highlight-color: transparent;
}
.spot-wrap .shadow-spot .sp-art {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.spot-wrap .shadow-spot .sp-art svg {
  width: 100%;
  height: 100%;
  filter: brightness(0) saturate(0) opacity(0.82) drop-shadow(0 10px 12px rgba(0, 0, 0, 0.35));
}
.spot-wrap .shadow-spot::before {
  content: "";
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  border: 4px dashed var(--rar, #7ed957);
  opacity: 0.85;
  animation: spinSlow 9s linear infinite;
}
.spot-wrap.r1 { --rar: #7ed957; }
.spot-wrap.r2 { --rar: #4aa8ff; }
.spot-wrap.r3 { --rar: #c36bff; }
.spot-wrap.r4 { --rar: #ffb300; }
.spot-wrap.r4 .shadow-spot::before {
  animation-duration: 4s;
  border-width: 5px;
  box-shadow: 0 0 24px 6px rgba(255, 179, 0, 0.5);
}
.spot-wrap .hidden-under { opacity: 1; }
.spot-wrap .sp-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.spot-wrap .sp-badge.new { background: var(--rose); }

/* 浮水模式（海面／河流） */
.spot-wrap.mode-float .shadow-spot {
  transform: translateY(42%) scale(0.9) rotate(var(--rot, 0deg));
  opacity: 0.32;
  filter: blur(1.2px);
}
.spot-wrap.mode-float.peeking .shadow-spot {
  transform: translateY(-16%) scale(1.02) rotate(var(--rot, 0deg));
  opacity: 1;
  filter: none;
}
.spot-wrap.mode-float.peeking .shadow-spot::before { opacity: 1; }
.spot-wrap .ripple {
  position: absolute;
  left: 50%;
  top: 74%;
  width: 84%;
  height: 22%;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.55);
  opacity: 0;
  pointer-events: none;
}
.spot-wrap.mode-float.peeking .ripple { animation: rippleOut 1.8s ease-out infinite; }
@keyframes rippleOut {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0 }
  25% { opacity: 0.8 }
  100% { transform: translateX(-50%) scale(1.25); opacity: 0 }
}
.water-front {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--water-line, 46%);
  bottom: 0;
  background: linear-gradient(180deg, rgba(120, 220, 255, 0.42) 0%, rgba(30, 130, 190, 0.30) 40%, rgba(10, 90, 140, 0.18) 100%);
  border-top: 3px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
}
.water-front::before {
  content: "";
  position: absolute;
  left: -10%;
  right: -10%;
  top: -8px;
  height: 18px;
  background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.55) 0 22px, transparent 22px 48px);
  border-radius: 50%;
  animation: waveMove 4s linear infinite;
}
.theme-river .scene-fg { --water-line: 52%; }
.theme-sea .scene-fg { --water-line: 44%; }

/* 探頭模式（海底／森林／草原） */
.spot-wrap.mode-peek .shadow-spot {
  transform: translateY(30%) scale(0.97) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek.peeking .shadow-spot {
  transform: translateY(-18%) scale(1.04) rotate(var(--rot, 0deg));
}
.spot-wrap.mode-peek .occluder {
  position: absolute;
  left: 50%;
  bottom: -8%;
  width: 128%;
  height: 64%;
  transform: translateX(-50%);
  pointer-events: none;
  filter: drop-shadow(0 -3px 6px rgba(0, 0, 0, 0.18));
}
.spot-wrap.mode-peek .occluder svg { width: 100%; height: 100%; display: block; }

.spot-wrap.shake { animation: spotShake 0.42s; }
@keyframes spotShake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0) }
  20% { transform: translate(-52%, -50%) rotate(-3deg) }
  40% { transform: translate(-48%, -50%) rotate(3deg) }
  60% { transform: translate(-51%, -50%) rotate(-2deg) }
  80% { transform: translate(-49%, -50%) rotate(2deg) }
}
.spot-wrap.found { animation: foundPop2 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; pointer-events: none; }
@keyframes foundPop2 {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1 }
  45% { transform: translate(-50%, -50%) scale(1.22); opacity: 1 }
  100% { transform: translate(-50%, -56%) scale(0.15); opacity: 0 }
}

/* 已餵過嘅動物 */
.shadow-spot.visited {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
  animation: visitedFloat 3.2s ease-in-out infinite;
  display: grid;
  place-items: center;
}
.shadow-spot.visited::before { display: none; }
.shadow-spot.visited .sp-art svg { filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.28)); }
@keyframes visitedFloat {
  0%, 100% { transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) translateY(0) }
  50% { transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) translateY(-8px) }
}
.shadow-spot .visited-badge {
  background: rgba(255, 255, 255, 0.92) !important;
  color: #b03a63;
  font-size: 12.5px;
  bottom: -10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
}
`;
fs.writeFileSync(f, t);
console.log('explore v2 css written', t.length);
