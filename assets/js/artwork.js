/* =========================================================================
 *  artwork.js — 全部圖案都係手寫 SVG（向量、可做剪影、無外部檔案）
 *  Art.animal(id, {shadow}) / Art.item(item) / Art.locIcon(id)
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;

  const S = { shadow: false };
  const st = () => S.shadow;

  /* ---- 顏色工具 ---- */
  function shade(hex, amt) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(C.clamp(r + amt * 255, 0, 255));
    g = Math.round(C.clamp(g + amt * 255, 0, 255));
    b = Math.round(C.clamp(b + amt * 255, 0, 255));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  const SH = '#2b2438';             // 剪影色
  const ink = '#3a2f4a';
  const pink = '#ff9ab8';

  /* ---- 基本形 ---- */
  const g = (parts, attrs) => `<g ${attrs || ''}>${parts}</g>`;
  function ellipse(cx, cy, rx, ry, fill, extra) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra || ''}/>`;
  }
  function circle(cx, cy, r, fill, extra) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra || ''}/>`;
  }
  function rrect(x, y, w, h, r, fill, extra) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" ${extra || ''}/>`;
  }
  function path(d, fill, extra) {
    return `<path d="${d}" fill="${fill}" ${extra || ''}/>`;
  }
  function stroke(d, color, w, extra) {
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}/>`;
  }

  /* ---- 五官 ---- */
  function eyes(cx, cy, gap, r, opt) {
    opt = opt || {};
    if (st()) return '';
    if (opt.closed) {
      const d = (x) => `M${x - r} ${cy} q${r} ${r * 0.95} ${r * 2} 0`;
      return stroke(d(cx - gap - r), ink, r * 0.62) + stroke(d(cx + gap - r), ink, r * 0.62);
    }
    const white = opt.white || '#ffffff';
    const pupil = opt.pupil || ink;
    const out = [];
    for (const sgn of [-1, 1]) {
      const x = cx + sgn * gap;
      out.push(circle(x, cy, r, white, `stroke="${shade(ink, 0.15)}" stroke-width="${r * 0.14}"`));
      out.push(circle(x + (opt.look || 0), cy + r * 0.12, r * 0.56, pupil));
      out.push(circle(x - r * 0.24, cy - r * 0.26, r * 0.22, '#fff'));
    }
    return out.join('');
  }
  function cheeks(cx, cy, gap, r, color) {
    if (st()) return '';
    return circle(cx - gap, cy, r, color || pink, 'opacity=".55"') + circle(cx + gap, cy, r, color || pink, 'opacity=".55"');
  }
  function nose(cx, cy, s, color) {
    if (st()) return '';
    return path(`M${cx - s} ${cy} Q${cx} ${cy} ${cx} ${cy + s * 1.15} Q${cx} ${cy} ${cx + s} ${cy} Q${cx} ${cy - s * 0.35} ${cx - s} ${cy} Z`, color || '#4a3550');
  }
  function mouthSmile(cx, cy, w, color, wd) {
    if (st()) return '';
    return stroke(`M${cx - w} ${cy} q${w} ${w * 0.95} ${w * 2} 0`, color || ink, wd || 3.4);
  }
  function mouthW(cx, cy, w, color) {
    if (st()) return '';
    return stroke(`M${cx - w} ${cy} q${w / 2} ${w * 0.75} ${w} 0 q${w / 2} ${w * 0.75} ${w} 0`, color || ink, 3.2);
  }
  function face(cx, cy, opt) {
    opt = opt || {};
    const r = opt.r || 8;
    const gap = opt.gap != null ? opt.gap : r * 2.1;
    let out = eyes(cx, cy, gap, r, opt);
    out += cheeks(cx, cy + (opt.blushY || r * 1.55), gap + r * 1.05, r * 0.62);
    if (opt.mouth !== false) {
      out += opt.mouthStyle === 'w' ? mouthW(cx, cy + (opt.mouthY || r * 2.1), r * 0.55) : mouthSmile(cx, cy + (opt.mouthY || r * 2.0), r * 0.62);
    }
    return out;
  }

  /* ---- 身體 ---- */
  function blob(cx, cy, rx, ry, fill, extra) {
    return ellipse(cx, cy, rx, ry, fill, extra);
  }
  function legs(xs, y, w, h, fill) {
    return xs.map((x) => rrect(x - w / 2, y, w, h, w / 2, fill)).join('');
  }
  function paw(x, y, r, fill) {
    return circle(x, y, r, fill);
  }
  function clipTo(id, content, shapeMarkup) {
    return `<defs><clipPath id="${id}">${shapeMarkup}</clipPath></defs><g clip-path="url(#${id})">${content}</g>`;
  }
  let clipSeq = 0;
  function uidp() { return 'c' + (++clipSeq); }

  /* ---- 耳朵 ---- */
  function earsRound(x1, y1, x2, y2, r, fill) {
    return circle(x1, y1, r, fill) + circle(x2, y2, r, fill);
  }
  function earsTri(x1, y1, x2, y2, r, fill, innerColor) {
    const one = (bx, by, dir) => {
      const d = `M${bx - r * 0.9} ${by + r} L${bx + dir * r * 0.25} ${by - r * 0.95} L${bx + r} ${by + r} Z`;
      let s = path(d, fill, 'stroke-linejoin="round"');
      if (innerColor && !st()) s += path(`M${bx - r * 0.4} ${by + r * 0.65} L${bx + dir * r * 0.2} ${by - r * 0.3} L${bx + dir * r * 0.6} ${by + r * 0.65} Z`, innerColor);
      return s;
    };
    return one(x1, y1, -1) + one(x2, y2, 1);
  }
  function earsBunny(x1, y1, x2, y2, fill, inner) {
    const one = (x, y, rot) => {
      let s = `<g transform="translate(${x},${y}) rotate(${rot})">`;
      s += ellipse(0, -18, 9, 24, fill);
      if (!st() && inner) s += ellipse(0, -18, 5, 16, inner);
      return s + '</g>';
    };
    return one(x1, y1, -8) + one(x2, y2, 8);
  }
  function earsBear(x1, y1, x2, y2, r, fill, inner) {
    let s = circle(x1, y1, r, fill) + circle(x2, y2, r, fill);
    if (!st() && inner) s += circle(x1, y1, r * 0.55, inner) + circle(x2, y2, r * 0.55, inner);
    return s;
  }
  function earsElephant(x1, y1, x2, y2, rx, ry, fill) {
    return `<g><ellipse cx="${x1}" cy="${y1}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(-18 ${x1} ${y1})"/><ellipse cx="${x2}" cy="${y2}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(18 ${x2} ${y2})"/></g>`;
  }
  function earsFeather(x1, y1, x2, y2, fill) {
    const one = (x, y, dir) => path(`M${x} ${y + 10} q${dir * 14} -6 ${dir * 10} -20 q${dir * -6} 6 ${dir * -10} 20 Z`, fill);
    return one(x1, y1, -1) + one(x2, y2, 1);
  }

  /* ---- 尾巴 ---- */
  function tailCurl(x, y, len, dir, color, w) {
    const d = `M${x} ${y} q${dir * len * 0.6} ${-len * 0.1} ${dir * len * 0.55} ${-len * 0.55} q${dir * -len * 0.02} ${-len * 0.28} ${dir * -len * 0.3} ${-len * 0.22}`;
    return stroke(d, color, w || 9);
  }
  function tailThick(x, y, len, dir, fill) {
    const d = `M${x} ${y} q${dir * len * 0.5} ${-len * 0.2} ${dir * len * 0.85} ${-len * 0.62} q${dir * len * 0.18} ${-len * 0.3} ${dir * -len * 0.05} ${-len * 0.5} q${dir * -len * 0.05} ${len * 0.22} ${dir * -len * 0.1} ${len * 0.42} q${dir * -len * 0.2} ${len * 0.15} ${dir * -len * 0.7} ${len * 0.7} Z`;
    return path(d, fill);
  }

  /* ---- 紋理 ---- */
  function stripesV(id, bodyMarkup, color, n, ry) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 54 + i * 13;
      s += path(`M${x} 60 q6 40 -2 100 l10 0 q7 -50 1 -100 Z`, color, 'opacity=".92"');
    }
    return clipTo(id, s, bodyMarkup);
  }
  function spots(id, bodyMarkup, color, list) {
    return clipTo(id, list.map(([x, y, r]) => circle(x, y, r, color)).join(''), bodyMarkup);
  }
  function bellyPatch(id, bodyMarkup, color, cx, cy, rx, ry) {
    return clipTo(id, ellipse(cx, cy, rx, ry, color), bodyMarkup);
  }

  /* ---- 陰影／地面 ---- */
  function ground(cx, cy, rx, ry) {
    if (st()) return '';
    return ellipse(cx, cy, rx, ry, 'rgba(60,40,90,.14)');
  }

  /* =======================================================================
   *  動物畫法
   *  每隻都係 (helpers) => svg 內容，畫布 200x200，角色置中
   * ======================================================================= */
  const ANIMALS = {
    /* ------------------------------ 沙灘 ------------------------------ */
    crab() {
      const b = '#ff6b4a', bd = '#e04e2f';
      let s = ground(100, 178, 62, 10);
      // 八隻腳
      for (const sgn of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          const yy = 128 + i * 9;
          s += stroke(`M${100 + sgn * 34} ${yy} q${sgn * 16} ${4 + i * 3} ${sgn * 26} ${14 + i * 3}`, bd, 7);
        }
      }
      // 大鉗
      s += `<g><ellipse cx="52" cy="112" rx="17" ry="12" fill="${b}" transform="rotate(-25 52 112)"/><path d="M40 104 q-8 -12 6 -16 q8 10 14 12 Z" fill="${bd}"/><path d="M44 122 q-10 8 4 12 q6 -8 14 -12 Z" fill="${bd}"/></g>`;
      s += `<g><ellipse cx="148" cy="112" rx="17" ry="12" fill="${b}" transform="rotate(25 148 112)"/><path d="M160 104 q8 -12 -6 -16 q-8 10 -14 12 Z" fill="${bd}"/><path d="M156 122 q10 8 -4 12 q-6 -8 -14 -12 Z" fill="${bd}"/></g>`;
      // 身體
      s += ellipse(100, 122, 42, 32, b);
      s += ellipse(100, 128, 26, 18, st() ? b : shade(b, 0.12));
      // 眼睛（蟹眼有柄）
      if (!st()) {
        s += stroke('M84 98 L82 84', bd, 6) + stroke('M116 98 L118 84', bd, 6);
        s += circle(82, 82, 9, '#fff') + circle(118, 82, 9, '#fff');
        s += circle(82, 83, 5, ink) + circle(118, 83, 5, ink);
        s += circle(80, 80, 2, '#fff') + circle(116, 80, 2, '#fff');
        s += mouthSmile(100, 138, 10, '#8a2c1a');
      }
      return s;
    },
    starfish() {
      const c = '#ff9f1c', c2 = '#ffbf69';
      let s = ground(100, 180, 58, 9);
      const star = (r1, r2, fill) => {
        let d = '';
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const r = i % 2 === 0 ? r1 : r2;
          d += (i ? 'L' : 'M') + (100 + Math.cos(a) * r).toFixed(1) + ' ' + (108 + Math.sin(a) * r).toFixed(1);
        }
        return path(d + ' Z', fill, 'stroke-linejoin="round"');
      };
      s += star(58, 24, c);
      s += star(46, 19, c2);
      if (!st()) {
        s += circle(100, 108, 6, shade(c, -0.15));
        s += face(100, 106, { r: 6.5, gap: 15, blushY: 16 });
        s += circle(74, 108, 3.4, '#ffd166') + circle(126, 108, 3.4, '#ffd166') + circle(100, 84, 3.4, '#ffd166');
      }
      return s;
    },
    seagull() {
      const body = '#f6f7fb', wing = '#d7dbe7', beak = '#ffb703';
      let s = ground(100, 180, 50, 9);
      s += legs([88, 112], 156, 7, 22, beak);
      s += ellipse(100, 128, 44, 34, body);
      s += path('M62 134 q14 -26 40 -22 q-6 24 -34 30 Z', wing);
      s += path('M138 134 q-14 -26 -40 -22 q6 24 34 30 Z', shade(wing, -0.05));
      s += circle(100, 84, 30, body);
      s += path('M100 58 q10 -12 18 -4 q-6 8 -18 8 Z', '#e8ebf3');
      s += path('M128 84 L146 90 L128 96 Z', beak);
      if (!st()) {
        s += face(100, 80, { r: 8, gap: 16, mouthY: 20 });
        s += circle(100, 106, 4, '#ffd166', 'opacity=".8"');
      }
      return s;
    },
    turtle() {
      const skin = '#8ac926', shell = '#3d6b35', shell2 = '#5b9450';
      let s = ground(100, 182, 64, 9);
      s += ellipse(62, 132, 18, 12, skin);
      s += ellipse(138, 132, 18, 12, skin);
      s += circle(100, 74, 24, skin); // 頭（向上望）
      s += circle(74, 158, 13, skin) + circle(126, 158, 13, skin);
      // 龜殼
      s += ellipse(100, 126, 52, 44, shell);
      s += ellipse(100, 126, 44, 36, shell2);
      if (!st()) {
        s += stroke('M100 90 L100 162 M64 108 L136 144 M64 144 L136 108', shade(shell, 0.12), 3);
      }
      s += face(100, 72, { r: 7, gap: 14, mouthY: 17 });
      return s;
    },
    fiddlercrab() {
      const b = '#ffb703', bd = '#e09400';
      let s = ground(100, 176, 56, 9);
      for (const sgn of [-1, 1]) {
        for (let i = 0; i < 3; i++) s += stroke(`M${100 + sgn * 32} ${136 + i * 8} q${sgn * 14} 4 ${sgn * 24} 12`, bd, 6);
      }
      // 大鉗（一邊特別大）
      s += `<g transform="translate(150,120) rotate(20)"><ellipse rx="20" ry="14" fill="${b}"/><path d="M-12 -8 q-10 -14 6 -18 q10 12 16 14 Z" fill="${bd}"/><path d="M-8 12 q-12 10 6 14 q8 -10 16 -14 Z" fill="${bd}"/></g>`;
      s += `<g transform="translate(52,124) rotate(-16)"><ellipse rx="12" ry="9" fill="${b}"/><path d="M-8 -5 q-6 -9 4 -12 q6 8 10 9 Z" fill="${bd}"/></g>`;
      s += ellipse(100, 132, 38, 30, b);
      if (!st()) {
        s += stroke('M86 108 L84 94', bd, 5) + stroke('M114 108 L116 94', bd, 5);
        s += circle(84, 92, 8, '#fff') + circle(116, 92, 8, '#fff');
        s += circle(84, 93, 4.5, ink) + circle(116, 93, 4.5, ink);
        s += mouthSmile(100, 146, 9, '#8a5a00');
      }
      return s;
    },

    /* ------------------------------ 海面 ------------------------------ */
    dolphin() {
      const c = '#4aa8e0', c2 = '#b8e0f5';
      let s = ground(100, 184, 56, 8);
      // 尾鰭、身體（豎起身）
      s += path('M100 152 q-30 10 -34 34 q20 -6 34 -14 q14 8 34 14 q-4 -24 -34 -34 Z', c);
      s += path('M100 60 q40 18 40 62 q0 34 -40 52 q-40 -18 -40 -52 q0 -44 40 -62 Z', c);
      s += path('M100 78 q26 16 24 48 q-2 26 -24 40 q-22 -14 -24 -40 q-2 -32 24 -48 Z', c2);
      s += path('M100 60 q-6 -18 4 -30 q10 12 8 32 Z', c);
      s += path('M138 104 q16 4 18 18 q-16 2 -20 -10 Z', shade(c, -0.1));
      s += path('M62 96 q-14 2 -18 14 q14 4 20 -6 Z', shade(c, -0.1));
      if (!st()) {
        s += circle(88, 108, 7, '#fff') + circle(88, 109, 4, ink) + circle(150, 0, 0, '#fff');
        s += stroke('M96 138 q8 6 16 0', ink, 3);
        s += circle(84, 118, 3, 'rgba(255,255,255,.5)');
      }
      return s;
    },
    whale() {
      const c = '#3a86ff', c2 = '#a8c8ff';
      let s = ground(100, 184, 66, 8);
      s += path('M100 168 q-52 6 -58 -34 q-4 -46 58 -46 q62 0 58 46 q-6 40 -58 34 Z', c);
      s += ellipse(100, 146, 44, 26, c2);
      // 尾
      s += path('M100 92 q-22 -18 -38 -10 q10 -22 38 -6 q28 -16 38 6 q-16 -8 -38 10 Z', c);
      // 水柱
      if (!st()) {
        s += stroke('M100 74 q-4 -18 0 -26', '#8ed0ff', 7) + circle(92, 46, 5, '#8ed0ff') + circle(108, 42, 4, '#8ed0ff') + circle(100, 36, 3, '#8ed0ff');
      }
      s += face(100, 132, { r: 8.5, gap: 20, mouthY: 22, mouthStyle: 'w' });
      return s;
    },
    seal() {
      const c = '#9aa4b8', c2 = '#c8d0de';
      let s = ground(100, 182, 58, 9);
      s += ellipse(100, 136, 48, 40, c);
      s += ellipse(100, 150, 32, 24, c2);
      s += circle(100, 84, 32, c);
      s += path('M70 100 q-14 14 -6 26 q14 -2 18 -16 Z', shade(c, -0.08));
      s += path('M130 100 q14 14 6 26 q-14 -2 -18 -16 Z', shade(c, -0.08));
      s += path('M100 116 l-6 8 l12 0 Z', shade(c, -0.18));
      if (!st()) {
        s += circle(100, 104, 4, '#3a2f4a');
        s += stroke('M100 108 l0 8', ink, 2.6);
        s += circle(80, 128, 5, '#fff') + circle(80, 129, 3, ink) + circle(120, 129, 3, ink);
        // 小魚
        s += `<g transform="translate(150,150) scale(.7)"><path d="M0 0 q12 -10 24 0 q-12 10 -24 0 Z" fill="#ffb703"/><path d="M0 0 l-8 -6 l0 12 Z" fill="#ffb703"/></g>`;
      }
      return s;
    },
    flyingfish() {
      const c = '#6ec6ff', fin = '#b8e6ff', fin2 = '#ffd166';
      let s = ground(0, 0, 0, 0);
      let d = '';
      for (let i = 0; i < 3; i++) d += stroke(`M${30 + i * 8} ${150 - i * 22} q30 -14 60 -6`, '#cfeaff', 3, 'opacity="."'.replace('.', '') + '');
      s += stroke('M18 158 q34 -20 70 -10', '#d9f0ff', 4) + stroke('M24 138 q28 -18 60 -10', '#d9f0ff', 3);
      // 翅膀
      s += path('M96 110 q-30 -34 -62 -24 q14 30 58 40 Z', fin);
      s += path('M100 110 q30 -34 62 -24 q-14 30 -58 40 Z', fin);
      // 身體
      s += path('M100 92 q30 8 34 40 q2 22 -34 28 q-36 -6 -34 -28 q4 -32 34 -40 Z', c);
      s += path('M100 100 q18 6 20 28 q-8 16 -20 18 q-12 -2 -20 -18 q2 -22 20 -28 Z', fin2);
      s += path('M100 92 q0 -10 8 -14 q4 8 0 14 Z', c);
      s += path('M96 160 q-4 12 -14 16 q-2 -12 8 -18 Z', shade(c, -0.15));
      if (!st()) {
        s += circle(112, 112, 6.5, '#fff') + circle(113, 113, 4, ink) + circle(135, 126, 2.5, '#fff');
        s += mouthSmile(120, 130, 6, ink, 2.8);
      }
      return s;
    },

    /* ------------------------------ 海底 ------------------------------ */
    octopus() {
      const c = '#c77dff', c2 = '#e0b0ff';
      let s = ground(100, 184, 60, 8);
      // 八爪
      for (let i = 0; i < 8; i++) {
        const x = 58 + i * 12;
        s += stroke(`M${x} 128 q${(x - 100) * 0.5} 30 ${(x - 100) * 0.8} 46`, i % 2 ? c2 : c, 9);
      }
      s += path('M100 52 q46 0 48 46 q2 30 -48 36 q-50 -6 -48 -36 q2 -46 48 -46 Z', c);
      s += face(100, 96, { r: 9, gap: 21, mouthStyle: 'w', mouthY: 24 });
      if (!st()) {
        s += circle(72, 74, 5, '#fff', 'opacity=".5"') + circle(86, 62, 3, '#fff', 'opacity=".4"');
      }
      return s;
    },
    clownfish() {
      const c = '#ff8c42', c2 = '#ffb703';
      let s = ground(100, 182, 56, 8);
      s += path('M58 118 q10 -34 44 -34 q30 0 40 30 q10 30 -14 40 q-30 12 -58 -4 q-18 -12 -12 -32 Z', c);
      s += path('M48 116 q-16 -18 -26 -10 q6 20 22 30 q-14 12 -4 22 q16 -6 26 -20 Z', c2);
      s += path('M100 88 q8 30 0 66 l14 0 q8 -34 0 -66 Z', '#fff', 'opacity=".95"');
      s += path('M76 90 q6 28 0 62 l10 0 q6 -32 0 -62 Z', '#fff', 'opacity=".95"');
      s += path('M140 118 q14 -8 22 4 q-10 8 -20 4 Z', c2);
      if (!st()) {
        s += circle(126, 112, 8, '#fff') + circle(128, 113, 5, ink) + circle(126, 110, 2, '#fff');
        s += mouthSmile(138, 128, 6, ink, 2.6);
      }
      return s;
    },
    jellyfish() {
      const c = '#a0e7ff', c2 = '#d8f6ff';
      let s = ground(100, 184, 50, 8);
      // 觸手
      for (let i = 0; i < 6; i++) {
        const x = 66 + i * 14;
        s += stroke(`M${x} 124 q${(i % 2 ? 10 : -10)} 20 0 36 q${(i % 2 ? -10 : 10)} 14 0 22`, c2, 5, 'opacity=".9"');
      }
      s += path('M100 60 q44 0 44 40 q0 24 -44 24 q-44 0 -44 -24 q0 -40 44 -40 Z', c, 'opacity=".92"');
      s += path('M100 70 q30 0 32 28 q0 16 -32 16 q-32 0 -32 -16 q0 -28 32 -28 Z', c2, 'opacity=".55"');
      s += face(100, 92, { r: 7.5, gap: 18, mouthY: 18 });
      if (!st()) {
        s += circle(74, 74, 4, '#fff', 'opacity=".7"') + circle(120, 68, 3, '#fff', 'opacity=".6"');
      }
      return s;
    },
    seahorse() {
      const c = '#ffb703', c2 = '#ffd166';
      let s = ground(100, 184, 40, 8);
      // 尾巴
      s += stroke('M100 148 q-18 10 -12 26 q6 10 18 0', c, 10);
      // 身體
      s += path('M100 62 q22 6 22 34 q0 22 -10 34 q-6 8 -12 8 q-6 0 -12 -8 q-10 -12 -10 -34 q0 -28 22 -34 Z', c);
      s += path('M100 72 q14 4 14 26 q0 18 -8 28 q-6 6 -6 6 q0 0 -6 -6 q-8 -10 -8 -28 q0 -22 14 -26 Z', c2);
      // 頭
      s += path('M100 44 q10 -12 20 -6 q12 2 8 14 q-2 8 -12 8 l-16 0 Z', c);
      s += path('M100 44 q-4 -10 6 -16 q10 4 12 14 Z', c2);
      s += path('M126 48 q12 0 12 8 q-4 4 -12 2 Z', shade(c, -0.1));
      // 背鰭
      s += path('M118 96 q12 8 10 20 q-10 -2 -14 -10 Z', c2);
      if (!st()) {
        s += circle(116, 46, 4.5, '#fff') + circle(117, 46, 3, ink);
        s += circle(106, 56, 2.6, '#e07000');
      }
      return s;
    },
    shark() {
      const c = '#90a4c0', c2 = '#d7e3f0';
      let s = ground(100, 184, 64, 8);
      s += path('M36 140 q20 -46 70 -50 q40 -4 56 26 q-10 32 -58 34 q-52 2 -68 -10 Z', c);
      s += path('M34 140 q-16 -10 -12 -26 q18 6 24 18 Z', c);
      s += path('M56 96 q10 -30 32 -20 q-6 18 -20 26 Z', c);
      s += path('M150 116 q22 -20 30 -6 q-14 16 -30 18 Z', c);
      s += path('M44 154 q22 26 56 22 q22 -2 34 -18 q-30 6 -90 -4 Z', c2);
      s += face(96, 132, { r: 7, gap: 15, mouthY: 16, mouthStyle: 'w' });
      if (!st()) {
        s += path('M108 148 l0 10 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l0 -10 Z', '#fff');
      }
      return s;
    },

    /* ------------------------------ 河流 ------------------------------ */
    duck() {
      const c = '#ffd93d', c2 = '#ffe68a', beak = '#ff9f1c';
      let s = ground(100, 180, 56, 9);
      s += legs([86, 114], 158, 8, 20, beak);
      s += ellipse(100, 132, 46, 36, c);
      s += ellipse(84, 126, 24, 20, c2);
      s += circle(100, 74, 30, c);
      s += path('M100 44 q6 -14 16 -6 q-4 10 -16 10 Z', c2);
      s += path('M128 74 q22 2 20 14 q-16 8 -24 -2 Z', beak);
      s += path('M100 74 q-4 -8 0 -14 q6 0 6 8 Z', c2);
      if (!st()) {
        s += circle(88, 70, 6, '#fff') + circle(88, 71, 3.5, ink) + circle(112, 70, 6, '#fff') + circle(112, 71, 3.5, ink);
        s += circle(80, 86, 4, '#ff8f6b', 'opacity=".5"') + circle(120, 86, 4, '#ff8f6b', 'opacity=".5"');
      }
      return s;
    },
    frog() {
      const c = '#7bc950', c2 = '#a8e063';
      let s = ground(100, 180, 56, 9);
      s += ellipse(100, 138, 46, 32, c);
      s += ellipse(100, 148, 28, 18, c2);
      s += legs([62, 138], 154, 14, 16, c);
      s += circle(72, 96, 24, c) + circle(128, 96, 24, c);
      if (!st()) {
        s += circle(72, 92, 15, '#fff') + circle(128, 92, 15, '#fff');
        s += circle(74, 94, 8, ink) + circle(126, 94, 8, ink);
        s += circle(76, 90, 3, '#fff') + circle(124, 90, 3, '#fff');
        s += mouthSmile(100, 116, 20, ink, 4);
        s += circle(56, 116, 6, pink, 'opacity=".5"') + circle(144, 116, 6, pink, 'opacity=".5"');
      }
      return s;
    },
    crocodile() {
      const c = '#4a9e5c', c2 = '#8fd18a';
      let s = ground(100, 184, 66, 8);
      // 尾
      s += path('M154 150 q26 -6 34 12 q-20 10 -36 2 Z', shade(c, -0.1));
      // 身
      s += path('M40 152 q6 -40 56 -40 q52 0 58 34 q2 16 -18 18 l-80 0 q-18 -2 -16 -12 Z', c);
      // 背鰭
      for (let i = 0; i < 5; i++) s += path(`M${78 + i * 16} 116 l6 -14 l6 14 Z`, shade(c, -0.12));
      // 肚
      s += path('M52 156 q40 12 100 0 q-6 14 -50 14 q-44 0 -50 -14 Z', c2);
      // 頭
      s += path('M22 140 q-8 -26 18 -30 q22 -4 26 18 q2 12 -10 16 q-20 4 -34 -4 Z', c);
      s += path('M16 132 q-14 4 -12 12 q10 6 18 0 Z', c);
      s += path('M30 118 q-2 -12 8 -14 q8 2 6 12 Z', c2);
      s += path('M46 112 q-2 -14 8 -14 q8 2 6 12 Z', c2);
      if (!st()) {
        s += circle(40, 126, 6, '#fff') + circle(40, 126, 3.6, ink);
        s += path('M36 146 l26 0', ink, 'stroke-width="3"');
        s += path('M18 134 q8 4 16 0', ink, 'stroke-width="2.5" fill="none"');
      }
      return s;
    },
    salmon() {
      const c = '#ff8fa3', c2 = '#ffc2d1';
      let s = ground(100, 182, 56, 8);
      s += path('M58 122 q14 -34 46 -32 q28 2 36 26 q10 26 -14 36 q-34 12 -60 -6 q-16 -10 -8 -24 Z', c);
      s += path('M46 122 q-18 -14 -30 -6 q8 18 24 26 q-10 10 -2 18 q18 -6 26 -20 Z', c2);
      s += path('M64 100 q-4 -18 8 -22 q6 12 4 20 Z', shade(c, -0.1));
      s += path('M96 92 q4 30 0 60 l46 0 q8 -34 -6 -58 Z', 'rgba(255,255,255,.35)');
      s += face(120, 122, { r: 7, gap: 14, mouthY: 16 });
      if (!st()) s += circle(72, 136, 4, '#fff', 'opacity=".6"') + circle(86, 104, 3, '#fff', 'opacity=".6"');
      return s;
    },

    /* ------------------------------ 森林 ------------------------------ */
    bear() {
      const c = '#a4703f', c2 = '#cf9a5f';
      let s = ground(100, 182, 58, 9);
      s += legs([72, 128], 146, 26, 30, c);
      s += ellipse(100, 134, 48, 40, c);
      s += ellipse(100, 146, 30, 24, c2);
      s += earsBear(66, 62, 134, 62, 17, c, shade(c, 0.12));
      s += circle(100, 88, 36, c);
      s += ellipse(100, 106, 18, 13, c2);
      s += nose(100, 100, 7);
      if (!st()) {
        s += eyes(100, 84, 15, 6.5);
        s += mouthSmile(100, 114, 8);
        s += circle(64, 102, 7, pink, 'opacity=".4"') + circle(136, 102, 7, pink, 'opacity=".4"');
      }
      return s;
    },
    fox() {
      const c = '#ff8c42', c2 = '#fff3e0', tailC = '#ffa45c';
      let s = ground(100, 182, 60, 9);
      s += path('M138 156 q30 -6 38 -34 q8 -30 -14 -40 q-20 -8 -28 12 q-6 16 8 24 q-12 8 -16 26 Z', tailC);
      if (!st()) s += path('M158 128 q16 -10 12 -28 q-3 -12 -12 -12 q-7 0 -8 9 q-2 12 8 17 q-9 8 -10 14 Z', c2);
      s += legs([74, 126], 148, 20, 28, c);
      s += ellipse(100, 134, 42, 36, c);
      s += ellipse(100, 146, 24, 20, c2);
      s += earsTri(66, 52, 134, 52, 20, c, '#5c2c10');
      s += path('M100 62 q34 4 34 30 q0 24 -34 30 q-34 -6 -34 -30 q0 -26 34 -30 Z', c);
      s += path('M100 92 q22 2 22 20 q0 12 -22 18 q-22 -6 -22 -18 q0 -18 22 -20 Z', c2);
      s += nose(100, 108, 6, '#3a2f4a');
      if (!st()) {
        s += eyes(100, 88, 13, 6);
        s += mouthSmile(100, 116, 7);
        s += circle(62, 84, 6, pink, 'opacity=".4"') + circle(138, 84, 6, pink, 'opacity=".4"');
      }
      return s;
    },
    squirrel() {
      const c = '#c98c3f', c2 = '#f2d3a6';
      let s = ground(100, 182, 54, 9);
      // 大尾巴
      s += path('M140 150 q34 -30 26 -66 q-4 -22 -24 -22 q-16 0 -18 20 q-2 22 14 30 q-14 14 -18 34 Z', c);
      if (!st()) s += path('M146 140 q24 -26 18 -54 q-2 -12 -12 -12 q-8 0 -9 12 q-2 18 9 26 q-12 12 -14 26 Z', c2);
      s += legs([80, 120], 156, 16, 22, c);
      s += ellipse(98, 136, 36, 32, c);
      s += ellipse(94, 146, 20, 18, c2);
      s += earsRound(76, 70, 120, 70, 13, c);
      s += circle(98, 92, 28, c);
      s += ellipse(98, 108, 13, 10, c2);
      s += nose(98, 103, 5);
      if (!st()) {
        s += eyes(98, 88, 12, 6);
        s += mouthW(98, 114, 5);
        s += circle(70, 100, 5, pink, 'opacity=".45"') + circle(126, 100, 5, pink, 'opacity=".45"');
        s += path('M86 118 l0 8 l-4 0 l6 6 l6 -6 l-4 0 l0 -8 Z', '#ffca3a');
      }
      return s;
    },
    owl() {
      const c = '#8d6e63', c2 = '#d7b8a3';
      let s = ground(100, 182, 52, 9);
      s += path('M100 58 q46 0 46 54 q0 56 -46 62 q-46 -6 -46 -62 q0 -54 46 -54 Z', c);
      s += path('M100 92 q30 0 30 38 q0 34 -30 40 q-30 -6 -30 -40 q0 -38 30 -38 Z', c2);
      s += path('M72 58 q-2 -22 8 -26 q8 4 6 20 Z', shade(c, -0.1));
      s += path('M128 58 q2 -22 -8 -26 q-8 4 -6 20 Z', shade(c, -0.1));
      if (!st()) {
        s += circle(80, 96, 20, c2, 'stroke="' + shade(c, -0.15) + '" stroke-width="2"');
        s += circle(120, 96, 20, c2, 'stroke="' + shade(c, -0.15) + '" stroke-width="2"');
        s += circle(80, 96, 11, '#ffd166') + circle(120, 96, 11, '#ffd166');
        s += circle(80, 96, 8, ink) + circle(120, 96, 8, ink);
        s += circle(83, 93, 3, '#fff') + circle(123, 93, 3, '#fff');
        s += path('M100 106 l-7 9 l14 0 Z', '#ff9f1c');
      }
      return s;
    },
    bee() {
      const c = '#ffd166', c2 = '#3a2f4a';
      let s = ground(100, 180, 46, 8);
      if (!st()) {
        s += ellipse(82, 84, 24, 16, '#dff6ff', 'opacity=".8" transform="rotate(-24 82 84)" stroke="#a8d8ea" stroke-width="2"');
        s += ellipse(120, 84, 24, 16, '#dff6ff', 'opacity=".8" transform="rotate(24 120 84)" stroke="#a8d8ea" stroke-width="2"');
      }
      s += ellipse(100, 126, 34, 30, c);
      s += stripesV(uidp(), ellipse(100, 126, 34, 30, c), c2, 3, 30);
      s += path('M100 152 l0 10', c2, 'stroke-width="4"');
      s += circle(100, 88, 24, c);
      s += face(100, 86, { r: 7, gap: 13, mouthY: 17 });
      if (!st()) {
        s += stroke('M94 66 q-4 -10 2 -14', c2, 3) + stroke('M106 66 q4 -10 -2 -14', c2, 3);
        s += circle(92, 50, 3, c2) + circle(110, 50, 3, c2);
      }
      return s;
    },

    /* ------------------------------ 草原 ------------------------------ */
    lion() {
      const c = '#e9a23b', c2 = '#ffd9a0', mane = '#b5651d';
      let s = ground(100, 182, 60, 9);
      // 鬃毛
      let maneD = '';
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 44, y = 92 + Math.sin(a) * 42;
        maneD += circle(x, y, 17, mane);
      }
      s += maneD;
      s += legs([74, 126], 148, 22, 28, c);
      s += ellipse(100, 136, 40, 34, c);
      s += tailThick(146, 152, 50, 1, c);
      s += circle(100, 92, 34, c);
      s += ellipse(100, 108, 18, 12, c2);
      s += nose(100, 104, 6, '#6b3a1a');
      if (!st()) {
        s += eyes(100, 88, 14, 6);
        s += mouthW(100, 114, 4.4);
        s += circle(66, 100, 6, pink, 'opacity=".4"') + circle(134, 100, 6, pink, 'opacity=".4"');
      }
      return s;
    },
    zebra() {
      const c = '#f7f7fb', c2 = '#2f2f3a';
      let s = ground(100, 184, 62, 9);
      s += rrect(66, 142, 14, 34, 7, c) + rrect(88, 146, 14, 30, 7, c) + rrect(112, 146, 14, 30, 7, c) + rrect(132, 142, 14, 34, 7, c);
      if (!st()) {
        s += rrect(66, 156, 14, 6, 3, c2) + rrect(88, 158, 14, 6, 3, c2) + rrect(112, 158, 14, 6, 3, c2) + rrect(132, 156, 14, 6, 3, c2);
        s += rrect(66, 168, 14, 8, 4, c2) + rrect(88, 170, 14, 6, 3, c2) + rrect(112, 170, 14, 6, 3, c2) + rrect(132, 168, 14, 8, 4, c2);
      }
      s += ellipse(100, 132, 46, 34, c);
      if (!st()) {
        for (let i = 0; i < 5; i++) {
          const x = 62 + i * 19;
          s += '<path d="M' + x + ' 108 q6 24 0 48 l8 0 q6 -24 0 -48 Z" fill="' + c2 + '"/>';
        }
      }
      s += path('M104 106 q-6 -30 8 -40 l22 6 q0 20 12 32 Z', c);
      if (!st()) {
        for (let i = 0; i < 3; i++) {
          s += '<path d="M' + (106 + i * 8) + ' ' + (96 - i * 8) + ' q8 6 6 14 l6 0 q2 -10 -4 -18 Z" fill="' + c2 + '"/>';
        }
        for (let i = 0; i < 4; i++) s += '<path d="M' + (104 + i * 5) + ' ' + (104 - i * 12) + ' q6 -10 12 -2 q-2 8 -8 8 Z" fill="' + c2 + '"/>';
      }
      s += ellipse(126, 74, 24, 18, c, 'transform="rotate(-8 126 74)"');
      s += path('M144 62 q4 -18 12 -12 q2 10 -6 16 Z', c);
      if (!st()) {
        s += path('M150 52 q4 -10 8 -8 q0 8 -4 10 Z', c2);
        s += path('M144 66 q-2 -16 6 -18 q4 8 2 18 Z', c);
      }
      s += face(126, 76, { r: 6, gap: 12, mouthY: 14 });
      return s;
    },
    giraffe() {
      const c = '#ffca3a', c2 = '#e8a33d';
      let s = ground(100, 184, 58, 9);
      s += legs([74, 126], 148, 20, 30, c);
      s += ellipse(100, 140, 40, 32, c);
      s += spots(uidp(), ellipse(100, 140, 40, 32, c), c2, [[78, 132, 7], [100, 124, 8], [122, 134, 7], [92, 150, 6], [114, 152, 6]]);
      // 長頸
      s += path('M104 120 q-8 -30 -6 -54 l22 0 q2 30 10 54 Z', c);
      s += spots(uidp(), path('M104 120 q-8 -30 -6 -54 l22 0 q2 30 10 54 Z', c), c2, [[106, 108, 6], [108, 86, 6], [110, 68, 5]]);
      s += path('M98 68 q22 -10 34 4 q10 12 -4 20 q-18 8 -30 -6 Z', c);
      s += path('M128 60 q2 -10 10 -8 q2 6 -6 10 Z', c2);
      s += path('M100 52 l-2 -14 l6 2 l2 12 Z', c2);
      s += path('M112 48 l-2 -14 l6 2 l2 12 Z', c2);
      s += face(116, 76, { r: 6, gap: 11, mouthY: 14 });
      if (!st()) {
        s += ellipse(136, 70, 10, 8, c2) + circle(140, 70, 2.5, ink);
      }
      return s;
    },
    elephant() {
      const c = '#a9b4c9', c2 = '#c9d2e2';
      let s = ground(100, 184, 62, 9);
      s += legs([72, 128], 148, 26, 32, c);
      s += ellipse(100, 136, 48, 40, c);
      s += earsElephant(62, 92, 138, 92, 20, 30, shade(c, -0.04));
      s += circle(100, 92, 32, c);
      // 象鼻
      s += path('M100 106 q-4 26 6 40 q8 12 0 18 q-10 4 -14 -8 q-8 -18 -4 -44 Z', c2);
      s += path('M92 158 q2 8 10 8 q6 -2 2 -8 Z', c2);
      if (!st()) {
        s += eyes(100, 86, 14, 6);
        s += circle(66, 118, 7, pink, 'opacity=".35"') + circle(134, 118, 7, pink, 'opacity=".35"');
        // 象牙
        s += path('M88 118 q-8 12 -2 20 q6 -6 8 -16 Z', '#fff8e7') + path('M112 118 q8 12 2 20 q-6 -6 -8 -16 Z', '#fff8e7');
      }
      return s;
    },
    monkey() {
      const c = '#a9713f', c2 = '#e8c39e';
      let s = ground(100, 182, 54, 9);
      s += tailCurl(138, 152, 46, 1, c, 9);
      s += legs([78, 122], 152, 18, 24, c);
      s += ellipse(100, 138, 38, 32, c);
      s += ellipse(100, 148, 24, 18, c2);
      s += earsRound(64, 88, 136, 88, 16, c);
      if (!st()) s += circle(64, 88, 9, c2) + circle(136, 88, 9, c2);
      s += circle(100, 90, 32, c);
      s += ellipse(100, 98, 22, 20, c2);
      s += face(100, 90, { r: 7, gap: 12, mouthY: 18 });
      s += nose(100, 100, 4, '#6b3a1a');
      return s;
    },

    /* ------------------------------ 沙漠 ------------------------------ */
    camel() {
      const c = '#d9a066', c2 = '#f0cfa8';
      let s = ground(100, 184, 64, 9);
      s += legs([72, 88, 112, 128], 148, 14, 32, c);
      s += path('M46 150 q-4 -34 22 -40 q20 -4 34 4 q14 -12 34 -4 q26 6 22 40 Z', c);
      s += path('M52 138 q4 -20 18 -22 q12 -2 20 6 q10 -10 24 -6 q16 4 20 22 Z', c2);
      // 頸＋頭
      s += path('M60 122 q-18 -6 -20 -30 q0 -12 10 -12 q10 0 10 12 q0 14 18 18 Z', c);
      s += path('M34 84 q14 -10 26 0 q10 8 0 16 q-14 8 -26 0 Z', c);
      s += path('M38 82 q-2 -10 6 -10 q6 2 4 10 Z', c);
      s += face(46, 88, { r: 5.5, gap: 10, mouthY: 12 });
      if (!st()) s += path('M60 112 q4 10 12 12 l-2 6 q-12 -2 -18 -14 Z', c2);
      return s;
    },
    fennec() {
      const c = '#e8c39e', c2 = '#fff6ea';
      let s = ground(100, 182, 52, 9);
      s += path('M140 160 q24 -4 28 -26 q4 -20 -12 -26 q-14 -4 -18 10 q-3 12 7 17 q-8 9 -11 25 Z', c);
      if (!st()) s += path('M156 142 q10 -8 7 -20 q-2 -8 -9 -8 q-5 0 -6 6 q-1 9 6 13 q-6 7 -7 12 Z', c2);
      s += legs([82, 118], 158, 16, 22, c);
      s += ellipse(100, 144, 32, 28, c);
      s += earsTri(70, 62, 130, 62, 30, c, '#ffd6e0');
      // 超長耳
      s += `<g transform="rotate(-16 70 62)">${ellipse(70, 52, 9, 26, c)}${st() ? '' : ellipse(70, 54, 5, 18, '#ffd6e0')}</g>`;
      s += `<g transform="rotate(16 130 62)">${ellipse(130, 52, 9, 26, c)}${st() ? '' : ellipse(130, 54, 5, 18, '#ffd6e0')}</g>`;
      s += circle(100, 96, 28, c);
      s += ellipse(100, 108, 15, 11, c2);
      s += nose(100, 104, 5, '#3a2f4a');
      if (!st()) {
        s += eyes(100, 92, 12, 6.5);
        s += mouthSmile(100, 114, 6);
      }
      return s;
    },
    scorpion() {
      const c = '#8d6e63', c2 = '#bcaaa4', acc = '#e64a19';
      let s = ground(100, 180, 58, 8);
      // 腳
      for (const sgn of [-1, 1]) for (let i = 0; i < 4; i++) s += stroke(`M${100 + sgn * 26} ${130 + i * 7} q${sgn * 16} 8 ${sgn * 24} 20`, c2, 5);
      // 尾
      s += stroke('M130 130 q26 -8 28 -34 q2 -20 -12 -26 q-12 -4 -14 8', c, 12);
      s += path('M132 70 q10 -14 18 -8 q6 6 -4 14 q-8 6 -14 -6 Z', acc);
      // 身
      s += ellipse(100, 130, 34, 24, c);
      s += ellipse(100, 138, 22, 14, c2);
      // 鉗
      s += `<g transform="translate(58,118)"><ellipse rx="13" ry="9" fill="${c}"/><path d="M-10 -6 q-8 -10 2 -12 q8 8 12 10 Z" fill="${c2}"/><path d="M-8 8 q-8 10 2 10 q8 -6 10 -10 Z" fill="${c2}"/></g>`;
      s += `<g transform="translate(142,118)"><ellipse rx="13" ry="9" fill="${c}"/><path d="M10 -6 q8 -10 -2 -12 q-8 8 -12 10 Z" fill="${c2}"/><path d="M8 8 q8 10 -2 10 q-8 -6 -10 -10 Z" fill="${c2}"/></g>`;
      if (!st()) {
        s += circle(88, 118, 5, '#fff') + circle(88, 118, 3, ink) + circle(112, 118, 5, '#fff') + circle(112, 118, 3, ink);
        s += mouthSmile(100, 134, 6, '#4e342e', 2.6);
      }
      return s;
    },
    rattlesnake() {
      const c = '#c9a227', c2 = '#e8cf7a', dark = '#8a6d12';
      let s = ground(100, 184, 62, 9);
      s += stroke('M64 172 q-18 -30 12 -46 q30 -16 56 0 q22 14 6 30 q-14 14 -30 4 q-12 -8 -2 -18 q8 -6 14 2', c, 22);
      if (!st()) {
        s += stroke('M64 172 q-18 -30 12 -46 q30 -16 56 0 q22 14 6 30 q-14 14 -30 4 q-12 -8 -2 -18 q8 -6 14 2', dark, 22, 'opacity=".20"');
        s += stroke('M66 168 q-12 -24 14 -38 q26 -14 50 0', c2, 6, 'opacity=".9"');
      }
      for (let i = 0; i < 3; i++) {
        const cx = 132 + i * 7, cy = 172 - i * 6;
        s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (7 - i * 1.4) + '" ry="' + (9 - i * 1.8) + '" fill="' + (i % 2 ? c2 : c) + '" transform="rotate(-20 ' + cx + ' ' + cy + ')"/>';
      }
      s += '<g transform="rotate(-16 76 138)">';
      s += ellipse(76, 138, 26, 17, c);
      if (!st()) {
        s += ellipse(78, 144, 20, 9, c2);
        s += circle(66, 132, 6, '#fff') + circle(66, 132, 3.6, ink);
        s += circle(86, 131, 6, '#fff') + circle(86, 131, 3.6, ink);
        s += path('M50 141 l-14 1 l6 5 l-9 3', '#ff5a7a', 'stroke-width="3" fill="none" stroke-linecap="round"');
      }
      s += '</g>';
      return s;
    },
    /* ------------------------------ 雪地 ------------------------------ */
    penguin() {
      const c = '#3d5a80', c2 = '#ffffff', beak = '#ff9f1c';
      let s = ground(100, 182, 54, 9);
      s += ellipse(74, 164, 18, 10, beak) + ellipse(126, 164, 18, 10, beak);
      s += path('M100 48 q46 0 46 66 q0 52 -46 54 q-46 -2 -46 -54 q0 -66 46 -66 Z', c);
      s += path('M100 74 q30 0 30 44 q0 38 -30 42 q-30 -4 -30 -42 q0 -44 30 -44 Z', c2);
      s += path('M100 54 q30 0 34 46 q-14 -20 -34 -20 q-20 0 -34 20 q4 -46 34 -46 Z', c);
      s += path('M100 74 l-8 10 l16 0 Z', beak);
      if (!st()) {
        s += circle(84, 78, 6, '#fff') + circle(84, 78, 3.4, ink) + circle(116, 78, 6, '#fff') + circle(116, 78, 3.4, ink);
        s += path('M88 96 q-8 6 -14 2', c2, 'stroke-width="4" fill="none"');
        s += path('M112 96 q8 6 14 2', c2, 'stroke-width="4" fill="none"');
      }
      return s;
    },
    polarbear() {
      const c = '#f2f6ff', c2 = '#dbe5f5';
      let s = ground(100, 182, 60, 9);
      s += legs([70, 130], 144, 28, 32, c2);
      s += ellipse(100, 134, 52, 42, c);
      s += earsBear(64, 62, 136, 62, 18, c, c2);
      s += circle(100, 90, 38, c);
      s += ellipse(100, 108, 19, 14, c2);
      s += nose(100, 102, 8, '#3a2f4a');
      if (!st()) {
        s += eyes(100, 86, 16, 7);
        s += mouthW(100, 116, 5);
        s += path('M86 120 q-4 16 6 20 q8 -2 6 -18 Z', c2) + path('M114 120 q4 16 -6 20 q-8 -2 -6 -18 Z', c2);
      }
      return s;
    },
    snowyowl() {
      const c = '#ffffff', c2 = '#e6eef8', acc = '#ffd166';
      let s = ground(100, 182, 52, 9);
      s += path('M100 56 q44 0 44 54 q0 56 -44 62 q-44 -6 -44 -62 q0 -54 44 -54 Z', c);
      s += path('M100 92 q30 0 30 38 q0 34 -30 40 q-30 -6 -30 -40 q0 -38 30 -38 Z', c2);
      if (!st()) {
        s += path('M78 62 q-8 -18 2 -24 q8 6 8 20 Z', c2) + path('M122 62 q8 -18 -2 -24 q-8 6 -8 20 Z', c2);
        s += circle(80, 96, 19, '#f4f8ff', 'stroke="' + c2 + '" stroke-width="2"');
        s += circle(120, 96, 19, '#f4f8ff', 'stroke="' + c2 + '" stroke-width="2"');
        s += circle(80, 96, 11, acc) + circle(120, 96, 11, acc);
        s += circle(80, 96, 8, ink) + circle(120, 96, 8, ink);
        s += circle(83, 93, 3, '#fff') + circle(123, 93, 3, '#fff');
        s += path('M100 108 l-7 8 l14 0 Z', '#ff9f1c');
      }
      return s;
    },
  };

  /* =======================================================================
   *  物品圖案（第一部分題目圖）
   * ======================================================================= */
  const ITEMS = {
    /* 生果 */
    apple: () => {
      const c = '#ff5a5a';
      return `<path d="M100 58 q10 -12 22 -4 q-4 10 -16 10 Z" fill="#59c25a"/>${stroke('M100 60 q2 -10 -2 -16', '#7a4a1f', 5)}${path('M100 66 q22 -6 32 14 q14 26 -4 54 q-12 20 -28 20 q-8 0 -16 -4 q-8 4 -16 4 q-16 0 -28 -20 q-18 -28 -4 -54 q10 -20 32 -14 q10 4 16 0 q6 4 16 0 Z', c)}${path('M78 92 q-8 10 -6 26', '#ff9a9a', 'stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"')}`;
    },
    banana: () => `${path('M40 138 q12 -66 82 -78 q16 -2 16 10 q0 10 -14 14 q-52 12 -62 62 q-2 10 -12 10 q-10 -2 -10 -18 Z', '#ffd93d')}${path('M44 138 q14 -56 74 -70', '#ffe98a', 'stroke-width="8" fill="none" stroke-linecap="round"')}${circle(126, 64, 7, '#8a6b1f')}`,
    orange: () => `${circle(100, 112, 48, '#ff9f1c')}${circle(100, 112, 40, '#ffb347')}${path('M100 64 q-6 -12 6 -16 q4 8 -2 16', '#59c25a')}${st() ? '' : circle(84, 98, 8, '#ffd9a0', 'opacity=".6"')}`,
    watermelon: () => {
      const c = '#43aa8b';
      return `${path('M100 40 q56 0 56 52 q0 32 -56 70 q-56 -38 -56 -70 q0 -52 56 -52 Z', '#2a7a5f')}${path('M100 52 q44 0 44 40 q0 26 -44 58 q-44 -32 -44 -58 q0 -40 44 -40 Z', '#ff5d8f')}${[[80, 76], [112, 72], [96, 96], [124, 96], [70, 104], [100, 122], [134, 116], [86, 138]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="#2b2438" transform="rotate(${(x - 100) * 0.8} ${x} ${y})"/>`).join('')}`;
    },
    grapes: () => {
      const list = [[78, 76], [104, 72], [126, 84], [88, 98], [112, 100], [76, 120], [100, 122], [124, 120], [88, 142], [112, 144]];
      return `${stroke('M100 66 q2 -18 14 -22', '#5c8a3a', 6)}${path('M104 48 q16 -10 26 0 q-10 10 -24 8 Z', '#59c25a')}${list.map(([x, y]) => circle(x, y, 15, '#9d4edd') + circle(x - 4, y - 4, 4, '#c77dff', 'opacity=".8"')).join('')}`;
    },
    strawberry: () => `${path('M100 62 q40 0 40 34 q0 40 -40 68 q-40 -28 -40 -68 q0 -34 40 -34 Z', '#ff4d6d')}${[[84, 90], [112, 90], [98, 108], [122, 110], [76, 112], [100, 132], [88, 148]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="5" fill="#ffe9a8"/>`).join('')}${path('M70 62 q14 -16 30 -4 q14 -12 30 4 q-14 10 -30 4 q-16 6 -30 -4 Z', '#59c25a')}${stroke('M100 58 l0 -16', '#5c8a3a', 6)}`,
    pear: () => `${path('M100 60 q14 -12 22 -2 q-6 10 -16 10 Z', '#59c25a')}${stroke('M98 62 q-2 -14 -6 -18', '#7a4a1f', 5)}${path('M100 60 q18 4 22 30 q4 24 16 36 q16 18 2 36 q-16 18 -40 18 q-24 0 -40 -18 q-14 -18 2 -36 q12 -12 16 -36 q4 -26 22 -30 Z', '#c8e04a')}${path('M82 100 q-6 16 0 30', '#e6f59a', 'stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"')}`,
    lemon: () => `${path('M100 52 q10 -8 16 2 q30 4 32 32 q2 26 -10 44 q-10 16 -22 20 q-4 4 -8 0 q-4 -6 -10 -8 q-14 -8 -22 -24 q-10 -20 -4 -42 q6 -22 28 -24 Z', '#ffe14d')}${stroke('M100 52 q-10 0 -14 -12', '#d9c400', 5)}${stroke('M138 148 q8 4 6 14', '#d9c400', 5)}${st() ? '' : path('M84 86 q-8 22 0 40', '#fff6b0', 'stroke-width="9" fill="none" stroke-linecap="round" opacity=".95"')}${[[92, 118], [110, 108], [104, 132], [120, 124]].map(([x, y]) => circle(x, y, 1.8, '#e8d24a', 'opacity=".7"')).join('')}`,
    pineapple: () => `${ellipse(100, 118, 44, 56, '#ffc300')}${[[100, 80], [78, 100], [122, 100], [100, 118], [78, 136], [122, 136], [100, 154]].map(([x, y]) => `<path d="M${x - 9} ${y} l9 -10 l9 10 l-9 10 Z" fill="none" stroke="#e08a00" stroke-width="2.5"/>`).join('')}${path('M100 66 q-24 -22 -34 -16 q2 26 26 34 Z', '#2a9d4a')}${path('M100 66 q24 -22 34 -16 q-2 26 -26 34 Z', '#43aa8b')}${path('M100 62 q-4 -30 4 -34 q8 6 4 32 Z', '#59c25a')}`,
    mango: () => `${path('M96 60 q18 -14 34 4 q-6 10 -18 10 q-10 0 -16 -14 Z', '#59c25a')}${stroke('M104 62 q8 -14 18 -16', '#7a4a1f', 5)}${path('M88 74 q22 -18 44 -2 q22 16 14 46 q-8 30 -36 34 q-28 4 -38 -22 q-10 -26 2 -42 q6 -8 14 -14 Z', '#ffb703')}${path('M86 96 q14 -10 30 -2 q14 8 10 26', '#ffc300', 'stroke-width="12" fill="none" stroke-linecap="round" opacity=".65"')}${path('M118 78 q10 4 12 16', '#ffe08a', 'stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"')}${ellipse(150, 96, 7, 10, '#e07a00', 'opacity=".35"')}`,
    /* 蔬菜 */
    carrot: () => `${path('M100 148 q-8 -6 -12 -30 q-6 -30 6 -52 q8 -14 20 -14 q12 0 20 14 q12 22 6 52 q-4 24 -12 30 q-14 8 -28 0 Z', '#ff7b00')}${[[92, 84], [108, 100], [94, 116], [110, 128]].map(([x, y]) => stroke(`M${x} ${y} l10 4`, '#e06300', 3)).join('')}${path('M100 54 q-10 -30 -26 -32 q-2 20 10 30 Z', '#43aa8b')}${path('M100 54 q10 -30 26 -32 q2 20 -10 30 Z', '#59c25a')}${path('M100 50 q-2 -26 2 -34 q8 8 6 32 Z', '#43aa8b')}`,
    tomato: () => `${circle(100, 116, 48, '#ff3b3b')}${circle(92, 104, 8, '#ff8a8a', 'opacity=".6"')}${path('M100 68 q-14 -20 -30 -14 q6 18 22 20 q-18 6 -14 22 q18 -2 22 -18 q4 16 22 18 q4 -16 -14 -22 q16 -2 22 -20 q-16 -6 -30 14 Z', '#43aa8b')}${stroke('M100 66 l0 -12', '#2a7a3a', 5)}`,
    corn: () => `${path('M100 46 q28 0 30 34 q2 40 -6 62 q-6 16 -24 16 q-18 0 -24 -16 q-8 -22 -6 -62 q2 -34 30 -34 Z', '#ffd60a')}${[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3].map((c) => circle(86 + c * 10, 66 + r * 16, 4.2, '#f2b900', 'opacity=".85"')).join('')).join('')}${path('M74 66 q-26 8 -30 34 q-2 18 10 26 q10 -30 26 -44 Z', '#2a9d8f')}${path('M126 66 q26 8 30 34 q2 18 -10 26 q-10 -30 -26 -44 Z', '#43aa8b')}${path('M76 128 q-18 4 -24 18 q18 6 30 -4 Z', '#43aa8b')}${path('M124 128 q18 4 24 18 q-18 6 -30 -4 Z', '#2a9d8f')}`,
    cucumber: () => `<g transform="rotate(-24 100 110)">${rrect(62, 74, 76, 72, 34, '#5aa82a')}${rrect(72, 84, 56, 52, 26, '#8fd14f')}${[[86, 96], [104, 94], [96, 110], [114, 108], [88, 118]].map(([x, y]) => circle(x, y, 4, '#d8f5a2', 'opacity=".8"')).join('')}</g>`,
    mushroom: () => `${rrect(86, 116, 28, 46, 12, '#f2e9e4')}${path('M100 46 q52 0 58 40 q2 18 -14 18 l-88 0 q-16 0 -14 -18 q6 -40 58 -40 Z', '#e07a5f')}${[[74, 84], [104, 74], [124, 92], [88, 106]].map(([x, y]) => circle(x, y, 7, '#f7e0d5')).join('')}`,
    broccoli: () => `${rrect(88, 120, 24, 42, 10, '#8fd14f')}${circle(100, 88, 34, '#2a9d4a')}${circle(74, 102, 22, '#2a9d4a')}${circle(126, 102, 22, '#2a9d4a')}${circle(100, 78, 18, '#63c26b')}${circle(78, 96, 12, '#63c26b')}${circle(122, 96, 12, '#63c26b')}`,
    potato: () => `${path('M100 56 q36 0 44 30 q10 32 -10 54 q-18 20 -44 20 q-26 0 -42 -20 q-20 -22 -10 -54 q8 -30 42 -30 Z', '#c98c3f')}${[[82, 84], [116, 96], [96, 116], [120, 130], [78, 126]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="6" fill="#a06a26"/>`).join('')}`,
    onion: () => `${path('M100 52 q34 0 44 32 q12 34 -8 56 q-16 18 -36 18 q-20 0 -36 -18 q-20 -22 -8 -56 q10 -32 44 -32 Z', '#c9a3d6')}${path('M100 56 q-12 40 0 96', '#efe0f5', 'stroke-width="5" fill="none" opacity=".8"')}${path('M100 52 q-8 -20 0 -26 q8 6 0 26 Z', '#8f6f9d')}${path('M96 52 q-14 -14 -20 -10 q4 12 16 16 Z', '#a884b8')}`,
    /* 交通工具 */
    car: () => `${rrect(24, 108, 152, 44, 20, '#ff5a5a')}${path('M52 108 q10 -34 30 -34 l36 0 q20 0 30 34 Z', '#8ecae6')}${rrect(24, 132, 152, 20, 12, '#e04848')}${circle(64, 152, 20, '#3a2f4a')}${circle(64, 152, 9, '#cfd8e3')}${circle(136, 152, 20, '#3a2f4a')}${circle(136, 152, 9, '#cfd8e3')}${rrect(28, 120, 16, 10, 5, '#ffe9a8')}${rrect(156, 120, 16, 10, 5, '#ffe9a8')}`,
    bus: () => `${rrect(22, 70, 156, 88, 18, '#ffcf3f')}${rrect(22, 70, 156, 22, 16, '#3d5a80')}${[38, 76, 114].map((x) => rrect(x, 100, 30, 26, 6, '#bfe6ff')).join('')}${rrect(158, 100, 18, 26, 6, '#bfe6ff')}${circle(58, 158, 18, '#3a2f4a')}${circle(58, 158, 8, '#cfd8e3')}${circle(142, 158, 18, '#3a2f4a')}${circle(142, 158, 8, '#cfd8e3')}`,
    plane: () => `${path('M100 34 q14 0 16 24 l4 44 l52 26 q10 6 10 12 q0 6 -10 4 l-54 -12 l2 26 l18 12 q6 4 6 8 q0 6 -8 4 l-34 -8 l-34 8 q-8 2 -8 -4 q0 -4 6 -8 l18 -12 l2 -26 l-54 12 q-10 2 -10 -4 q0 -6 10 -12 l52 -26 l4 -44 q2 -24 16 -24 Z', '#dfe9f3')}${path('M84 102 l16 -14 l16 14 l-16 8 Z', '#3a86ff')}${circle(100, 52, 6, '#8ecae6')}`,
    train: () => `${rrect(20, 96, 160, 52, 14, '#2a9d8f')}${path('M56 96 q6 -42 44 -42 q38 0 44 42 Z', '#264653')}${rrect(64, 64, 72, 24, 8, '#bfe6ff')}${rrect(20, 122, 160, 10, 4, '#ffd166')}${circle(50, 152, 16, '#3a2f4a')}${circle(50, 152, 7, '#cfd8e3')}${circle(96, 152, 16, '#3a2f4a')}${circle(96, 152, 7, '#cfd8e3')}${circle(142, 152, 16, '#3a2f4a')}${circle(142, 152, 7, '#cfd8e3')}${rrect(24, 60, 18, 26, 6, '#ffd166')}${circle(33, 52, 10, '#e9ecf2', 'opacity=".8"')}`,
    boat: () => `${path('M30 122 l140 0 l-18 36 q-6 10 -18 10 l-68 0 q-12 0 -18 -10 Z', '#ff6b35')}${rrect(84, 40, 8, 82, 4, '#8a5a2b')}${path('M92 46 l52 70 l-52 0 Z', '#aaccff')}${path('M88 46 l-46 70 l46 0 Z', '#ffe9a8')}${path('M20 118 q30 10 80 0 q50 -10 80 0 l0 6 l-160 0 Z', '#3a86ff')}`,
    bike: () => `${circle(58, 132, 34, 'none', 'stroke="#3a0ca3" stroke-width="9"')}${circle(142, 132, 34, 'none', 'stroke="#3a0ca3" stroke-width="9"')}${stroke('M58 132 L88 84 L124 84 M88 84 L110 132 L142 132 M124 84 L142 132', '#ff006e', 9)}${stroke('M80 74 l18 0', '#3a0ca3', 9)}${stroke('M110 74 l18 0', '#3a0ca3', 9)}${rrect(70, 66, 24, 8, 4, '#3a2f4a')}`,
    heli: () => `${stroke('M42 54 l116 0', '#3a2f4a', 8)}${stroke('M100 54 l0 18', '#3a2f4a', 7)}${path('M62 96 q0 -26 38 -26 q38 0 38 26 l0 22 q0 16 -16 16 l-44 0 q-16 0 -16 -16 Z', '#4cc9f0')}${path('M112 74 l58 0 q12 0 12 12 l0 6 q0 8 -10 8 l-60 0 Z', '#4cc9f0')}${path('M124 96 l40 0 l0 20 l-40 0 Z', '#a8e6ff')}${stroke('M78 134 l-22 22 M122 134 l22 22', '#3a2f4a', 7)}${circle(78, 72, 14, '#bfeaff', 'opacity=".9"')}${stroke('M56 116 l0 14 M144 116 l0 14', '#f72585', 6)}`,
    firetruck: () => `${rrect(18, 88, 118, 56, 12, '#e63946')}${path('M136 104 q26 0 34 20 l0 20 l-34 0 Z', '#e63946')}${rrect(146, 108, 18, 16, 4, '#bfe6ff')}${rrect(18, 118, 118, 12, 4, '#ffd60a')}${rrect(30, 96, 40, 16, 4, '#bfe6ff')}${stroke('M96 40 l0 48', '#8a8f9c', 5)}${rrect(78, 88, 36, 20, 6, '#cfd8e3')}${circle(52, 152, 18, '#3a2f4a')}${circle(52, 152, 8, '#cfd8e3')}${circle(140, 152, 18, '#3a2f4a')}${circle(140, 152, 8, '#cfd8e3')}${stroke('M62 44 l46 -14', '#c9ced8', 7)}${stroke('M70 52 l46 -14', '#c9ced8', 5)}${stroke('M62 44 l8 8 M84 38 l8 8 M106 32 l8 8', '#aeb5c0', 4)}`,
    /* 顏色 → 顏色球 */
    swatch: (it) => `${circle(100, 106, 64, it.c)}${circle(100, 106, 64, 'none', 'stroke="rgba(0,0,0,.10)" stroke-width="7"')}${ellipse(74, 78, 22, 14, '#ffffff', 'opacity=".28" transform="rotate(-28 74 78)"')}`,
    /* 形狀 */
    circle: (it) => `${circle(100, 108, 60, it.c || '#ff595e')}${circle(80, 86, 16, '#ffffff', 'opacity=".3"')}`,
    square: (it) => `${rrect(44, 52, 112, 112, 18, it.c || '#1982c4')}${rrect(62, 70, 32, 20, 8, '#ffffff', 'opacity=".25"')}`,
    triangle: (it) => `${path('M100 46 L164 160 L36 160 Z', it.c || '#8ac926', 'stroke-linejoin="round"')}`,
    star: (it) => {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 64 : 26;
        d += (i ? 'L' : 'M') + (100 + Math.cos(a) * r).toFixed(1) + ' ' + (108 + Math.sin(a) * r).toFixed(1);
      }
      return path(d + ' Z', it.c || '#ffca3a', 'stroke-linejoin="round"');
    },
    heart: () => path('M100 164 q-64 -40 -64 -80 q0 -36 32 -36 q20 0 32 22 q12 -22 32 -22 q32 0 32 36 q0 40 -64 80 Z', '#ff5d8f'),
    oval: () => ellipse(100, 108, 68, 44, '#6a4c93'),
    rectangle: () => rrect(30, 64, 140, 88, 16, '#ff924c'),
    /* 身體部位：用「大頭臉 + 突出部位」嘅畫法，一眼睇得出係邊個部位 */
    eyes: () => {
      const base = circle(100, 112, 62, "#ffe0b2") + path("M38 96 q0 -46 62 -46 q62 0 62 46 q0 10 -8 10 q-8 0 -10 -10 q-6 -26 -44 -26 q-38 0 -44 26 q-2 10 -10 10 q-8 0 -8 -10 Z", "#4a2c1a");
      const feat = ellipse(74, 110, 22, 26, "#fff", 'stroke="#3a2f4a" stroke-width="3.5"') + ellipse(126, 110, 22, 26, "#fff", 'stroke="#3a2f4a" stroke-width="3.5"') + circle(74, 114, 12, "#3a2f4a") + circle(126, 114, 12, "#3a2f4a") + circle(68, 106, 5, "#fff") + circle(120, 106, 5, "#fff") + circle(78, 120, 2.5, "#fff") + circle(130, 120, 2.5, "#fff");
      const ring = `<circle cx="74" cy="110" r="34" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/><circle cx="126" cy="110" r="34" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return base + path("M78 148 q22 16 44 0", "#d4736b", 'stroke-width="5" fill="none" stroke-linecap="round"') + feat + ring;
    },
    ears: () => {
      const base = circle(100, 112, 58, "#ffe0b2") + path("M38 96 q0 -44 62 -44 q62 0 62 44 q0 10 -8 10 q-8 0 -10 -10 q-6 -26 -44 -26 q-38 0 -44 26 q-2 10 -10 10 q-8 0 -8 -10 Z", "#4a2c1a");
      const ears = path("M52 92 q-34 -30 -10 -46 q26 -14 44 24 Z", "#ffcf9e") + path("M148 92 q34 -30 10 -46 q-26 -14 -44 24 Z", "#ffcf9e") + path("M56 86 q-18 -22 -2 -30 q16 -4 22 20 Z", "#ffb3c1") + path("M144 86 q18 -22 2 -30 q-16 -4 -22 20 Z", "#ffb3c1");
      const feat = circle(78, 112, 8, "#3a2f4a") + circle(122, 112, 8, "#3a2f4a") + path("M86 138 q14 12 28 0", "#d4736b", 'stroke-width="5" fill="none" stroke-linecap="round"');
      const ring = `<circle cx="44" cy="70" r="34" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/><circle cx="156" cy="70" r="34" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return ears + base + feat + ring;
    },
    nose: () => {
      const base = circle(100, 112, 60, "#ffe0b2") + path("M38 96 q0 -46 62 -46 q62 0 62 46 q0 10 -8 10 q-8 0 -10 -10 q-6 -26 -44 -26 q-38 0 -44 26 q-2 10 -10 10 q-8 0 -8 -10 Z", "#4a2c1a");
      const feat = path("M100 84 q26 20 19 38 q-5 15 -19 15 q-14 0 -19 -15 q-7 -18 19 -38 Z", "#ffb38a") + ellipse(92, 110, 6, 8, "#c97b5a") + ellipse(108, 110, 6, 8, "#c97b5a");
      const ring = `<circle cx="100" cy="110" r="36" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return base + circle(76, 118, 10, "#ff9ab8", 'opacity=".5"') + circle(124, 118, 10, "#ff9ab8", 'opacity=".5"') + path("M86 146 q14 8 28 0", "#d4736b", 'stroke-width="5" fill="none" stroke-linecap="round"') + feat + ring;
    },
    mouth: () => {
      const base = circle(100, 106, 62, "#ffe0b2") + path("M38 90 q0 -46 62 -46 q62 0 62 46 q0 10 -8 10 q-8 0 -10 -10 q-6 -26 -44 -26 q-38 0 -44 26 q-2 10 -10 10 q-8 0 -8 -10 Z", "#4a2c1a");
      const feat = path("M58 116 q42 52 84 0 q-42 18 -84 0 Z", "#e05a72") + path("M70 120 q30 10 60 0", "#fff", 'stroke-width="9" fill="none" stroke-linecap="round"') + path("M88 150 q12 -6 24 0 q-12 8 -24 0 Z", "#c94a63");
      const ring = `<ellipse cx="100" cy="130" rx="52" ry="34" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return base + circle(76, 92, 7, "#3a2f4a") + circle(124, 92, 7, "#3a2f4a") + feat + ring;
    },
    hand: () => {
      const palm = path("M64 176 q-22 0 -22 -24 l0 -46 q0 -11 11 -11 q11 0 11 11 l0 -22 q0 -11 11 -11 q11 0 11 11 l0 -10 q0 -11 11 -11 q11 0 11 11 l0 14 q0 -11 11 -11 q11 0 11 11 l0 58 q0 26 -24 26 Z", "#ffcf9e");
      const lines = stroke("M75 104 l0 32 M97 100 l0 36 M119 108 l0 28", "#e8b184", 3);
      const ring = `<circle cx="96" cy="120" r="62" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return palm + lines + ring;
    },
    foot: () => {
      const foot = path("M84 128 q-32 0 -36 -26 q-4 -24 13 -36 q32 -24 66 0 q17 12 13 36 q-4 26 -36 26 Z", "#ffcf9e") + [0,1,2,3,4].map((i) => circle(70 + i * 15, 138, 12, "#ffcf9e")).join("") + [0,1,2,3,4].map((i) => circle(70 + i * 15, 140, 7, "#ffb38a", 'opacity=".55"')).join("");
      const ring = `<ellipse cx="100" cy="120" rx="70" ry="52" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return foot + ring;
    },
    hair: () => {
      const base = circle(100, 118, 58, "#ffe0b2");
      const feat = path("M40 106 q0 -66 60 -66 q60 0 60 66 q-8 -32 -24 -34 q-10 14 -36 14 q-26 0 -36 -14 q-16 2 -24 34 Z", "#4a2c1a") + path("M60 58 q10 -14 26 -8 q-8 12 -26 8 Z", "#6b4423") + path("M140 58 q-10 -14 -26 -8 q8 12 26 8 Z", "#6b4423");
      const ring = `<ellipse cx="100" cy="72" rx="66" ry="42" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return base + feat + circle(78, 122, 7, "#3a2f4a") + circle(122, 122, 7, "#3a2f4a") + path("M86 146 q14 10 28 0", "#d4736b", 'stroke-width="5" fill="none" stroke-linecap="round"') + ring;
    },
    teeth: () => {
      const mouth = path("M40 84 q60 -26 120 0 q0 66 -60 66 q-60 0 -60 -66 Z", "#ff7f9c");
      const teeth = rrect(62, 88, 26, 24, 6, "#fff") + rrect(92, 84, 26, 26, 6, "#fff") + rrect(122, 88, 26, 24, 6, "#fff") + rrect(82, 122, 36, 26, 7, "#fff");
      const ring = `<circle cx="100" cy="112" r="64" fill="none" stroke="#ff3b6b" stroke-width="5" stroke-dasharray="10 7"/>`;
      return mouth + teeth + path("M40 84 q60 22 120 0 l0 10 q-60 22 -120 0 Z", "#e0708c", 'opacity=".55"') + ring;
    },
    /* 屋企 */
    door: () => `${rrect(58, 40, 84, 132, 10, '#8a5a2b')}${rrect(68, 52, 64, 52, 6, '#a8763f')}${rrect(68, 114, 64, 46, 6, '#a8763f')}${circle(128, 112, 7, '#ffd166')}${rrect(48, 168, 104, 12, 6, '#6b4423')}`,
    window: () => `${rrect(42, 42, 116, 116, 10, '#8a5a2b')}${rrect(54, 54, 92, 92, 4, '#bfe6ff')}${path('M100 54 l0 92 M54 100 l92 0', '#8a5a2b', 'stroke-width="8"')}${path('M54 100 q30 -26 60 0 q30 26 48 46 l0 0', '#a8dcff')}${circle(128, 74, 12, '#ffe9a8')}`,
    bed: () => `${rrect(24, 96, 152, 56, 12, '#6a89cc')}${rrect(24, 72, 34, 80, 10, '#4a69bd')}${rrect(52, 84, 46, 30, 12, '#fff')}${rrect(100, 92, 72, 22, 10, '#ff9ab8')}${rrect(30, 148, 14, 20, 5, '#4a69bd')}${rrect(156, 148, 14, 20, 5, '#4a69bd')}`,
    cup: () => `${path('M62 56 l76 0 l-8 88 q-2 20 -22 20 l-16 0 q-20 0 -22 -20 Z', '#ff9f1c')}${rrect(56, 46, 88, 16, 8, '#ffd166')}${path('M86 78 q-4 40 0 60', '#ffe9a8', 'stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"')}`,
    spoon: () => `${ellipse(100, 72, 30, 40, '#cfd8e3')}${rrect(90, 104, 20, 78, 10, '#cfd8e3')}${ellipse(100, 72, 20, 28, '#e9eef5')}`,
    book: () => `${path('M34 50 l64 12 l0 100 l-64 -12 Z', '#3a86ff')}${path('M166 50 l-64 12 l0 100 l64 -12 Z', '#4aa8e0')}${rrect(96, 56, 8, 108, 2, '#2a5fa8')}${[0, 1, 2].map((i) => rrect(46, 74 + i * 18, 38, 6, 3, '#ffffff', 'opacity=".7"')).join('')}${[0, 1, 2].map((i) => rrect(116, 74 + i * 18, 38, 6, 3, '#ffffff', 'opacity=".7"')).join('')}`,
    clock: () => `${circle(100, 108, 62, '#ffd166')}${circle(100, 108, 52, '#fff9e8')}${stroke('M100 108 l0 -34', '#3a2f4a', 7)}${stroke('M100 108 l26 14', '#3a2f4a', 7)}${circle(100, 108, 6, '#3a2f4a')}${[0, 1, 2, 3].map((i) => `<circle cx="${100 + Math.cos((i * Math.PI) / 2) * 42}" cy="${108 + Math.sin((i * Math.PI) / 2) * 42}" r="4" fill="#c9a227"/>`).join('')}`,
    chair: () => `${rrect(54, 40, 92, 76, 12, '#e09f3e')}${rrect(64, 52, 72, 54, 8, '#f0b95e')}${rrect(44, 112, 112, 20, 8, '#c98c3f')}${rrect(52, 130, 14, 50, 6, '#a8763f')}${rrect(134, 130, 14, 50, 6, '#a8763f')}`,
  };

  /* ======================================================================= *
   *  對外 API
   * ======================================================================= */
  const locIndex = {};
  (window.LOCATIONS || []).forEach((l) => (locIndex[l.id] = l));

  function animal(id, opts) {
    opts = opts || {};
    const fn = ANIMALS[id] || ANIMALS.bear;
    S.shadow = !!opts.shadow;
    let inner;
    try { inner = fn(); } catch (e) { console.warn('animal draw fail', id, e); inner = ANIMALS.bear(); }
    S.shadow = false;
    return `<svg class="art animal-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  function item(it, opts) {
    opts = opts || {};
    if (!it) return '';
    if (it.art && it.art.startsWith('animal:')) {
      return animal(it.art.slice(7), opts);
    }
    if (it.art && /^n\d+$/.test(it.art)) {
      // 數字：大大個數字 + 小圓點
      const n = it.n || parseInt(it.art.slice(1), 10);
      const dots = [];
      for (let i = 0; i < n; i++) {
        const col = i % 5, row = Math.floor(i / 5);
        dots.push(circle(38 + col * 31, 138 + row * 30, 11, '#ffd166'));
      }
      return `<svg class="art item-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="100" y="96" text-anchor="middle" font-size="72" font-weight="900" fill="${opts.color || '#3a86ff'}" font-family="system-ui,sans-serif">${n}</text>${dots.join('')}</svg>`;
    }
    const fn = ITEMS[it.art] || ITEMS.apple;
    let inner;
    try { inner = fn(it); } catch (e) { console.warn('item draw fail', it.art, e); inner = ITEMS.apple(it); }
    return `<svg class="art item-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  function rarityRing(id, size) {
    const a = (window.ANIMAL_DATA || []).find((x) => x.id === id);
    const r = (window.RARITY || {})[a ? a.rarity : 1] || { color: '#7ed957', glow: '#b6ff8a' };
    return r;
  }

  window.Art = { animal, item, shade, rarityRing, ANIMALS: Object.keys(ANIMALS), ITEMS: Object.keys(ITEMS), locIndex };
})();
