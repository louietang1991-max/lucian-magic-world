/* =========================================================================
 *  screen-feed.js — 第二部分核心：餵食（掟生果入圈）+ 節拍點擊 + 獎勵卡
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, clamp, rnd, rndInt, pick, sleep } = C;
  const A = () => window.AudioKit;

  const THROWS = 3;
  const BEATS = 4;

  const F = {
    animal: null,
    stage: 'idle',          // throw → countin → beats → eat → done
    geo: null,
    fruits: [],             // 飛緊／落地
    score: { accuracy: 0, rhythm: 0 },
    throwCount: 0,
    beatTaps: new Array(BEATS).fill(null),
    taps: 0,
    perfect: 0,
    raf: 0,
    last: 0,
    timers: [],
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
      animal: { x: W / 2, y: Math.max(H * 0.225, 140), s: Math.min(W * 0.66, H * 0.30) },
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
    F.throwCount = 0;
    F.beatTaps = new Array(BEATS).fill(null);
    F.taps = 0;
    F.perfect = 0;
    clearTimers();
    window.Profile.ensureFruits(THROWS);

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
    }, 80);
  }

  function renderTop() {
    const t = $('#feed-title');
    if (t) t.textContent = '餵 ' + (F.animal ? F.animal.zh : '動物');
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
    dots.innerHTML = '';
    for (let i = 0; i < BEATS; i++) {
      const d = document.createElement('i');
      d.className = 'beat-dot';
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
    if (target) to = target;
    else {
      const rr = g.r * (Math.random() < 0.62 ? rnd(0.1, 0.32) : rnd(0.35, 0.72));
      const a = rnd(0, Math.PI * 2);
      to = { x: g.cx + Math.cos(a) * rr, y: g.cy + Math.sin(a) * rr * 0.55 };
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
      const dx = to.x - g.cx;
      const dy = (to.y - g.cy) / 0.55;
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
        later(startCountIn, 800);
        if (hint) hint.textContent = '準備跟拍子…';
      } else {
        later(() => { if (F.stage === 'throw') { tip('再掟多一個！', 1100); if (hint) hint.textContent = '將魔法生果掟入圈圈！'; } }, 520);
      }
    }, obj.dur * 1000);
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
  function startCountIn() {
    if (F.stage !== 'throw') return;
    F.stage = 'countin';
    const screen = document.getElementById('screen-feed');
    if (screen) { screen.classList.remove('stage-throw'); screen.classList.add('stage-beat'); }
    $$('#beat-dots .beat-dot').forEach((d) => (d.className = 'beat-dot count'));
    const hint = $('#feed-hint');
    if (hint) hint.textContent = '跟住個圈，準備數拍子…';
    tip('跟住個圈嘅拍子！', 2400);
    A().play('p/zh-HK/drum-time');
    later(() => {
      if (F.stage === 'done') return;
      const bpm = C.state.settings.tempo || 90;
      window.Metro.start({
        bpm,
        countIn: BEATS,
        beats: BEATS,
        window: 0.34,
        onBeat,
        onEnd: onRhythmEnd,
      });
      const h = $('#feed-hint');
      if (h) h.textContent = '準備數拍子：一、二、三、四…';
      A().play('p/zh-HK/ready-count');
    }, 1400);
  }

  function onBeat(i, isCountIn) {
    const dots = $$('#beat-dots .beat-dot');
    circlePulse();
    if (isCountIn) {
      F.stage = 'countin';
      dots.forEach((d, k) => { d.className = 'beat-dot count' + (k === i % BEATS ? ' now' : ''); });
      A().countIn(i % 4 === 0 ? 1 : 2);
      const c = $('#feed-circle');
      if (c) c.classList.add('count');
    } else {
      if (F.stage !== 'beats') {
        F.stage = 'beats';
        const screen = document.getElementById('screen-feed');
        if (screen) { screen.classList.remove('stage-beat'); screen.classList.add('stage-tap'); }
        const hint = $('#feed-hint');
        if (hint) hint.textContent = '撳個圈！跟住拍子！';
        tip('撳圈圈！', 1500);
        A().play('p/zh-HK/tap-now');
        const c = $('#feed-circle');
        if (c) c.classList.remove('count');
        const lb = $('#fc-label');
        if (lb) lb.textContent = '撳';
      }
      const k = i - BEATS;
      dots.forEach((d, idx) => {
        d.className = 'beat-dot' + (idx === k ? ' now' : (F.beatTaps[idx] != null ? ' hit' : ''));
      });
      A().beat(i % 4 === 0 ? 1400 : 1200);
    }
  }

  function tapCircle() {
    if (F.stage === 'throw') { throwFruit(null); return; }
    if (F.stage !== 'beats') return;
    const rate = window.Metro.rateNow();
    let pts = 0, label = '', good = false;
    if (rate.dist <= 0.08) { pts = 10; label = 'PERFECT!'; good = true; F.perfect++; }
    else if (rate.dist <= 0.15) { pts = 7; label = 'GREAT!'; good = true; }
    else if (rate.dist <= 0.23) { pts = 4; label = 'GOOD'; good = true; }
    else if (rate.dist <= 0.34) { pts = 2; label = 'OK'; }
    else { label = '再試吓'; }
    F.taps++;
    const beat = clamp(rate.beat - BEATS, 0, BEATS - 1);
    if (pts > (F.beatTaps[beat] == null ? -1 : F.beatTaps[beat])) F.beatTaps[beat] = pts;
    F.score.rhythm += pts;
    C.haptic();
    A().tap();
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
    if (dots[beat] && pts > 0) dots[beat].className = 'beat-dot hit';
  }

  function onRhythmEnd() {
    if (F.stage === 'done') return;
    F.stage = 'eat';
    const screen = document.getElementById('screen-feed');
    if (screen) { screen.classList.remove('stage-tap'); screen.classList.add('stage-eat'); }
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
    window.Metro.stop();
    clearTimers();
    const a = F.animal;
    if (!a) { C.go('explore'); return; }
    const total = clamp(Math.round(F.score.accuracy + F.score.rhythm), 0, 100);
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
    if (art) art.innerHTML = window.Art.animal(a.id);
    const nm = $('#reveal-name');
    if (nm) nm.textContent = a.zh;
    const en = $('#reveal-en');
    if (en) en.textContent = a.en;
    const st = $('#reveal-stars');
    if (st) st.innerHTML = C.starsSvg(stars, 3);
    const sc = $('#reveal-score');
    if (sc) sc.textContent = `掟生果 ${F.score.accuracy}/60 分 ＋ 拍子 ${F.score.rhythm}/40 分 ＝ ${total} 分`;
    const fl = $('#reveal-facts');
    if (fl) {
      fl.innerHTML = '';
      a.facts.forEach((f, i) => {
        const unlocked = i < facts;
        const row = document.createElement('div');
        row.className = 'fact-row' + (unlocked ? '' : ' locked');
        row.style.animationDelay = (0.15 + i * 0.12) + 's';
        row.innerHTML = `<span class="fr-ico">${unlocked ? '💡' : '🔒'}</span><span>${unlocked ? C.escapeHtml(f) : '再餵多幾次，解鎖更多冷知識…'}</span>`;
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
      if (screen) screen.classList.remove('stage-throw', 'stage-beat', 'stage-tap', 'stage-eat');
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
