/* =========================================================================
 *  core.js — 狀態管理、畫面切換、小工具
 * ========================================================================= */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (min, max) => min + Math.random() * (max - min);
  const rndInt = (min, max) => Math.floor(rnd(min, max + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ------------------------------------------------------------------ state */
  const KEY = 'lucian.magicworld.v1';
  const DEFAULTS = {
    version: 1,
    settings: {
      speakLang: 'yue',        // yue 粵語 / man 普通話 / en English
      textLang: 'zh',          // zh 中文 / en English
      rate: 0.9,               // 語速（對小朋友慢啲）
      tempo: 90,               // 第二部分拍子 BPM
      topics: ['animal', 'fruit', 'vehicle', 'body'],
      sfx: true,
      autoNext: true,
      easyMode: true,          // 答錯可再試，唔扣魔法生果
    },
    progress: {
      fruits: 3,               // 目前身上嘅魔法生果
      fruitsLifetime: 0,
      collected: {},           // animalId -> { stars, times, facts, firstAt, lastAt }
      quizzes: 0,
      correct: 0,
      feedings: 0,
    },
    flags: {},
  };

  function deepMerge(base, over) {
    if (!over || typeof over !== 'object') return base;
    const out = Array.isArray(base) ? base.slice() : { ...base };
    for (const k of Object.keys(over)) {
      const v = over[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], v);
      } else if (v !== undefined) {
        out[k] = v;
      }
    }
    return out;
  }

  let state = deepMerge(DEFAULTS, {});

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = deepMerge(DEFAULTS, JSON.parse(raw));
    } catch (e) { console.warn('load failed', e); }
    // 基本校正
    const s = state.settings;
    if (!['yue', 'man', 'en'].includes(s.speakLang)) s.speakLang = 'yue';
    if (!['zh', 'zhs', 'en'].includes(s.textLang)) s.textLang = 'zh';
    s.rate = clamp(Number(s.rate) || 0.9, 0.6, 1.2);
    s.tempo = clamp(Number(s.tempo) || 90, 60, 120);
    if (!Array.isArray(s.topics) || !s.topics.length) s.topics = DEFAULTS.settings.topics.slice();
    const p = state.progress;
    p.fruits = clamp(Number(p.fruits) || 0, 0, 999);
    if (!p.collected || typeof p.collected !== 'object') p.collected = {};
    return state;
  }

  let saveTimer = null, savePending = false;
  function save() {
    savePending = true;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      savePending = false;
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { console.warn('save failed', e); }
    }, 120);
  }
  function saveNow() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------------------------------------------------------------- screens */
  let currentScreen = null;
  const screenStack = [];
  const screenHooks = {}; // id -> enter/leave

  function registerScreen(id, hooks) { screenHooks[id] = hooks || {}; }

  function go(id, opts) {
    opts = opts || {};
    if (currentScreen === id && !opts.force) {
      const h = screenHooks[id];
      if (h && h.enter) h.enter(opts);
      return;
    }
    const prev = currentScreen;
    if (prev) {
      const ph = screenHooks[prev];
      if (ph && ph.leave) { try { ph.leave(); } catch (e) { console.warn(e); } }
      const el = document.getElementById('screen-' + prev);
      if (el) { el.classList.remove('active'); el.setAttribute('aria-hidden', 'true'); }
    }
    currentScreen = id;
    screenStack.length = 0;
    const el = document.getElementById('screen-' + id);
    if (!el) { console.warn('no screen', id); return; }
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    if (location.hash !== '#' + id) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
    const h = screenHooks[id];
    if (h && h.enter) { try { h.enter(opts); } catch (e) { console.error(e); } }
    // 每次轉畫面之後套用顯示語言
    try { if (window.I18N && window.I18N.applyLang) setTimeout(() => window.I18N.applyLang(), 0); } catch (e) {}
  }

  /**
   * 每個畫面固定嘅「上一層」——咁樣返上一頁永遠可預測，
   * 唔會因為之前去過邊度而跳去奇怪嘅畫面。
   */
  const PARENT = {
    home: null,
    learn: 'home',
    quiz: 'learn',
    result: 'learn',
    explore: 'home',
    place: 'explore',
    feed: 'place',
    reveal: 'place',
    album: 'home',
    settings: 'home',
  };

  function back_(fallback) {
    const p = PARENT[currentScreen];
    screenStack.length = 0;
    const target = p || fallback || 'home';
    if (target === currentScreen) return;
    go(target, { replace: true });
  }

  /* ------------------------------------------------------------------ popup */
  function popup(html, opts) {
    opts = opts || {};
    const layer = document.getElementById('layer-popup');
    const p = document.createElement('div');
    p.className = 'popup ' + (opts.cls || '');
    p.innerHTML = html;
    layer.appendChild(p);
    layer.classList.add('show');
    requestAnimationFrame(() => p.classList.add('in'));
    const close = (result) => {
      p.classList.remove('in');
      p.classList.add('out');
      setTimeout(() => {
        p.remove();
        if (!layer.children.length) layer.classList.remove('show');
      }, 220);
      if (opts.onClose) opts.onClose(result);
    };
    if (opts.dismissible !== false) {
      p.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || (!opts.noBackdrop && e.target === p)) close(false);
      });
      // 點背景（layer）都閂
      layer.addEventListener('click', (e) => {
        if (e.target === layer) close(false);
      }, { once: true });
    }
    return { el: p, close };
  }

  function confirmPopup(text, okText, cb) {
    return popup(
      `<div class="popup-card">
         <p class="popup-text">${text}</p>
         <div class="popup-actions">
           <button class="btn ghost" data-close>取消</button>
           <button class="btn primary" data-ok>${okText || '好'}</button>
         </div>
       </div>`,
      {
        onClose: (r) => {},
        cls: 'center',
        noBackdrop: false,
      }
    );
  }

  /* ------------------------------------------------------------------ toast */
  let toastEl = null, toastTimer = null;
  function toast(msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.getElementById('layer-toast').appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 1600);
  }

  /* ------------------------------------------------------------------- text */
  // 依語言俾字詞：zh（繁）/ zhs（簡）/ en
  function zh(text) {
    const s = text == null ? '' : String(text);
    if (state.settings.textLang === 'zhs' && window.toSimp) return window.toSimp(s);
    return s;
  }
  function T(item) {
    if (!item) return '';
    if (state.settings.textLang === 'en') return item.en || item.zh;
    return zh(item.zh || item.en);
  }
  /** 動物名：英／繁／簡 */
  function animalName(a) {
    if (!a) return '';
    if (state.settings.textLang === 'en') return a.en || a.zh;
    return zh(a.zh || a.en);
  }
  /** 地點名 */
  function placeName(loc) {
    if (!loc) return '';
    if (state.settings.textLang === 'en') return loc.en || loc.zh;
    return zh(loc.zh || loc.en);
  }
  function speakKeyOf(item, kind) {
    // kind: 'audio' — 用邊個語言發音
    const lang = state.settings.speakLang;
    return 'v/' + item.topicId + '/' + item.index + '/' + lang;
  }
  const isEnSpeak = () => state.settings.speakLang === 'en';

  /* ------------------------------------------------------------------- misc */
  function haptic() {
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
  }
  function fmt(n) { return n && n.toLocaleString ? n.toLocaleString('en-US') : String(n); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function starsSvg(n, max, cls) {
    max = max || 5;
    let out = '';
    for (let i = 0; i < max; i++) {
      out += `<svg class="star ${i < n ? 'on' : 'off'} ${cls || ''}" viewBox="0 0 24 24"><path d="M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9z"/></svg>`;
    }
    return `<span class="stars">${out}</span>`;
  }

  /* 簡單事件巴士 */
  const bus = {
    map: new Map(),
    on(evt, fn) {
      if (!this.map.has(evt)) this.map.set(evt, new Set());
      this.map.get(evt).add(fn);
      return () => this.off(evt, fn);
    },
    off(evt, fn) { const s = this.map.get(evt); if (s) s.delete(fn); },
    emit(evt, data) { const s = this.map.get(evt); if (s) s.forEach((fn) => { try { fn(data); } catch (e) { console.warn(e); } }); },
  };

  /* ------------------------------------------------------- 全局導航按鈕 */
  function bindNav() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const back = t.closest('[data-back]');
      if (back) {
        e.preventDefault();
        try { window.AudioKit && window.AudioKit.stop(); } catch (err) {}
        try { window.Metro && window.Metro.stop(); } catch (err) {}
        try { window.AudioKit && window.AudioKit.stopAmbient(); } catch (err) {}
        const dest = back.getAttribute('data-back');
        if (dest && dest !== currentScreen) go(dest, { replace: true });
        else back_();
        return;
      }
      const goBtn = t.closest('[data-go]');
      if (goBtn) {
        e.preventDefault();
        try { window.AudioKit && window.AudioKit.tap(); } catch (err) {}
        try { haptic(); } catch (err) {}
        const id = goBtn.getAttribute('data-go');
        if (id === currentScreen) return;
        window.Core.go(id);
      }
    }, true);
  }
  bindNav();

  window.Core = {
    $, $$, sleep, rnd, rndInt, pick, clamp, shuffle, uid,
    get state() { return state; },
    load, save, saveNow, DEFAULTS, KEY,
    go, back: back_, registerScreen, popup, confirmPopup, toast, T, zh, animalName, placeName, speakKeyOf, isEnSpeak,
    haptic, fmt, escapeHtml, starsSvg, bus,
    get screen() { return currentScreen; },
  };
})();
