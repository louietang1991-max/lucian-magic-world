/* =========================================================================
 *  screen-explore.js — 第二部分：地點地圖 + 影子探索
 *
 *  三種玩法（跟地點）：
 *   dig    沙灘 / 沙漠 / 雪地 → 刮走沙，逐隻影子撥出嚟
 *   float  海面 / 河流        → 影子由水底浮上水面，浮上嚟先撳到
 *   peek   海底 / 森林 / 草原 → 影子匿喺水草／草／樹後面，不時探頭出嚟
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, rnd, rndInt, pick, clamp, shuffle } = C;
  const A = () => window.AudioKit;

  const LOC = window.LOCATIONS || [];
  const ANIMALS = window.ANIMAL_DATA || [];

  /* 地點 → 玩法 */
  const MODE = {
    beach: 'dig', desert: 'dig', snow: 'dig',
    sea: 'float', river: 'float',
    underwater: 'peek', forest: 'peek', grass: 'peek',
  };
  const TEXTURE = {
    beach: { type: 'sand', label: '用手指撥開啲沙，見到影子就撳佢！' },
    desert: { type: 'sand', label: '用手指撥開啲沙，見到影子就撳佢！' },
    snow: { type: 'snow', label: '用手指撥開啲雪，見到影子就撳佢！' },
  };
  const MODE_HINT = {
    float: '啲影子會由水底浮上嚟，浮上水面先撳佢！',
    peek: '啲影子匿埋咗，等佢探頭出嚟先撳佢！',
    dig: '用手指撥開上面嘅嘢，見到影子就撳佢！',
  };
  const MODE_VOICE = {
    float: 'p/zh-HK/peek-water',
    peek: 'p/zh-HK/peek-grass',
    dig: 'p/zh-HK/dig-hint',
  };

  const Explore = {
    location: null,
    session: null,
    mode: 'dig',
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
        <span class="mc-zh">${C.placeName(l)}</span>
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
        add('<div class="sea-boat" style="left:auto;right:10%;bottom:62%;transform:scale(.8)">' + svgBoat() + '</div>');
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
    return d;
  }

  function svgBoat() {
    return `<svg width="110" height="80" viewBox="0 0 110 80"><path d="M10 52 h90 l-12 22 q-4 6 -12 6 h-42 q-8 0 -12 -6 Z" fill="#ff6b35"/><rect x="52" y="6" width="6" height="46" fill="#8a5a2b"/><path d="M58 10 l34 42 h-34 Z" fill="#fff8e7"/><path d="M50 10 l-30 42 h30 Z" fill="#aaccff"/></svg>`;
  }

  /* ----------------------------------------------------- 遮擋物（草／水草／樹叢） */
  /* 遮住影子嘅前景植物：幾棵分開嘅植物，中間留空隙（影子會喺空隙見到） */
  function occluderSvg(theme) {
    if (theme === 'underwater') {
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="occ">
        <defs>
          <linearGradient id="sw1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#126b4d"/><stop offset=".5" stop-color="#35b07a"/><stop offset="1" stop-color="#8ce8b4"/>
          </linearGradient>
          <linearGradient id="sw2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#1a7a58"/><stop offset=".55" stop-color="#4ac48b"/><stop offset="1" stop-color="#b8f5cf"/>
          </linearGradient>
        </defs>
        <g>
          <path d="M5 100 C2 78 4 58 10 40 C12 34 16 36 15 43 C10 62 9 80 12 100 Z" fill="url(#sw1)"/>
          <path d="M17 100 C14 70 17 44 25 22 C28 15 33 18 31 27 C24 48 22 74 26 100 Z" fill="url(#sw2)"/>
          <path d="M35 100 C33 80 37 60 45 42 C48 36 52 39 50 46 C43 64 41 82 45 100 Z" fill="url(#sw1)"/>
          <path d="M59 100 C57 72 61 46 70 26 C73 19 78 22 76 31 C69 52 66 76 70 100 Z" fill="url(#sw2)"/>
          <path d="M81 100 C79 80 83 58 90 40 C93 34 97 37 95 44 C89 62 87 82 91 100 Z" fill="url(#sw1)"/>
          <ellipse cx="18" cy="97" rx="20" ry="7" fill="#0e5c42" opacity=".75"/>
          <ellipse cx="72" cy="97" rx="22" ry="7" fill="#0e5c42" opacity=".75"/>
          <ellipse cx="24" cy="34" rx="2.4" ry="6" fill="#ffffff" opacity=".22"/>
          <ellipse cx="68" cy="38" rx="2.4" ry="6" fill="#ffffff" opacity=".2"/>
        </g>
      </svg>`;
    }
    if (theme === 'forest') {
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="occ">
        <defs>
          <radialGradient id="bush1" cx=".42" cy=".28" r=".85">
            <stop offset="0" stop-color="#a8ec9a"/><stop offset=".5" stop-color="#4caf50"/><stop offset="1" stop-color="#1f5b24"/>
          </radialGradient>
          <radialGradient id="bush2" cx=".45" cy=".3" r=".85">
            <stop offset="0" stop-color="#c2f2ac"/><stop offset=".5" stop-color="#5cbf5f"/><stop offset="1" stop-color="#255f28"/>
          </radialGradient>
        </defs>
        <g>
          <ellipse cx="17" cy="84" rx="19" ry="24" fill="url(#bush1)"/>
          <ellipse cx="36" cy="90" rx="16" ry="18" fill="url(#bush2)"/>
          <ellipse cx="60" cy="86" rx="18" ry="22" fill="url(#bush1)"/>
          <ellipse cx="82" cy="90" rx="15" ry="18" fill="url(#bush2)"/>
          <ellipse cx="24" cy="66" rx="7" ry="5" fill="#d9ffb0" opacity=".55"/>
          <ellipse cx="66" cy="70" rx="6" ry="4" fill="#d9ffb0" opacity=".5"/>
          <circle cx="46" cy="96" r="2" fill="#8fe08f" opacity=".8"/>
          <circle cx="74" cy="96" r="1.7" fill="#8fe08f" opacity=".7"/>
        </g>
      </svg>`;
    }
    // grass / savanna：幾條草葉，中間有罅
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="occ">
      <defs>
        <linearGradient id="gr1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#2f6315"/><stop offset=".55" stop-color="#6cb033"/><stop offset="1" stop-color="#c7e86a"/>
        </linearGradient>
        <linearGradient id="gr2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#3f7d1c"/><stop offset=".5" stop-color="#7cc13f"/><stop offset="1" stop-color="#e0f29a"/>
        </linearGradient>
      </defs>
      <g>
        <path d="M6 100 C4 76 8 54 16 34 C19 27 23 30 21 39 C14 58 12 80 16 100 Z" fill="url(#gr1)"/>
        <path d="M22 100 C20 68 25 44 34 24 C37 17 41 21 39 30 C31 51 28 76 32 100 Z" fill="url(#gr2)"/>
        <path d="M40 100 C38 80 43 60 51 42 C54 36 58 39 56 46 C49 64 47 82 51 100 Z" fill="url(#gr1)"/>
        <path d="M58 100 C56 66 61 42 70 22 C73 15 77 19 75 28 C67 49 64 76 68 100 Z" fill="url(#gr2)"/>
        <path d="M76 100 C74 78 79 56 87 36 C90 29 94 32 92 41 C85 60 83 82 87 100 Z" fill="url(#gr1)"/>
        <path d="M6 100 C24 92 46 94 66 96 C80 98 90 99 96 100 Z" fill="#2a5c12"/>
        <ellipse cx="30" cy="40" rx="3" ry="6" fill="#ffffff" opacity=".2"/>
        <ellipse cx="72" cy="46" rx="2.6" ry="5" fill="#ffffff" opacity=".18"/>
      </g>
    </svg>`;
  }

  /* ---------------------------------------------------------------- 玩樂點 */
  function shadowSlots(n, mode) {
    const layouts = {
      dig: {
        3: [[24, 62], [76, 64], [50, 82]],
        4: [[23, 60], [77, 62], [27, 80], [73, 82]],
        5: [[20, 58], [50, 56], [80, 58], [31, 78], [69, 80]],
      },
      float: {
        3: [[25, 50], [75, 53], [50, 68]],
        4: [[24, 48], [76, 51], [27, 67], [73, 69]],
        5: [[20, 47], [50, 45], [80, 48], [31, 66], [69, 68]],
      },
      peek: {
        3: [[24, 56], [76, 58], [50, 74]],
        4: [[23, 53], [77, 55], [27, 72], [73, 74]],
        5: [[20, 52], [50, 49], [80, 52], [31, 70], [69, 72]],
      },
    };
    const set = (layouts[mode] || layouts.dig)[n] || (layouts[mode] || layouts.dig)[4];
    return set.map(([x, y]) => {
      const jx = rnd(-3, 3), jy = rnd(-2.5, 2.5);
      return { x: clamp(x + jx, 14, 86), y: clamp(y + jy, 40, 84) };
    });
  }

  function spawnSpots(loc) {
    const pool = ANIMALS.filter((a) => a.loc === loc.id);
    if (!pool.length) return [];
    const count = clamp(rndInt(3, 5), 3, Math.max(3, pool.length));
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
    while (chosen.length < count && guard++ < 400) {
      const a = pick(pool);
      if (!chosen.find((x) => x.id === a.id)) chosen.push(a);
    }
    const mode = MODE[loc.id] || 'dig';
    const slots = shuffle(shadowSlots(chosen.length, mode));
    return chosen.map((a, i) => ({
      animal: a,
      found: false,
      visited: false,
      peeking: false,
      x: slots[i].x,
      y: slots[i].y,
      size: clamp(92 + a.size * 54, 100, 178),
      rot: rndInt(-8, 8),
      _timers: [],
    }));
  }

  function enterPlace(locId) {
    const loc = LOC.find((l) => l.id === locId);
    if (!loc) return;
    clearAllTimers();
    Explore.location = loc;
    Explore.mode = MODE[loc.id] || 'dig';
    Explore.session = { spots: spawnSpots(loc), foundCount: 0, total: 0 };
    Explore.session.total = Explore.session.spots.length;
    C.go('place');
  }

  /* ---------------------------------------------------------------- 畫面 */
  let wipe = null;

  function renderPlace() {
    const loc = Explore.location;
    if (!loc) return;
    const scene = $('#place-scene');
    if (!scene) return;
    scene.className = 'scene theme-' + loc.theme;
    scene.style.position = 'absolute';
    clearAllTimers();
    if (wipe) { wipe.destroy(); wipe = null; }

    // 背景
    const deco = $('#place-deco');
    deco.innerHTML = '';
    deco.appendChild(decoFor(loc));

    $('#place-name').textContent = C.placeName(loc);
    updatePlaceCount();

    const mode = Explore.mode;
    const allDone = Explore.session.spots.length > 0 && Explore.session.spots.every((s) => s.visited);

    // 影子層
    const layer = $('#place-shadows');
    layer.innerHTML = '';
    layer.className = 'scene-shadows mode-' + mode;

    // 前景層（水面／遮擋物）
    let fg = $('#place-fg');
    if (!fg) {
      fg = document.createElement('div');
      fg.id = 'place-fg';
      fg.className = 'scene-fg';
      scene.appendChild(fg);
    }
    fg.innerHTML = '';
    fg.className = 'scene-fg mode-' + mode;

    if (allDone) {
      const h = $('#place-hint');
      if (h) h.textContent = '呢度嘅動物都搵晒啦！';
      renderVisitedOnly(layer);
      setTimeout(showPlaceDone, 700);
      return;
    }

    if (mode === 'float') {
      // 水面
      const wl = document.createElement('div');
      wl.className = 'water-front';
      fg.appendChild(wl);
    }

    Explore.session.spots.forEach((spot, i) => {
      if (spot.visited) {
        // 已餵過：彩色動物留低
        const done = document.createElement('div');
        done.className = 'shadow-spot visited r' + spot.animal.rarity;
        done.style.left = spot.x + '%';
        done.style.top = spot.y + '%';
        done.style.setProperty('--sz', spot.size + 'px');
        done.style.setProperty('--rot', spot.rot + 'deg');
        done.innerHTML = '<span class="sp-art">' + window.Art.animal(spot.animal.id) + '</span>' +
          '<span class="sp-badge visited-badge">💕 ' + C.animalName(spot.animal) + '</span>';
        layer.appendChild(done);
        spot.el = done;
        return;
      }

      // 一個「位」：包住影子 + 遮擋物
      const wrap = document.createElement('div');
      wrap.className = 'spot-wrap mode-' + mode + ' r' + spot.animal.rarity;
      wrap.style.left = spot.x + '%';
      wrap.style.top = spot.y + '%';
      wrap.style.setProperty('--sz', spot.size + 'px');
      wrap.style.setProperty('--rot', spot.rot + 'deg');

      const spotEl = document.createElement('button');
      spotEl.className = 'shadow-spot r' + spot.animal.rarity + (mode === 'float' ? ' float' : '');
      spotEl.setAttribute('aria-label', '影子');
      spotEl.innerHTML = '<span class="sp-art">' + window.Art.animal(spot.animal.id, { shadow: true }) + '</span>' +
        (C.state.progress.collected[spot.animal.id] ? '' : '<span class="sp-badge new">NEW</span>');
      spotEl.addEventListener('click', (e) => {
        e.preventDefault();
        onShadowTap(spot);
      });
      wrap.appendChild(spotEl);

      if (mode === 'float') {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        wrap.appendChild(ripple);
      }
      if (mode === 'peek') {
        const oc = document.createElement('span');
        oc.className = 'occluder';
        oc.style.setProperty('--osy', rnd(0.86, 1.18).toFixed(2));
        oc.innerHTML = occluderSvg(loc.theme);
        wrap.appendChild(oc);
      }

      layer.appendChild(wrap);
      spot.el = spotEl;
      spot.wrap = wrap;

      if (mode === 'dig') {
        spotEl.classList.add('hidden-under');
      } else {
        startPeekCycle(spot);
      }
    });

    if (mode === 'dig') {
      makeWipe(TEXTURE[loc.id] || TEXTURE.beach, Explore.session.spots);
      const h = $('#place-hint');
      if (h) h.textContent = (TEXTURE[loc.id] || TEXTURE.beach).label;
    } else {
      const h = $('#place-hint');
      if (h) h.textContent = MODE_HINT[mode];
    }

    setTimeout(() => {
      A().play('p/zh-HK/find-shadow');
      setTimeout(() => A().play(MODE_VOICE[mode]), 1500);
    }, 350);
    A().ambient(loc.theme);
  }

  function renderVisitedOnly(layer) {
    Explore.session.spots.forEach((spot) => {
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
    });
  }

  function updatePlaceCount() {
    const s = Explore.session;
    if (!s) return;
    const el = $('#place-count');
    if (el) el.textContent = s.foundCount + '/' + s.total;
  }

  /* ------------------------------------------------- 探頭／浮水 循環 */
  function clearAllTimers() {
    if (!Explore.session) return;
    (Explore.session.spots || []).forEach((s) => {
      (s._timers || []).forEach(clearTimeout);
      s._timers = [];
      if (s._cycle) { clearTimeout(s._cycle); s._cycle = null; }
    });
  }
  function later(spot, fn, ms) {
    const t = setTimeout(fn, ms);
    (spot._timers = spot._timers || []).push(t);
    return t;
  }

  function startPeekCycle(spot) {
    const isFloat = Explore.mode === 'float';
    clearSpotTimer(spot);
    // 第一輪好快就出嚟，等小朋友快啲見到嘢
    spot._cycle = setTimeout(() => comeUp(spot, isFloat), rndInt(600, 1600));
  }

  function clearSpotTimer(spot) {
    if (spot && spot._cycle) { clearTimeout(spot._cycle); spot._cycle = null; }
  }

  function comeUp(spot, isFloat) {
    if (!spot || spot.visited || spot.found || !spot.el) return;
    if (spot.peeking) return;
    spot.peeking = true;
    spot.el.classList.add('peeking');
    if (spot.wrap) spot.wrap.classList.add('peeking');
    if (Math.random() < 0.45) A().tick();
    spot._cycle = setTimeout(() => goDown(spot, isFloat), rndInt(1700, 2500));
  }

  function goDown(spot, isFloat) {
    if (!spot || spot.visited || spot.found || !spot.el) return;
    spot.peeking = false;
    spot.el.classList.remove('peeking');
    if (spot.wrap) spot.wrap.classList.remove('peeking');
    spot._cycle = setTimeout(() => comeUp(spot, isFloat), rndInt(900, 1700));
  }

  /* ------------------------------------------------------------ 撳影子 */
  let lastWaitTip = 0;
  function onShadowTap(spot) {
    if (spot.found || spot.visited) return;
    if (!spot.peeking && Explore.mode !== 'dig') {
      // 未出嚟：搖一搖，提小朋友等一等
      C.haptic();
      A().wrong();
      if (spot.wrap) {
        spot.wrap.classList.add('shake');
        setTimeout(() => spot.wrap.classList.remove('shake'), 450);
      }
      const now = Date.now();
      if (now - lastWaitTip > 2500) {
        lastWaitTip = now;
        A().play('p/zh-HK/wait-peek');
        const h = $('#place-hint');
        if (h) h.textContent = '等佢出嚟先撳啦！';
      }
      return;
    }
    found(spot);
  }

  function found(spot) {
    if (spot.found) return;
    spot.found = true;
    C.haptic();
    A().pop();
    if (spot.el) spot.el.classList.add('found');
    if (spot.wrap) spot.wrap.classList.add('found');
    setTimeout(() => { try { spot.wrap && spot.wrap.remove(); } catch (e) {} }, 640);
    Explore.session.foundCount++;
    updatePlaceCount();
    // 停止呢個 spot 嘅循環
    (spot._timers || []).forEach(clearTimeout);
    spot._timers = [];
    if (spot._cycle) { clearTimeout(spot._cycle); spot._cycle = null; }
    setTimeout(() => {
      if (window.Feed && window.Feed.start) window.Feed.start({ animal: spot.animal });
      else C.go('feed', { spot });
    }, 520);
  }

  /* ------------------------------------------------- 刮刮卡：撥開沙／雪 */
  function makeWipe(tex, spots) {
    if (wipe) { wipe.destroy(); wipe = null; }
    const layer = $('#place-shadows');
    if (!layer) return;
    const scene = $('#place-scene');
    const cv = document.createElement('canvas');
    cv.className = 'wipe-layer';
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:7;touch-action:none;transition:opacity .55s;cursor:grab;';
    scene.appendChild(cv);
    layer.style.position = 'absolute';
    layer.style.inset = '0';
    layer.style.zIndex = '5';
    layer.style.pointerEvents = 'none';

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = scene.clientWidth || window.innerWidth;
    const H = scene.clientHeight || window.innerHeight;
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    drawTexture(ctx, W, H, tex.type);
    drawMounds(ctx, spots, W, H);

    const boxes = (spots || []).map((s) => ({
      s,
      x: (s.x / 100) * W,
      y: (s.y / 100) * H,
      r: (s.size || 130) * 0.6,
    }));

    let drawing = false, lastX = 0, lastY = 0, checks = 0, allClearDone = false;
    const BRUSH = 52;
    const clear = (x, y) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
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
    const totalCover = () => {
      let img;
      try { img = ctx.getImageData(0, 0, cv.width, cv.height).data; } catch (e) { return 0; }
      let clearN = 0, total = 0;
      const step = Math.max(6, Math.floor(Math.sqrt((cv.width * cv.height) / 900)));
      for (let yy = 0; yy < cv.height; yy += step) {
        for (let xx = 0; xx < cv.width; xx += step) {
          total++;
          if (img[(yy * cv.width + xx) * 4 + 3] < 40) clearN++;
        }
      }
      return total ? clearN / total : 0;
    };

    // 逐隻影子揭開（唔會一隻開哂全部）
    const checkSpots = () => {
      let changed = false;
      boxes.forEach((b) => {
        if (b.s.revealedWipe || b.s.found) return;
        if (regionCover(b.x, b.y, b.r) > 0.14) {
          b.s.revealedWipe = true;
          changed = true;
          if (b.s.el) {
            b.s.el.style.pointerEvents = 'auto';
            b.s.el.classList.remove('hidden-under');
            b.s.el.classList.add('revealed');
          }
          if (b.s.wrap) {
            b.s.wrap.classList.add('revealed');
            b.s.wrap.classList.add('revealed-pop');
            setTimeout(() => b.s.wrap.classList.remove('revealed-pop'), 700);
          }
          A().pop();
          C.haptic();
          const h = $('#place-hint');
          if (h) h.textContent = '撳個影子，餵動物食嘢！';
        }
      });
      if (changed) {
        const allRevealed = boxes.every((b) => b.s.revealedWipe || b.s.found || b.s.visited);
        if (allRevealed) fadeSand();
      }
      return changed;
    };
    function fadeSand() {
      if (allClearDone) return;
      allClearDone = true;
      window.AudioKit.whoosh();
      A().play('p/zh-HK/found-animal');
      cv.style.opacity = '0';
      cv.style.pointerEvents = 'none';
      setTimeout(() => { try { cv.remove(); } catch (e) {} }, 620);
      const h = $('#place-hint');
      if (h) h.textContent = '撳個影子，餵動物食嘢！';
    }

    /* 撳已揭開嘅影子（沙未刮完都可以撳） */
    const spotAt = (x, y) => {
      for (const b of boxes) {
        if (!b.s.revealedWipe || b.s.found) continue;
        const dx = x - b.x, dy = y - b.y;
        if (Math.hypot(dx, dy) <= Math.max(b.r * 1.5, 78)) return b;
      }
      return null;
    };
    let downX = 0, downY = 0, moved = 0;
    const onDown = (e) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      downX = lastX = x; downY = lastY = y; moved = 0;
      const b = spotAt(x, y);
      if (b) {
        // 撳落已揭開嘅影子 → 直接餵食，唔需要刮乾淨
        if (b.s.el) b.s.el.click();
        drawing = false;
        e.preventDefault();
        return;
      }
      drawing = true;
      clear(lastX, lastY);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!drawing) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      moved += dist;
      const steps = Math.max(1, Math.floor(dist / 14));
      for (let i = 1; i <= steps; i++) clear(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
      lastX = x; lastY = y;
      checks++;
      if (checks % 2 === 0) {
        checkSpots();
        // 颳得夠多就由佢全部開（唔想小朋友刮到手軟）
        if (!allClearDone && totalCover() > 0.55) {
          boxes.forEach((b) => { if (b.s.el) { b.s.el.style.pointerEvents = 'auto'; b.s.el.classList.remove('hidden-under'); b.s.el.classList.add('revealed'); } });
          fadeSand();
        }
      }
      e.preventDefault();
    };
    const onUp = (e) => {
      const wasDrawing = drawing;
      drawing = false;
      checkSpots();
      if (!wasDrawing) return;
      // 撳一下就夠：細幅度撳已經揭開嘅影子 → 直接餵食
      const r = cv.getBoundingClientRect();
      const x = (e && e.clientX != null ? e.clientX - r.left : downX);
      const y = (e && e.clientY != null ? e.clientY - r.top : downY);
      if (moved < 22) {
        const b = spotAt(x, y) || spotAt(downX, downY);
        if (b && b.s.el) b.s.el.click();
      }
    };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

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
    const coverTop = { sand: 0.42, snow: 0.34 }[type] || 0.4;
    const grad = (() => {
      switch (type) {
        case 'sand': return ['#f0d69c', '#dcb96f'];
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
      for (let i = 0; i < 12; i++) {
        ctx.font = '18px serif';
        ctx.globalAlpha = 0.5;
        ctx.fillText(['🐚', '✨', '🪨'][i % 3], Math.random() * W, Math.random() * H);
        ctx.globalAlpha = 1;
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
    // 只保留「地下」部分
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

  function drawMounds(ctx, spots, W, H) {
    (spots || []).forEach((s) => {
      if (s.visited) return;
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
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2 + s.rot * 0.1;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * r * 0.55, y + Math.sin(ang) * r * 0.45, 2.4, 0, 7);
        ctx.fill();
      }
    });
  }

  /* ---------------------------------------------------------------- 完成 */
  function showPlaceDone() {
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
      Explore.session = { spots: spawnSpots(loc), foundCount: 0, total: 0 };
      Explore.session.total = Explore.session.spots.length;
      renderPlace();
    });
    p.el.querySelector('[data-next]').addEventListener('click', () => {
      p.close();
      C.go('explore');
    });
    A().play('p/zh-HK/no-more');
  }

  /* ---------------------------------------------------------------- 綁定 */
  function bind() {
    const q = $('[data-back="explore"]');
    if (q) q.addEventListener('click', () => { A().stopAmbient(); A().stop(); });
    let to = null;
    window.addEventListener('resize', () => {
      if (C.screen !== 'place' || !Explore.location) return;
      clearTimeout(to);
      to = setTimeout(() => {
        if (Explore.mode === 'dig' && Explore.session && Explore.session.foundCount === 0) {
          renderPlace();
        }
      }, 400);
    });
  }

  C.registerScreen('explore', {
    enter() { renderMap(); window.Game.hideTip(); A().stopAmbient(); },
  });
  C.registerScreen('place', {
    enter() { renderPlace(); window.Game.hideTip(); },
    leave() {
      A().stopAmbient();
      A().stop();
      clearAllTimers();
      if (wipe) { wipe.destroy(); wipe = null; }
    },
  });

  document.addEventListener('DOMContentLoaded', bind);

  window.Explore = {
    enterPlace,
    get state() { return Explore; },
    get mode() { return Explore.mode; },
  };
})();
