/* =========================================================================
 *  screen-feed.js — 第二部分核心：餵食（掟生果入圈）+ 節拍點擊 + 獎勵卡
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, clamp, rnd, rndInt, pick, sleep } = C;
  const A = () => window.AudioKit;

  const THROWS = 3;

  /* 節拍模式：唔止一種拍子 */
  const PATTERNS = [
    { id: 'steady', zh: '平均四拍', bpm: 88, beats: 4, active: [0, 1, 2, 3] },
    { id: 'skip', zh: '停一拍（1·2·_·4）', bpm: 84, beats: 4, active: [0, 1, 3] },
    { id: 'waltz', zh: '三拍（1·2·3）', bpm: 96, beats: 3, active: [0, 1, 2] },
  ];
  function pickPattern() {
    const base = Number(C.state.settings.tempo) || 88;
    const p = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    return { ...p, bpm: Math.round(Math.max(60, Math.min(120, base + (p.bpm - 88)))) };
  }

  const F = {
    animal: null,
    stage: 'idle',          // throw → countin → beats → eat → done
    geo: null,
    fruits: [],             // 飛緊／落地
    score: { accuracy: 0, rhythm: 0 },
    rawRhythm: 0,
    pattern: PATTERNS[0],
    demo: false,
    throwCount: 0,
    beatTaps: [],
    taps: 0,
    perfect: 0,
    raf: 0,
    last: 0,
    timers: [],
    drift: 0,
    circle: { x: 0, y: 0 },
  };

  function later(fn, ms) { const t = setTimeout(fn, ms); F.timers.push(t); return t; }
  function clearTimers() { F.timers.forEach(clearTimeout); F.timers = []; }

  /* ------------------------------------------------------------- 幾何位置 */
  function computeGeo() {
    const W = window.innerWidth, H = window.innerHeight;
    const circleY = H * 0.60;
    const r = Math.min(W * 0.28, H * 0.125, 140);
    F.geo = {
      W, H, r,
      cx: W / 2,
      cy: circleY,
      animal: { x: W / 2, y: Math.max(H * 0.27, 200), s: Math.min(W * 0.60, H * 0.27) },
      basket: { x: W / 2, y: H - Math.max(100, H * 0.135) },
    };
    return F.geo;
  }

  function applyGeo() {
    const g = computeGeo();
    const circle = $('#feed-circle');
    if (circle) {
      circle.style.width = circle.style.height = g.r * 2 + 'px';
      circle.style.left = g.cx - g.r + 'px';
      circle.style.top = g.cy - g.r + 'px';
    }
    F.circle.x = g.cx;
    F.circle.y = g.cy;
    // 跟拍撳區：比圈大一圈（小朋友撳手／邊緣都中）
    const hit = $('#beat-hit');
    if (hit) {
      const hs = Math.max(g.r * 2.9, 210);
      hit.style.width = hit.style.height = hs + 'px';
      hit.style.left = g.cx - hs / 2 + 'px';
      hit.style.top = g.cy - hs / 2 + 'px';
    }
    // 跟拍雙手：細啲、放喺圈外面
    const hands = document.querySelectorAll('#beat-hands .hand');
    if (hands.length >= 2) {
      const hw = Math.min(window.innerWidth * 0.34, 176);
      const hy = g.cy - hw * 0.42;
      hands[0].style.left = Math.max(-hw * 0.2, g.cx - g.r - hw * 0.95) + 'px';
      hands[0].style.top = hy + 'px';
      hands[1].style.left = Math.min(window.innerWidth - hw * 0.8, g.cx + g.r - hw * 0.05) + 'px';
      hands[1].style.top = hy + 'px';
    }
    const animal = $('#feed-animal');
    if (animal) {
      animal.style.left = g.animal.x + 'px';
      animal.style.top = g.animal.y + 'px';
      animal.style.width = g.animal.s + 'px';
      animal.style.height = g.animal.s + 'px';
    }
  }

  /* ================================================================== 開始 */
  function start(spot) {
    F.animal = spot ? spot.animal : F.animal;
    F.stage = 'throw';
    F.fruits.forEach((f) => { try { f.el.remove(); } catch (e) {} });
    F.fruits = [];
    F.score = { accuracy: 0, rhythm: 0 };
    F.rawRhythm = 0;
    F.pattern = pickPattern();
    F.demo = false;
    F.throwCount = 0;
    F.beatTaps = [];
    F.taps = 0;
    F.perfect = 0;
    clearTimers();
    stopDrift();
    F._driftT = Math.random() * 6;
    const gifted = window.Profile.ensureFruits(THROWS);

    C.go('feed');
    later(() => {
      applyGeo();
      renderTop();
      renderAnimal();
      renderDots();
      updateBasket();
      const hint = $('#feed-hint');
      if (hint) hint.textContent = '將魔法生果掟入圈圈！';
      tip('將魔法生果掟入圈圈！');
      A().play('p/zh-HK/throw-fruit');
      const screen = document.getElementById('screen-feed');
      if (screen) {
        screen.classList.remove('stage-beat', 'stage-tap', 'stage-eat', 'feed-beach', 'feed-sea', 'feed-underwater', 'feed-river', 'feed-forest', 'feed-grass', 'feed-desert', 'feed-snow');
        const themeName = (window.Explore && window.Explore.state && window.Explore.state.location && window.Explore.state.location.theme) || 'forest';
        screen.classList.add('stage-throw', 'feed-' + themeName);
      }
      startLoop();
      startDrift();
      if (gifted) tip('精靈送咗生果俾你！', 1800);
    }, 80);
  }

  function renderTop() {
    const t = $('#feed-title');
    if (t) t.textContent = (C.state.settings.textLang === 'en' ? 'Feed ' : '餵 ') + (F.animal ? C.animalName(F.animal) : '動物');
    updateBasket();
  }

  function updateBasket() {
    const left = Math.max(0, THROWS - F.throwCount);
    const num = $('#basket-num');
    if (num) num.textContent = left;
    void num;
    const b = $('#feed-basket');
    if (b) b.classList.toggle('empty', left === 0);
    const box = $('#basket-fruits');
    if (box) {
      box.innerHTML = '';
      for (let i = 0; i < THROWS; i++) {
        const s = document.createElement('span');
        s.textContent = window.Game.FRUIT_EMOJI[i % window.Game.FRUIT_EMOJI.length];
        if (i < F.throwCount) s.className = 'used';
        box.appendChild(s);
      }
    }
  }

  function renderAnimal() {
    const box = $('#feed-animal-art');
    const nm = $('#feed-animal-name');
    const wrap = $('#feed-animal');
    if (!box || !F.animal) return;
    box.innerHTML = window.Art.animal(F.animal.id);
    if (nm) nm.textContent = '';
    if (wrap) wrap.classList.remove('revealed', 'eating', 'excited');
  }

  function renderDots() {
    const dots = $('#beat-dots');
    if (!dots) return;
    const p = F.pattern || PATTERNS[0];
    dots.innerHTML = '';
    for (let i = 0; i < p.beats; i++) {
      const d = document.createElement('i');
      d.className = 'beat-dot' + (p.active.includes(i) ? '' : ' rest');
      dots.appendChild(d);
    }
  }

  let tipTimer = null;
  function tip(txt, ms) {
    const el = $('#feed-tip');
    if (!el) return;
    el.textContent = txt;
    el.classList.add('show');
    clearTimeout(tipTimer);
    if (ms) tipTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* =============================================================== 掟生果 */
  function throwFruit(target) {
    if (F.stage !== 'throw' || F.throwCount >= THROWS) return;
    const g = F.geo;
    const from = { x: g.basket.x + rnd(-26, 26), y: g.basket.y - 22 };
    let to;
    const cur = (F.circle && F.circle.x) ? F.circle : { x: g.cx, y: g.cy };
    if (target) to = target;
    else {
      const rr = g.r * (Math.random() < 0.62 ? rnd(0.1, 0.32) : rnd(0.35, 0.72));
      const a = rnd(0, Math.PI * 2);
      to = { x: cur.x + Math.cos(a) * rr, y: cur.y + Math.sin(a) * rr * 0.55 };
    }
    const el = document.createElement('div');
    el.className = 'throw-fruit';
    el.textContent = pick(window.Game.FRUIT_EMOJI);
    el.style.transform = `translate(${from.x - 18}px, ${from.y - 18}px)`;
    const screen = document.getElementById('screen-feed');
    screen.appendChild(el);
    F.throwCount++;
    updateBasket();
    A().whoosh();
    C.haptic();

    const obj = { el, t: 0, dur: 0.5, sx: from.x, sy: from.y, tx: to.x, ty: to.y, arc: Math.min(180, g.H * 0.18) };
    F.fruits.push(obj);
    later(() => {
      const curStay = (F.circle && F.circle.x) ? F.circle : { x: g.cx, y: g.cy };
      const dx = to.x - curStay.x;
      const dy = (to.y - curStay.y) / 0.55;
      const ratio = Math.hypot(dx, dy) / g.r;
      let pts = 3, label = '差少少', color = '#ffd6de';
      if (ratio < 0.34) { pts = 20; label = '好準呀！'; color = '#7dffb0'; }
      else if (ratio < 0.68) { pts = 14; label = '好嘢！'; color = '#ffe066'; }
      else if (ratio <= 1.05) { pts = 8; label = '中咗！'; color = '#fff'; }
      F.score.accuracy += pts;
      el.classList.add('landed');
      el.style.transform = `translate(${to.x - 18}px, ${to.y - 18}px) rotate(0deg) scale(1)`;
      A().splat();
      spawnBurst(to.x, to.y, pts >= 14 ? ['✨', '🌟', '⭐'] : ['💧', '✨']);
      flyScore(to.x, to.y - 24, '+' + pts, color);
      circlePulse();
      const hint = $('#feed-hint');
      if (hint) hint.textContent = label;
      if (F.throwCount >= THROWS) {
        later(showEat, 700);
        if (hint) hint.textContent = '動物好開心呀！';
      } else {
        later(() => { if (F.stage === 'throw') { tip('再掟多一個！', 1100); if (hint) hint.textContent = '將魔法生果掟入圈圈！'; } }, 520);
      }
    }, obj.dur * 1000);
  }

  /* 圓圈慢慢上下左右飄（似拋食物俾動物） */
  function startDrift() {
    stopDrift();
    const step = () => {
      const g = F.geo;
      if (!g || C.screen !== 'feed') { F.drift = 0; return; }
      if (!F._driftT) F._driftT = Math.random() * 6;
      F._driftT += 1 / 60;
      const tt = F._driftT;
      const ampX = Math.min(g.W * 0.17, 74);
      const ampY = Math.min(g.H * 0.055, 46);
      const x = clamp(g.cx + Math.sin(tt * 0.85) * ampX, g.r + 18, g.W - g.r - 18);
      const y = clamp(g.cy + Math.sin(tt * 0.62 + 1.1) * ampY, g.cy - ampY - 10, g.cy + ampY + 10);
      F.circle.x = x;
      F.circle.y = y;
      const c = $('#feed-circle');
      if (c) { c.style.left = x - g.r + 'px'; c.style.top = y - g.r + 'px'; }
      F.drift = requestAnimationFrame(step);
    };
    F.drift = requestAnimationFrame(step);
  }
  function stopDrift() {
    if (F.drift) { cancelAnimationFrame(F.drift); F.drift = 0; }
  }

  function circlePulse() {
    const c = $('#feed-circle');
    if (!c) return;
    c.classList.remove('pulse');
    void c.offsetWidth;
    c.classList.add('pulse');
  }

  function spawnBurst(x, y, emojis) {
    for (let i = 0; i < 7; i++) {
      const e = document.createElement('div');
      e.className = 'burst';
      e.textContent = pick(emojis);
      e.style.left = x + 'px';
      e.style.top = y + 'px';
      e.style.setProperty('--dx', rnd(-90, 90) + 'px');
      e.style.setProperty('--dy', rnd(-130, -20) + 'px');
      document.getElementById('screen-feed').appendChild(e);
      setTimeout(() => e.remove(), 900);
    }
  }

  function flyScore(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'fly-score';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color || '#fff';
    document.getElementById('screen-feed').appendChild(el);
    setTimeout(() => el.remove(), 1050);
  }

  /* ================================================================ 節奏 */
  function setStage(name) {
    const screen = document.getElementById('screen-feed');
    if (!screen) return;
    screen.classList.remove('stage-throw', 'stage-ready', 'stage-beat', 'stage-tap', 'stage-eat');
    screen.classList.add('stage-' + name);
    // 撳區只喺正式拍子階段開，避免擋住「聽節拍 / 開始」掣同掟生果
    const hit = $('#beat-hit');
    if (hit) hit.hidden = !(name === 'tap' || name === 'beat');
  }

  function slamHands() {
    const h = $('#beat-hands');
    if (!h) return;
    h.classList.remove('slam');
    void h.offsetWidth;
    h.classList.add('slam');
  }

  function showCount(text) {
    const el = $('#count-pop');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  /** 掟完三個生果：出「聽節拍 / 開始」面板 */
  function showReady() {
    if (F.stage !== 'throw') return;
    F.stage = 'ready';
    F.pattern = pickPattern();
    F.beatTaps = new Array(F.pattern.beats).fill(null);
    F.rawRhythm = 0;
    setStage('ready');
    renderDots();
    const hint = $('#feed-hint');
    if (hint) hint.textContent = '準備好就撳「開始」！';
    const panel = $('#rhythm-ready');
    if (panel) panel.hidden = false;
    const pp = $('#rr-pattern');
    if (pp) pp.textContent = F.pattern.zh + '　·　' + F.pattern.bpm + ' BPM';
    const hands = $('#beat-hands');
    if (hands) hands.hidden = false;
    const basket = $('#feed-basket');
    if (basket) basket.style.display = 'none';
    const ls = $('#rhythm-listen');
    if (ls) ls.disabled = false;
    A().play('p/zh-HK/ready-rhythm');
    tip('想聽多次就撳「聽節拍」', 2600);
  }

  function setReadyButtons(disabled) {
    const ls = $('#rhythm-listen');
    const st = $('#rhythm-start');
    if (ls) ls.disabled = disabled;
    if (st) st.disabled = disabled;
  }

  /** 聽節拍：示範一次（唔計分） */
  function listenBeat() {
    if (F.stage !== 'ready') return;
    F.demo = true;
    setReadyButtons(true);
    const p = F.pattern;
    renderDots();
    // 聽節拍之前都數 1、2、3，等小朋友知幾時開始
    runCountIn(() => {
      if (F.stage === 'done') return;
      if (!F.demo) return;
      F.stage = 'demo';
      A().play('p/zh-HK/listen-beat');
      const hint = $('#feed-hint');
      if (hint) hint.textContent = '聽下個拍子…';
      const ok = window.Metro.start({
        bpm: p.bpm,
        countIn: 0,
        beats: p.beats,
        window: 0.34,
        onBeat: onDemoBeat,
        onEnd: () => {
          F.demo = false;
          F.stage = 'ready';
          setStage('ready');
          setReadyButtons(false);
          const rp = $('#rhythm-ready');
          if (rp) rp.hidden = false; // 示範完要出返「開始」掣
          const h = $('#feed-hint');
          if (h) h.textContent = '準備好就撳「開始」！';
        },
      });
      if (!ok) {
        F.demo = false; F.stage = 'ready'; setReadyButtons(false);
        const rp2 = $('#rhythm-ready');
        if (rp2) rp2.hidden = false;
      }
    });
  }

  function onDemoBeat(i) {
    const p = F.pattern;
    const active = p.active.includes(i);
    const dots = $$('#beat-dots .beat-dot');
    dots.forEach((d, idx) => {
      d.className = 'beat-dot' + (p.active.includes(idx) ? '' : ' rest') + (idx === i ? ' now' : '');
    });
    if (active) {
      circlePulse();
      slamHands();
      A().beat(i === 0 ? 1400 : 1200);
    } else {
      A().tick();
    }
  }

  /** 共用：數 1、2、3 之後再開始（cb 係數完之後要做嘅事） */
  function runCountIn(cb) {
    F.stage = 'count';
    F.countToken = (F.countToken || 0) + 1;
    const token = F.countToken;
    const panel = $('#rhythm-ready');
    if (panel) panel.hidden = true;
    setStage('beat');
    const hint = $('#feed-hint');
    if (hint) hint.textContent = '準備⋯⋯';
    A().play('p/zh-HK/count-123');
    const nums = ['1', '2', '3'];
    nums.forEach((n, i) => {
      later(() => {
        if (F.stage === 'done' || token !== F.countToken) return;
        showCount(n);
        A().countIn(i === 0 ? 1 : 2);
        slamHands();
      }, i * 640);
    });
    later(() => {
      if (F.stage === 'done' || token !== F.countToken) return;
      showCount('開始！');
    }, nums.length * 640);
    later(() => {
      if (F.stage === 'done' || token !== F.countToken) return;
      cb();
    }, nums.length * 640 + 720);
  }

  /** 開始：數 1、2、3 先正式開始 */
  function startBeats() {
    if (F.stage !== 'ready') return;
    runCountIn(() => beginMetro());
  }

  function beginMetro() {
    F.stage = 'beats';
    document.querySelectorAll('.throw-fruit').forEach((el) => el.classList.add('eaten'));
    setStage('tap');
    const hint = $('#feed-hint');
    const p = F.pattern;
    if (hint) hint.textContent = '跟住拍子撳圈圈！';
    tip('跟住拍子撳！', 1600);
    A().play('p/zh-HK/tap-now');
    const lb = $('#fc-label');
    if (lb) lb.textContent = '撳';
    renderDots();
    const ok = window.Metro.start({
      bpm: p.bpm,
      countIn: 0,
      beats: p.beats,
      window: 0.34,
      onBeat,
      onEnd: onRhythmEnd,
    });
    if (!ok) {
      // 冇 audio context：照樣用計時器行（極少數情況）
      F.stage = 'beats';
    }
  }

  function onBeat(i) {
    const p = F.pattern;
    const active = p.active.includes(i);
    const dots = $$('#beat-dots .beat-dot');
    dots.forEach((d, idx) => {
      let cls = 'beat-dot' + (p.active.includes(idx) ? '' : ' rest');
      if (idx === i) cls += ' now';
      if (F.beatTaps[idx] != null && F.beatTaps[idx] > 0) cls += ' hit';
      d.className = cls;
    });
    if (active) {
      circlePulse();
      slamHands();
      A().beat(i === 0 ? 1400 : 1200);
    } else {
      // 休息拍：細細聲 tick，圈唔閃
      A().tick();
    }
  }

  function tapCircle() {
    if (F.stage === 'throw') { throwFruit(null); return; }
    if (F.stage !== 'beats') return;
    const p = F.pattern;
    const rate = window.Metro.rateNow();
    const beat = clamp(rate.beat, 0, p.beats - 1);
    // 撳咗喺「休息拍」上面
    if (!p.active.includes(beat)) {
      C.haptic();
      A().tick();
      slamHands();
      flyScore(F.geo.cx + rnd(-30, 30), F.geo.cy - F.geo.r - 16, '呢拍休息', '#c9b8e8');
      return;
    }
    let pts = 0, label = '', good = false;
    if (rate.dist <= 0.08) { pts = 10; label = 'PERFECT!'; good = true; F.perfect++; }
    else if (rate.dist <= 0.15) { pts = 7; label = 'GREAT!'; good = true; }
    else if (rate.dist <= 0.23) { pts = 4; label = 'GOOD'; good = true; }
    else if (rate.dist <= 0.34) { pts = 2; label = 'OK'; }
    else { label = '再試吓'; }
    F.taps++;
    if (pts > (F.beatTaps[beat] == null ? -1 : F.beatTaps[beat])) F.beatTaps[beat] = pts;
    F.rawRhythm += pts;
    C.haptic();
    A().tap();
    slamHands();
    if (good) A().star();
    const g = F.geo;
    const ball = document.createElement('div');
    ball.className = 'rhythm-ball';
    ball.textContent = good ? '✨' : '🍎';
    ball.style.left = g.cx - 14 + 'px';
    ball.style.top = g.cy - 14 + 'px';
    ball.style.setProperty('--tx', g.animal.x - g.cx + rnd(-30, 30) + 'px');
    ball.style.setProperty('--ty', g.animal.y - g.cy + rnd(-20, 20) + 'px');
    document.getElementById('screen-feed').appendChild(ball);
    setTimeout(() => ball.remove(), 700);
    flyScore(g.cx + rnd(-40, 40), g.cy - g.r - 16, label, good ? '#7dffb0' : pts > 0 ? '#ffe066' : '#ffb3c1');
    circlePulse();
    const dots = $$('#beat-dots .beat-dot');
    if (dots[beat] && pts > 0) dots[beat].className = 'beat-dot' + (p.active.includes(beat) ? '' : ' rest') + ' hit';
  }

  /** 食嘢 → 揭曉（唔再玩拍子） */
  function showEat() {
    if (F.stage === 'done' || F.stage === 'eat') return;
    F.stage = 'eat';
    setStage('eat');
    const panel = $('#rhythm-ready');
    if (panel) panel.hidden = true;
    const hit = $('#beat-hit');
    if (hit) hit.hidden = true;
    const hint = $('#feed-hint');
    if (hint) hint.textContent = '好叻呀！';
    tip('動物食得好開心呀！', 2000);
    const animal = $('#feed-animal');
    if (animal) animal.classList.add('revealed', 'eating');
    A().crunch();
    later(() => A().crunch(), 340);
    later(() => A().levelUp(), 700);
    A().play('p/zh-HK/animal-happy');
    spawnHearts();
    later(goReveal, 2200);
  }

  function onRhythmEnd() {
    if (F.stage === 'done') return;
    // 把拍子分數標準化到 40 分滿分
    const maxRaw = 10 * F.pattern.active.length;
    F.score.rhythm = maxRaw ? Math.round((F.rawRhythm / maxRaw) * 40) : 0;
    F.stage = 'eat';
    setStage('eat');
    const panel = $('#rhythm-ready');
    if (panel) panel.hidden = true;
    const hint = $('#feed-hint');
    if (hint) hint.textContent = '好叻呀！';
    tip('動物食得好開心呀！', 2000);
    const animal = $('#feed-animal');
    if (animal) animal.classList.add('revealed', 'eating');
    A().crunch();
    later(() => A().crunch(), 340);
    later(() => A().levelUp(), 700);
    A().play('p/zh-HK/animal-happy');
    spawnHearts();
    later(goReveal, 2200);
  }

  function spawnHearts() {
    const g = F.geo;
    for (let i = 0; i < 8; i++) {
      const h = document.createElement('div');
      h.className = 'heart-pop';
      h.textContent = pick(['💕', '❤️', '💖', '✨']);
      h.style.left = g.animal.x + rnd(-g.animal.s * 0.4, g.animal.s * 0.4) + 'px';
      h.style.top = g.animal.y + rnd(-20, 40) + 'px';
      h.style.animationDelay = i * 0.12 + 's';
      document.getElementById('screen-feed').appendChild(h);
      setTimeout(() => h.remove(), 2000);
    }
  }

  /* ================================================================ 獎勵卡 */
  function goReveal() {
    F.stage = 'done';
    stopDrift();
    window.Metro.stop();
    clearTimers();
    const a = F.animal;
    if (!a) { C.go('explore'); return; }
    const total = clamp(Math.round((F.score.accuracy / 60) * 100), 0, 100);
    const stars = clamp(window.Game.scoreToStars(total), 0, 3);
    const facts = window.Game.starsToFacts(stars);
    const isNew = window.Profile.recordAnimal(a.id, stars, facts);
    try {
      const sess = window.Explore && window.Explore.state && window.Explore.state.session;
      if (sess) {
        const sp = sess.spots.find((x) => x.animal.id === a.id);
        if (sp) sp.visited = true;
      }
    } catch (e) {}
    window.Profile.spendFruits(Math.min(THROWS, window.Profile.fruits));
    window.Profile.refreshFruitBars(true);

    const rar = window.RARITY[a.rarity] || window.RARITY[1];
    const bg = $('#reveal-bg');
    if (bg) bg.style.background = `radial-gradient(120% 90% at 50% 26%, ${rar.color}66 0%, #2f2055 55%, #150e28 100%)`;
    const rb = $('#reveal-rarity');
    if (rb) {
      rb.textContent = '★'.repeat(a.rarity) + ' ' + rar.zh;
      rb.style.background = rar.color;
      rb.classList.toggle('legend', a.rarity >= 3);
    }
    const art = $('#reveal-art');
    if (art) art.innerHTML = window.Art.animal(a.id, { kind: 'hero' });
    const nm = $('#reveal-name');
    if (nm) nm.textContent = C.animalName(a);
    const en = $('#reveal-en');
    if (en) en.textContent = a.en;
    const st = $('#reveal-stars');
    if (st) st.innerHTML = C.starsSvg(stars, 3);
    const sc = $('#reveal-score');
    if (sc) sc.textContent = `魔法生果準確度 ${F.score.accuracy}/60 ＝ ${total} 分`;
    const fl = $('#reveal-facts');
    if (fl) {
      fl.innerHTML = '';
      a.facts.forEach((f, i) => {
        const unlocked = i < facts;
        const row = document.createElement('div');
        row.className = 'fact-row' + (unlocked ? '' : ' locked');
        row.style.animationDelay = (0.15 + i * 0.12) + 's';
        row.innerHTML = `<span class="fr-ico">${unlocked ? '💡' : '🔒'}</span><span>${unlocked ? C.escapeHtml(C.zh(f)) : '再餵多幾次，解鎖更多冷知識…'}</span>`;
        fl.appendChild(row);
        if (unlocked) later(() => { if (C.screen === 'reveal') A().play(`f/${a.id}/${i}`); }, 900 + i * 2800);
      });
    }
    let tag = $('#reveal-card-new');
    if (tag) tag.remove();
    if (isNew) {
      tag = document.createElement('div');
      tag.id = 'reveal-card-new';
      tag.className = 'reveal-newtag';
      tag.textContent = 'NEW!';
      $('.reveal-card').appendChild(tag);
    }
    C.go('reveal');
    A().fanfare();
    later(() => A().play(`a/${a.id}/${C.state.settings.speakLang}`), 700);
    later(() => A().play(a.rarity >= 3 ? 'p/zh-HK/rare-animal' : 'p/zh-HK/now-you-know'), 2400);
  }

  /* ================================================================== 輸入 */
  function bind() {
    const hitTap = (e) => {
      e.preventDefault();
      if (F.stage === 'beats') tapCircle();
    };
    const hit = $('#beat-hit');
    if (hit) {
      hit.addEventListener('pointerdown', hitTap, { passive: false });
    }
    const circle = $('#feed-circle');
    if (circle) {
      circle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (F.stage === 'throw') throwFruit(null);
        else if (F.stage === 'beats') tapCircle();
      }, { passive: false });
    }
    const canvas = $('#feed-canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        if (F.stage === 'throw') {
          const g = F.geo;
          if (!g) return;
          const x = e.clientX, y = e.clientY;
          if (Math.abs(x - g.cx) < g.r * 2.2 && Math.abs(y - g.cy) < g.r * 2) throwFruit({ x, y });
          else throwFruit(null);
        } else if (F.stage === 'beats') {
          tapCircle();
        }
      }, { passive: true });
    }
    const basket = $('#feed-basket');
    if (basket) {
      let drag = null;
      basket.addEventListener('pointerdown', (e) => {
        if (F.stage !== 'throw') return;
        drag = { x: e.clientX, y: e.clientY };
        basket.classList.add('pulling');
        e.preventDefault();
      }, { passive: false });
      const up = (e) => {
        if (!drag) return;
        const g = F.geo;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        basket.classList.remove('pulling');
        if (Math.abs(dy) > 26 && dy < 0) {
          const target = {
            x: clamp(g.cx + dx * 2.6, g.cx - g.r * 1.6, g.cx + g.r * 1.6),
            y: clamp(g.cy + dy * 1.2, g.cy - g.r * 1.1, g.cy + g.r * 1.1),
          };
          throwFruit(target);
        } else if (Math.hypot(dx, dy) < 20) {
          throwFruit(null);
        }
        drag = null;
      };
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', () => { drag = null; basket.classList.remove('pulling'); });
    }
    const ls = $('#rhythm-listen');
    if (ls) ls.addEventListener('click', () => { A().tap(); listenBeat(); });
    const st = $('#rhythm-start');
    if (st) st.addEventListener('click', () => { A().tap(); startBeats(); });

    const quit = $('#feed-quit');
    if (quit) quit.addEventListener('click', () => {
      window.Metro.stop();
      A().stop();
      C.go('place');
    });
    const next = $('#reveal-next');
    if (next) next.addEventListener('click', () => {
      A().stop();
      A().tap();
      C.go('place');
    });
    const again = $('#reveal-again');
    if (again) again.addEventListener('click', () => {
      A().stop();
      if (F.animal) start({ animal: F.animal });
    });
    window.addEventListener('resize', () => { if (C.screen === 'feed' && F.geo) applyGeo(); });
  }

  /* ================================================================== loop */
  function loop(ts) {
    F.raf = requestAnimationFrame(loop);
    if (!F.last) F.last = ts;
    const dt = Math.min(0.05, (ts - F.last) / 1000);
    F.last = ts;
    for (const f of F.fruits) {
      if (f.t >= 1) continue;
      f.t = Math.min(1, f.t + dt / f.dur);
      const k = f.t;
      const x = f.sx + (f.tx - f.sx) * k;
      const y = f.sy + (f.ty - f.sy) * k - Math.sin(k * Math.PI) * f.arc;
      const spin = k * 300;
      f.el.style.transform = `translate(${x - 18}px, ${y - 18}px) rotate(${spin}deg) scale(${1 + Math.sin(k * Math.PI) * 0.22})`;
    }
  }
  function startLoop() { cancelAnimationFrame(F.raf); F.last = 0; F.raf = requestAnimationFrame(loop); }
  function stopLoop() { cancelAnimationFrame(F.raf); F.raf = 0; }

  /* ================================================================ 註冊 */
  C.registerScreen('feed', {
    enter() {
      window.Game.hideTip();
      applyGeo();
      startLoop();
    },
    leave() {
      stopLoop();
      window.Metro.stop();
      clearTimers();
      A().stop();
      const t = $('#feed-tip'); if (t) t.classList.remove('show');
      const screen = document.getElementById('screen-feed');
      if (screen) screen.classList.remove('stage-throw', 'stage-ready', 'stage-beat', 'stage-tap', 'stage-eat');
      const panel = $('#rhythm-ready'); if (panel) panel.hidden = true;
      const hands = $('#beat-hands'); if (hands) hands.hidden = true;
      const basket = $('#feed-basket'); if (basket) basket.style.display = '';
      const cp = $('#count-pop'); if (cp) cp.classList.remove('show');
      F.fruits.forEach((f) => { try { f.el.remove(); } catch (e) {} });
      F.fruits = [];
    },
  });
  C.registerScreen('reveal', {
    enter() { window.Game.hideTip(); },
    leave() { A().stop(); },
  });

  document.addEventListener('DOMContentLoaded', () => { bind(); applyGeo(); });
  window.addEventListener('resize', () => { if (C.screen === 'feed') applyGeo(); });

  window.Feed = { start, F };
})();
