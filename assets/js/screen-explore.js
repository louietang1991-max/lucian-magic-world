/* =========================================================================
 *  screen-explore.js — 第二部分：地點地圖 + 影子探索（撥開沙／水）
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, rnd, rndInt, pick, clamp, shuffle } = C;
  const A = () => window.AudioKit;

  const LOC = window.LOCATIONS || [];
  const ANIMALS = window.ANIMAL_DATA || [];

  const HIDE_TEXTURE = {
    beach: { type: 'sand', label: '用手指抹開啲沙…' },
    desert: { type: 'sand', label: '用手指抹開啲沙…' },
    underwater: { type: 'water', label: '用手指撥開啲水…' },
    sea: { type: 'water', label: '用手指撥開啲水…' },
    river: { type: 'water', label: '用手指撥開啲水…' },
    snow: { type: 'snow', label: '用手指抹開啲雪…' },
    forest: { type: 'leaf', label: '用手指撥開啲樹葉…' },
    grass: { type: 'leaf', label: '用手指撥開啲草…' },
  };

  const Explore = {
    location: null,
    session: null,   // { spots: [{animal, found}], foundCount }
    wiping: false,
  };

  /* ------------------------------------------------------------------ 地圖 */
  function renderMap() {
    const grid = $('#map-grid');
    if (!grid) return;
    grid.innerHTML = '';
    LOC.forEach((l) => {
      const list = ANIMALS.filter((a) => a.loc === l.id);
      const got = list.filter((a) => C.state.progress.collected[a.id]).length;
      const btn = document.createElement('button');
      btn.className = 'map-card theme-' + l.theme;
      btn.innerHTML = `
        <span class="mc-emoji">${l.emoji}</span>
        <span class="mc-zh">${l.zh}</span>
        <span class="mc-en">${l.en}</span>
        <div class="mc-prog"><i style="width:${Math.round((got / Math.max(1, list.length)) * 100)}%"></i></div>
        ${got === list.length ? '<span class="mc-done">🌟</span>' : ''}`;
      btn.addEventListener('click', () => {
        C.haptic();
        A().pop();
        enterPlace(l.id);
      });
      grid.appendChild(btn);
    });
  }

  /* -------------------------------------------------------------- 場景裝飾 */
  function decoFor(loc) {
    const d = document.createElement('div');
    d.className = 'deco ' + loc.theme;
    const add = (html) => { d.insertAdjacentHTML('beforeend', html); };
    switch (loc.id) {
      case 'beach':
        add('<div class="beach-sky"></div><div class="beach-sun"></div><div class="beach-sea"></div><div class="beach-sand"></div>');
        add('<div class="palm" style="left:6%;bottom:46%"></div>');
        add('<div class="palm" style="right:9%;bottom:48%;transform:scale(.8) rotate(8deg)"></div>');
        break;
      case 'sea':
        add('<div class="sea-sun"></div>');
        for (let i = 0; i < 5; i++) add(`<div class="sea-wave" style="top:${18 + i * 15}%;opacity:${0.12 + i * 0.04}"></div>`);
        add(`<div class="sea-boat">${svgBoat()}</div>`);
        break;
      case 'underwater':
        for (let i = 0; i < 4; i++) add(`<div class="uw-ray" style="left:${10 + i * 24}%;animation-delay:${i * 0.7}s"></div>`);
        add('<div class="uw-sand"></div>');
        for (let i = 0; i < 7; i++) add(`<div class="uw-bubble" style="left:${rndInt(5, 92)}%;bottom:${rndInt(5, 30)}%;width:${rndInt(7, 16)}px;height:${rndInt(7, 16)}px;animation-duration:${rnd(5, 10)}s;animation-delay:${rnd(0, 5)}s"></div>`);
        for (let i = 0; i < 5; i++) add(`<div class="uw-weed" style="left:${5 + i * 22}%;animation-delay:${i * 0.4}s"></div>`);
        break;
      case 'river':
        add('<div class="river-water"></div><div class="river-bank"></div>');
        add('<div class="river-tree" style="left:6%;bottom:14%"><i></i><b></b></div>');
        add('<div class="river-tree" style="right:8%;bottom:15%;transform:scale(.8)"><i></i><b></b></div>');
        for (let i = 0; i < 7; i++) add(`<div class="reed" style="left:${rndInt(4, 92)}%;height:${rndInt(60, 110)}px;animation-delay:${rnd(0, 2)}s"></div>`);
        break;
      case 'forest':
        add('<div class="forest-ground"></div>');
        for (let i = 0; i < 5; i++) add(`<div class="forest-tree" style="left:${-4 + i * 24}%;bottom:${rndInt(8, 16)}%;transform:scale(${rnd(0.7, 1.15)})"><i></i><b></b><b></b><b></b></div>`);
        for (let i = 0; i < 9; i++) add(`<div class="firefly" style="left:${rndInt(5, 92)}%;top:${rndInt(10, 70)}%;animation-delay:${rnd(0, 4)}s"></div>`);
        break;
      case 'grass':
        add('<div class="grass-sun"></div>');
        add('<div class="grass-hill" style="bottom:26%;height:22%"></div>');
        add('<div class="grass-hill" style="bottom:0;height:24%;background:#a8991f"></div>');
        add('<div class="acacia" style="left:8%"><i></i><b></b></div>');
        add('<div class="acacia" style="right:10%;transform:scale(.75)"><i></i><b></b></div>');
        break;
      case 'desert':
        add('<div class="desert-sun"></div>');
        add('<div class="dune" style="bottom:24%"></div>');
        add('<div class="dune" style="bottom:0;background:linear-gradient(180deg,#e8a45c,#c9762e)"></div>');
        add('<div class="cactus" style="left:12%;bottom:24%"></div>');
        add('<div class="cactus" style="right:16%;bottom:20%;transform:scale(.7)"></div>');
        break;
      case 'snow':
        add('<div class="aurora"></div>');
        for (let i = 0; i < 8; i++) add(`<div class="snow-star" style="left:${rndInt(4, 94)}%;top:${rndInt(4, 50)}%;animation-delay:${rnd(0, 3)}s">✦</div>`);
        add('<div class="snow-hill" style="bottom:22%"></div>');
        add('<div class="snow-hill" style="bottom:0;background:linear-gradient(180deg,#fff,#e6f2fa)"></div>');
        add('<div class="snow-pine" style="left:10%;bottom:20%"><i></i><b></b><b></b></div>');
        add('<div class="snow-pine" style="right:12%;bottom:22%;transform:scale(.8)"><i></i><b></b><b></b></div>');
        break;
    }
    // 海面／海底加泡泡浮游
    return d;
  }

  function svgBoat() {
    return `<svg width="110" height="80" viewBox="0 0 110 80"><path d="M10 52 h90 l-12 22 q-4 6 -12 6 h-42 q-8 0 -12 -6 Z" fill="#ff6b35"/><rect x="52" y="6" width="6" height="46" fill="#8a5a2b"/><path d="M58 10 l34 42 h-34 Z" fill="#fff8e7"/><path d="M50 10 l-30 42 h30 Z" fill="#aaccff"/></svg>`;
  }

  /* ---------------------------------------------------------------- 玩樂點 */
  function shadowSlots(n) {
    // 用畫面百分比排位（避開頂部 bar 同底部提示，唔好重疊）
    // y 全部放喺「地面」區域（大約 46%–86%），唔會飛到天空
    const layouts = {
      3: [[24, 52], [76, 54], [50, 76]],
      4: [[23, 49], [77, 51], [27, 73], [73, 75]],
      5: [[20, 48], [50, 45], [80, 49], [31, 71], [69, 73]],
    };
    return (layouts[n] || layouts[4]).map(([x, y]) => {
      // 少少隨機
      const jx = rnd(-3, 3), jy = rnd(-3, 3);
      return { x: clamp(x + jx, 14, 86), y: clamp(y + jy, 44, 80) };
    });
  }

  function spawnSpots(loc) {
    const pool = ANIMALS.filter((a) => a.loc === loc.id);
    if (!pool.length) return [];
    const count = clamp(rndInt(3, 5), 3, Math.max(3, pool.length));
    // 稀有度加權：常見多啲
    const weighted = [];
    pool.forEach((a) => {
      const w = a.rarity === 4 ? 1 : a.rarity === 3 ? 2 : a.rarity === 2 ? 4 : 6;
      for (let i = 0; i < w; i++) weighted.push(a);
    });
    const chosen = [];
    let guard = 0;
    while (chosen.length < count && guard++ < 200) {
      const a = pick(weighted);
      if (!chosen.find((x) => x.id === a.id)) chosen.push(a);
    }
    while (chosen.length < count) {
      const a = pick(pool);
      if (!chosen.find((x) => x.id === a.id)) chosen.push(a);
      else guard += 1;
      if (guard > 400) break;
    }
    const slots = shuffle(shadowSlots(chosen.length));
    // 大小：大隻動物大啲
    return chosen.map((a, i) => ({
      animal: a,
      found: false,
      x: slots[i].x,
      y: slots[i].y,
      size: clamp(86 + a.size * 52, 96, 172),
      rot: rndInt(-9, 9),
    }));
  }

  function enterPlace(locId) {
    const loc = LOC.find((l) => l.id === locId);
    if (!loc) return;
    Explore.location = loc;
    Explore.session = { spots: spawnSpots(loc), foundCount: 0, total: 0 };
    Explore.session.total = Explore.session.spots.length;
    C.go('place');
  }

  /* ---------------------------------------------------------------- 畫面 */
  function renderPlace() {
    const loc = Explore.location;
    if (!loc) return;
    const scene = $('#place-scene');
    if (!scene) return;
    scene.className = 'scene theme-' + loc.theme;

    // 背景（重畫）
    const deco = $('#place-deco');
    deco.innerHTML = '';
    deco.appendChild(decoFor(loc));

    // 頂部資料
    $('#place-name').textContent = loc.zh + ' ' + loc.emoji;
    updatePlaceCount();

    // 影子
    const layer = $('#place-shadows');
    layer.innerHTML = '';
    Explore.session.spots.forEach((spot, i) => {
      if (spot.visited) {
        // 已經餵過：用彩色動物留喺場景（不可撳）
        const done = document.createElement('div');
        done.className = 'shadow-spot visited r' + spot.animal.rarity;
        done.style.left = spot.x + '%';
        done.style.top = spot.y + '%';
        done.style.setProperty('--sz', spot.size + 'px');
        done.style.setProperty('--rot', spot.rot + 'deg');
        done.innerHTML = '<span class="sp-art">' + window.Art.animal(spot.animal.id) + '</span>' +
          '<span class="sp-badge visited-badge">💕 ' + spot.animal.zh + '</span>';
        layer.appendChild(done);
        spot.el = done;
        return;
      }
      const el = document.createElement('button');
      el.className = 'shadow-spot r' + spot.animal.rarity;
      el.style.left = spot.x + '%';
      el.style.top = spot.y + '%';
      el.style.setProperty('--sz', spot.size + 'px');
      el.style.setProperty('--rot', spot.rot + 'deg');
      el.style.animationDelay = i * 0.3 + 's';
      el.dataset.i = i;
      el.innerHTML = `<span class="sp-art">${window.Art.animal(spot.animal.id, { shadow: true })}</span>` +
        (C.state.progress.collected[spot.animal.id] ? '' : '<span class="sp-badge new">NEW</span>');
      el.addEventListener('click', () => onShadowTap(spot, el));
      layer.appendChild(el);
      spot.el = el;
    });

    // 隱藏層（沙／水／葉）── 如果已經餵過動物，就唔再蓋住
    const anyVisited = Explore.session.spots.some((s) => s.visited);
    if (wipe) { wipe.destroy(); wipe = null; }
    if (anyVisited) {
      $$('.shadow-spot', layer).forEach((el) => {
        el.classList.add('revealed');
        el.style.pointerEvents = 'auto';
      });
    } else {
      makeWipe(HAVE_TEXTURE(loc), Explore.session.spots);
    }

    const allDone = Explore.session.spots.length > 0 && Explore.session.spots.every((s) => s.visited);
    const hintEl2 = $('#place-hint');
    if (anyVisited && !allDone && hintEl2) hintEl2.textContent = '撳其他影子，繼續餵動物！';
    if (allDone) {
      const hint0 = $('#place-hint');
      if (hint0) hint0.textContent = '呢度嘅動物都搵晒啦！';
      setTimeout(showPlaceDone, 700);
    } else {
      // 語音提示
      setTimeout(() => {
        A().play('p/zh-HK/find-shadow');
        setTimeout(() => A().play('p/zh-HK/wipe-sand'), 1600);
      }, 300);
      const hint = $('#place-hint');
      if (hint) hint.textContent = HAVE_TEXTURE(loc).label;
    }

    A().ambient(loc.theme);
  }

  function HAVE_TEXTURE(loc) { return HIDE_TEXTURE[loc.id] || HIDE_TEXTURE.beach; }

  function updatePlaceCount() {
    const s = Explore.session;
    if (!s) return;
    const el = $('#place-count');
    if (el) el.textContent = s.foundCount + '/' + s.total;
  }

  /* -------------------------------------------------------- 撥開沙／水 canvas */
  let wipe = null;
  function makeWipe(tex, spots) {
    if (wipe) { wipe.destroy(); wipe = null; }
    const layer = $('#place-shadows');
    if (!layer) return;
    const scene = $('#place-scene');
    const cv = document.createElement('canvas');
    cv.className = 'wipe-layer';
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:7;touch-action:none;transition:opacity .55s;cursor:grab;';
    scene.appendChild(cv);
    // 影子喺沙下面（z-index 5），撥開先見到
    layer.style.position = 'absolute';
    layer.style.inset = '0';
    layer.style.zIndex = '5';
    layer.style.pointerEvents = 'none';
    scene.style.position = 'absolute';
    const spotEls = $$('.shadow-spot', layer);
    spotEls.forEach((el) => {
      el.style.pointerEvents = 'none';
      el.classList.remove('revealed');
    });

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = scene.clientWidth || window.innerWidth;
    const H = scene.clientHeight || window.innerHeight;
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    drawTexture(ctx, W, H, tex.type);
    // 小土丘提示：邊度有嘢
    (spots || []).forEach((s) => {
      const x = (s.x / 100) * W, y = (s.y / 100) * H;
      const r = (s.size || 130) * 0.62;
      const rg = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
      rg.addColorStop(0, 'rgba(255,255,255,0.42)');
      rg.addColorStop(0.65, 'rgba(255,248,220,0.18)');
      rg.addColorStop(1, 'rgba(180,140,80,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();
      // 小亮點
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2 + s.rot * 0.1;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * r * 0.55, y + Math.sin(ang) * r * 0.45, 2.4, 0, 7);
        ctx.fill();
      }
    });

    // 每隻影子喺 canvas 上嘅位置（CSS px）
    const spotsBox = (spots || []).map((s) => ({
      s,
      x: (s.x / 100) * W,
      y: (s.y / 100) * H,
      r: (s.size || 130) * 0.55,
    }));

    let drawing = false, lastX = 0, lastY = 0, clearChecks = 0, done = false;
    const BRUSH = 52;
    const clear = (x, y) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    // 某個區域嘅清除比例
    const regionCover = (cx, cy, r) => {
      const x0 = Math.max(0, Math.floor((cx - r) * dpr));
      const y0 = Math.max(0, Math.floor((cy - r) * dpr));
      const w = Math.min(cv.width - x0, Math.floor(r * 2 * dpr));
      const h = Math.min(cv.height - y0, Math.floor(r * 2 * dpr));
      if (w <= 0 || h <= 0) return 0;
      let img;
      try { img = ctx.getImageData(x0, y0, w, h).data; } catch (e) { return 1; }
      let clearN = 0, total = 0;
      const step = Math.max(2, Math.floor(Math.sqrt((w * h) / 240)));
      for (let yy = 0; yy < h; yy += step) {
        for (let xx = 0; xx < w; xx += step) {
          total++;
          if (img[(yy * w + xx) * 4 + 3] < 40) clearN++;
        }
      }
      return total ? clearN / total : 0;
    };
    const checkSpots = () => {
      let changed = false;
      spotsBox.forEach((box) => {
        if (box.s.wiped) return;
        if (regionCover(box.x, box.y, box.r) > 0.5) {
          box.s.wiped = true;
          changed = true;
          // 揭開呢隻影子
          if (box.s.el) {
            box.s.el.style.pointerEvents = 'auto';
            box.s.el.classList.add('revealed');
          }
          window.AudioKit.pop();
          C.haptic();
          const hint = $('#place-hint');
          if (hint) hint.textContent = '撳個影子，餵動物食嘢！';
        }
      });
      if (changed) { done = true; finishWipe(); }
      return changed;
    };
    const onDown = (e) => {
      if (done) return;
      drawing = true;
      const r = cv.getBoundingClientRect();
      lastX = e.clientX - r.left; lastY = e.clientY - r.top;
      clear(lastX, lastY);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!drawing || done) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(dist / 14));
      for (let i = 1; i <= steps; i++) clear(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
      lastX = x; lastY = y;
      clearChecks++;
      if (clearChecks % 4 === 0) checkSpots();
      e.preventDefault();
    };
    const onUp = () => {
      drawing = false;
      if (!done) checkSpots();
    };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    const finishWipe = () => {
      window.AudioKit.whoosh();
      A().play('p/zh-HK/found-animal');
      // 全部沙一次過化開
      cv.style.opacity = '0';
      cv.style.pointerEvents = 'none';
      setTimeout(() => { try { cv.remove(); } catch (e) {} }, 600);
      spotEls.forEach((el) => {
        el.classList.add('revealed');
        el.style.pointerEvents = 'auto';
      });
      const hint = $('#place-hint');
      if (hint) hint.textContent = '撳個影子，餵動物食嘢！';
      // 手指提示
      const first = (Explore.session.spots || []).find((s) => !s.found && !s.visited);
      if (first && first.el) {
        const h = document.createElement('div');
        h.className = 'tap-hand';
        h.textContent = '👆';
        first.el.appendChild(h);
        setTimeout(() => h.remove(), 5200);
      }
    };

    wipe = {
      destroy() {
        cv.removeEventListener('pointerdown', onDown);
        cv.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        try { cv.remove(); } catch (e) {}
      },
    };
  }

  function drawTexture(ctx, W, H, type) {
    ctx.clearRect(0, 0, W, H);
    const coverTop = { beach: 0.42, desert: 0.40, grass: 0.38, river: 0.34, forest: 0.30, snow: 0.22, sea: 0.20, underwater: 0.16 }[type] || 0.30;
    const grad = (() => {
      switch (type) {
        case 'sand': return ['#f0d69c', '#dcb96f'];
        case 'water': return ['#3fa9d8', '#1469a8'];
        case 'snow': return ['#f2fbff', '#cfe6f5'];
        case 'leaf': return ['#4c9a4a', '#2c6b32'];
        default: return ['#dddddd', '#aaaaaa'];
      }
    })();
    const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, grad[0]);
    g.addColorStop(1, grad[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (type === 'sand') {
      ctx.fillStyle = 'rgba(180,140,80,0.22)';
      for (let i = 0; i < 1400; i++) {
        const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 2 + 0.6;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      // 小貝殼
      for (let i = 0; i < 12; i++) {
        ctx.font = '18px serif';
        ctx.globalAlpha = 0.5;
        ctx.fillText(['🐚', '✨', '🪨'][i % 3], Math.random() * W, Math.random() * H);
        ctx.globalAlpha = 1;
      }
    } else if (type === 'water') {
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 22; i++) {
        const y = (i / 22) * H + Math.sin(i) * 8;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const yy = y + Math.sin((x / W) * Math.PI * 4 + i) * 6;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 6 + 2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
    } else if (type === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 4 + 1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(180,215,240,0.35)';
      for (let i = 0; i < 30; i++) {
        ctx.font = '20px serif';
        ctx.fillText('❄', Math.random() * W, Math.random() * H);
      }
    } else if (type === 'leaf') {
      ctx.fillStyle = 'rgba(120,200,90,0.5)';
      for (let i = 0; i < 140; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12 + Math.random() * 12, 6 + Math.random() * 6, 0, 0, 7);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(60,140,60,0.35)';
      for (let i = 0; i < 100; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 3, 16);
      }
    }
    // 只保留「地下」部分，上面嘅天空／海面／樹林俾返原本場景
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    const maskTop = H * (coverTop - 0.10);
    const maskFull = H * coverTop;
    const mg = ctx.createLinearGradient(0, maskTop, 0, maskFull);
    mg.addColorStop(0, 'rgba(0,0,0,0)');
    mg.addColorStop(0.55, 'rgba(0,0,0,0.85)');
    mg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ------------------------------------------------------------ 揀影子 */
  function onShadowTap(spot, el) {
    if (spot.found) return;
    C.haptic();
    A().tap();
    spot.found = true;
    el.classList.add('found');
    // 放大飛走動畫
    setTimeout(() => el.remove(), 620);
    Explore.session.foundCount++;
    updatePlaceCount();
    // 去餵食
    const delay = 480;
    setTimeout(() => {
      if (window.Feed && window.Feed.start) window.Feed.start({ animal: spot.animal });
      else C.go('feed', { spot });
    }, delay);
  }

  /* ---------------------------------------------------------------- 返回 */
  function afterFeed(spotData) {
    // 由餵食畫面返回：如果全部搵完，問要唔要去第二度
    const s = Explore.session;
    if (!s) return;
    C.go('place');
    if (s.foundCount >= s.total) {
      setTimeout(async () => {
        await A().play('p/zh-HK/no-more');
        showPlaceDone();
      }, 700);
    }
  }

  async function showPlaceDone() {
    const s = Explore.session;
    const loc = Explore.location;
    if (!s || !loc) return;
    const got = s.spots.filter((x) => C.state.progress.collected[x.animal.id]).length;
    const p = C.popup(`<div class="popup-card">
        <div style="font-size:52px">🎉</div>
        <p class="popup-text">你搵晒${loc.zh}嘅動物啦！<br><small style="font-size:14px;color:#8d7fab">呢度有 ${got} 位動物朋友</small></p>
        <div class="popup-actions">
          <button class="btn ghost" data-again>再玩呢度</button>
          <button class="btn primary" data-next>去另一個地方</button>
        </div>
      </div>`, { cls: 'center', dismissible: false });
    p.el.querySelector('[data-again]').addEventListener('click', () => {
      p.close();
      renderPlace();
    });
    p.el.querySelector('[data-next]').addEventListener('click', () => {
      p.close();
      C.go('explore');
    });
  }

  /* ---------------------------------------------------------------- 綁定 */
  function bind() {
    const q = $('[data-back="explore"]');
    if (q) q.addEventListener('click', () => { A().stopAmbient(); A().stop(); });
    // 旋轉／尺寸改變 → 重畫 wipe
    let to = null;
    window.addEventListener('resize', () => {
      if (C.screen !== 'place' || !Explore.location) return;
      clearTimeout(to);
      to = setTimeout(() => {
        // 只重畫隱藏層（唔影響已搵到嘅）
        const loc = Explore.location;
        if (Explore.session && Explore.session.foundCount === 0) {
          makeWipe(HAVE_TEXTURE(loc));
        }
      }, 400);
    });
  }

  C.registerScreen('explore', {
    enter() { renderMap(); window.Game.hideTip(); A().stopAmbient(); },
  });
  C.registerScreen('place', {
    enter() { renderPlace(); window.Game.hideTip(); },
    leave() { A().stopAmbient(); A().stop(); if (wipe) { wipe.destroy(); wipe = null; } },
  });

  document.addEventListener('DOMContentLoaded', bind);

  window.Explore = {
    enterPlace,
    afterFeed,
    get state() { return Explore; },
  };
})();
