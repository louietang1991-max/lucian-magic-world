/* =========================================================================
 *  audio.js — 語音播放（預先產生嘅 MP3）+ 音效合成（Web Audio）
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const MANIFEST_URL = 'assets/audio/manifest.json';

  const AudioKit = {
    manifest: {},
    ready: false,
    unlocked: false,
    muted: false,
    _cur: null,        // 現在播放緊嘅 Audio
    _token: 0,
    _cache: new Map(), // key -> Audio （池）
    _ctx: null,
    _master: null,
    _musicGain: null,
    _sfxGain: null,
    _speechOK: true,
    onUnlock: [],

    /* ------------------------------------------------------------- manifest */
    async init() {
      try {
        const res = await fetch(MANIFEST_URL, { cache: 'force-cache' });
        if (!res.ok) throw new Error('manifest ' + res.status);
        const json = await res.json();
        this.manifest = {};
        for (const k of Object.keys(json)) this.manifest[k] = { f: json[k].f || json[k], t: json[k].t };
        this.ready = true;
      } catch (e) {
        // 後備：用打包好嘅清單（file:// 或離線首次）
        const fb = window.__AUDIO_MANIFEST;
        if (fb) {
          this.manifest = {};
          for (const k of Object.keys(fb)) this.manifest[k] = { f: fb[k] };
          this.ready = true;
          console.warn('[audio] using bundled manifest');
        } else {
          console.warn('[audio] manifest load failed, fallback to speechSynthesis', e);
          this.ready = false;
          this.manifest = {};
        }
      }
      // 背景預載一部分（唔好阻住開機）
      setTimeout(() => this.preloadCommon(), 600);
      return this.ready;
    },

    url(key) {
      const m = this.manifest[key];
      return m ? m.f : null;
    },

    has(key) { return !!this.url(key); },

    /** cache 上限：最多記住 90 個 Audio 元素 */
    _cacheSet(key, a) {
      if (!this._cache.has(key) && this._cache.size >= 90) {
        const first = this._cache.keys().next().value;
        const old = this._cache.get(first);
        try { old.pause(); old.removeAttribute('src'); old.load(); } catch (e) {}
        this._cache.delete(first);
      }
      this._cache.set(key, a);
    },

    preloadCommon() {
      const keys = Object.keys(this.manifest).filter((k) => k.startsWith('p/zh-HK/'));
      this.preload(keys, 2);
    },

    /** 逐個預載（限制同時連線數） */
    preload(keys, conc) {
      conc = conc || 3;
      const queue = keys.filter((k) => this.url(k) && !this._cache.has(k));
      let active = 0, i = 0;
      const next = () => {
        while (active < conc && i < queue.length) {
          const k = queue[i++];
          active++;
          const a = new Audio();
          a.preload = 'auto';
          a.src = this.url(k);
          a.addEventListener('canplaythrough', () => { active--; next(); }, { once: true });
          a.addEventListener('error', () => { active--; next(); }, { once: true });
          this._cacheSet(k, a);
          try { a.load(); } catch (e) {}
        }
      };
      next();
    },

    /* ---------------------------------------------------------------- unlock */
    unlock() {
      if (this.unlocked) return;
      this.unlocked = true;
      this.ensureCtx();
      if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
      // iOS / Safari 解鎖：喺 gesture 入面播一段無聲 audio
      try {
        const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=');
        a.volume = 0.01;
        const pr = a.play();
        if (pr && pr.catch) pr.catch(() => {});
      } catch (e) {}
      // 解鎖 speechSynthesis
      try {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(' ');
          u.volume = 0;
          speechSynthesis.speak(u);
        }
      } catch (e) {}
      this.onUnlock.forEach((fn) => { try { fn(); } catch (e) {} });
      this.onUnlock.length = 0;
    },

    onFirstGesture() {
      if (this._gestureBound) return;
      this._gestureBound = true;
      const h = () => {
        this.unlock();
        window.removeEventListener('pointerdown', h, true);
        window.removeEventListener('keydown', h, true);
      };
      window.addEventListener('pointerdown', h, true);
      window.addEventListener('keydown', h, true);
    },

    /* ------------------------------------------------------------------ ctx */
    ensureCtx() {
      if (this._ctx) return this._ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        this._ctx = new AC();
        this._master = this._ctx.createGain();
        this._master.gain.value = 0.9;
        this._master.connect(this._ctx.destination);
        this._sfxGain = this._ctx.createGain();
        this._sfxGain.gain.value = C.state.settings.sfx ? 1 : 0;
        this._sfxGain.connect(this._master);
        this._musicGain = this._ctx.createGain();
        this._musicGain.gain.value = 0.5;
        this._musicGain.connect(this._master);
      } catch (e) { console.warn('audioctx', e); }
      return this._ctx;
    },
    get now() { return this._ctx ? this._ctx.currentTime : performance.now() / 1000; },
    get ctx() { this.ensureCtx(); return this._ctx; },
    get sfxBus() { this.ensureCtx(); return this._sfxGain; },
    get musicBus() { this.ensureCtx(); return this._musicGain; },

    setSfx(on) {
      if (this._sfxGain) this._sfxGain.gain.value = on ? 1 : 0;
    },

    /* ----------------------------------------------------------------- speak */
    /**
     * 播放一段語音。回傳 Promise（播完 / 中斷都會 resolve）
     * opts: { wait:true, rate, queue:false, fallbackText, lang }
     */
    async play(key, opts) {
      opts = opts || {};
      if (this.muted) return;
      if (!opts.queue) this.stop();
      // 注意：token 一定要喺 stop() 之後攞，否則會被自己 stop 走
      const token = ++this._token;

      const url = this.url(key);
      if (url) {
        await new Promise((resolve) => {
          let a = this._cache.get(key);
          if (!a) {
            a = new Audio(url);
            a.preload = 'auto';
            this._cacheSet(key, a);
          }
          try { a.currentTime = 0; } catch (e) {}
          a.volume = 1;
          a.playbackRate = opts.rate || C.state.settings.rate || 1;
          this._cur = a;
          let done = false;
          const fin = () => { if (done) return; done = true; if (this._cur === a) this._cur = null; resolve(); };
          a.addEventListener('ended', fin, { once: true });
          a.addEventListener('error', fin, { once: true });
          a.addEventListener('stalled', () => {}, { once: true });
          const tmo = setTimeout(fin, opts.timeout || 9000);
          a.play().then(() => {
            // 播到一半被換走
            const watch = setInterval(() => {
              if (token !== this._token && !done) { clearInterval(watch); clearTimeout(tmo); a.pause(); fin(); }
            }, 120);
            a.addEventListener('ended', () => { clearInterval(watch); clearTimeout(tmo); }, { once: true });
          }).catch(() => { fin(); });
        });
        return;
      }
      // fallback: 瀏覽器 TTS
      if (opts.fallbackText && this._speechOK) {
        await this.say(opts.fallbackText, opts);
      }
    },

    /** 只停語音（唔停音效） */
    stop() {
      this._token++;
      if (this._cur) { try { this._cur.pause(); } catch (e) {} this._cur = null; }
      try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    },

    /** 瀏覽器內建語音（後備） */
    say(text, opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) { resolve(); return; }
        try {
          const u = new SpeechSynthesisUtterance(text);
          const lang = opts.lang || (C.state.settings.speakLang === 'en' ? 'en-US' : C.state.settings.speakLang === 'man' ? 'zh-CN' : 'zh-HK');
          u.lang = lang;
          u.rate = clampRate((opts.rate || C.state.settings.rate || 1) * 0.95);
          u.pitch = 1.15;
          const voices = speechSynthesis.getVoices();
          const v = voices.find((x) => x.lang === lang) || voices.find((x) => x.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
          if (v) u.voice = v;
          let done = false;
          const fin = () => { if (done) return; done = true; resolve(); };
          u.onend = fin; u.onerror = fin;
          setTimeout(fin, opts.timeout || 8000);
          speechSynthesis.speak(u);
        } catch (e) { resolve(); }
      });
    },

    speechLang() {
      const l = C.state.settings.speakLang;
      return l === 'en' ? 'en-US' : l === 'man' ? 'zh-CN' : 'zh-HK';
    },

    /* ------------------------------------------------------------- sfx kit */
    _tone(freq, dur, type, gain, when, opts) {
      const ctx = this.ctx; if (!ctx) return;
      opts = opts || {};
      const t = when != null ? when : ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, opts.slideTo), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.2), t + (opts.attack || 0.008));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(opts.bus || this.sfxBus);
      o.start(t);
      o.stop(t + dur + 0.02);
      return o;
    },

    melody(notes, opts) {
      opts = opts || {};
      const ctx = this.ctx; if (!ctx) return;
      let t = ctx.currentTime + (opts.delay || 0);
      const beat = opts.beat || 0.12;
      notes.forEach((n) => {
        if (n) this._tone(n, opts.len || beat * 1.6, opts.type || 'triangle', opts.gain || 0.16, t, { bus: opts.bus });
        t += n && n[1] === '-' ? beat * 2 : beat;
      });
    },

    tap() { this._tone(880, 0.07, 'sine', 0.14, null, { slideTo: 1320 }); },
    pop() { this._tone(520, 0.09, 'sine', 0.18, null, { slideTo: 880 }); },
    tick() { this._tone(1800, 0.035, 'square', 0.05); },
    correct() { this.melody([784, 988, 1319], { beat: 0.085, type: 'triangle', gain: 0.17 }); },
    wrong() { this.melody([392, 330], { beat: 0.11, type: 'sine', gain: 0.15 }); },
    coin() { this.melody([1319, 1568, 2093], { beat: 0.06, type: 'square', gain: 0.08 }); },
    star() { this.melody([1047, 1319, 1568, 2093], { beat: 0.07, type: 'triangle', gain: 0.13 }); },
    fanfare() { this.melody([523, 659, 784, 1047, 1319], { beat: 0.13, type: 'triangle', gain: 0.17 }); },
    whoosh() {
      const ctx = this.ctx; if (!ctx) return;
      const dur = 0.28;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
      f.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + dur);
      const g = ctx.createGain(); g.gain.value = 0.18;
      src.connect(f).connect(g).connect(this.sfxBus);
      src.start();
    },
    crunch() {
      const ctx = this.ctx; if (!ctx) return;
      for (let k = 0; k < 3; k++) {
        const dur = 0.06;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400 + Math.random() * 900;
        const g = ctx.createGain(); g.gain.value = 0.16;
        src.connect(f).connect(g).connect(this.sfxBus);
        src.start(ctx.currentTime + k * 0.075);
      }
      this._tone(300, 0.12, 'sine', 0.1, null, { slideTo: 160 });
    },
    splat() {
      const ctx = this.ctx; if (!ctx) return;
      this._tone(220, 0.16, 'sine', 0.2, null, { slideTo: 90 });
      const o = this._tone(660, 0.08, 'triangle', 0.08);
    },
    land() { this._tone(160, 0.12, 'sine', 0.16, null, { slideTo: 70 }); },
    beat(pitch) {
      // 拍子聲：高音 click
      this._tone(pitch || 1200, 0.05, 'square', 0.09);
      this._tone((pitch || 1200) / 2, 0.09, 'sine', 0.12);
    },
    countIn(i) { this.melody([i === 1 ? 880 : 660], { beat: 0.1, type: 'square', gain: 0.12 }); },
    levelUp() { this.melody([523, 659, 784, 1047], { beat: 0.1, type: 'square', gain: 0.12 }); },

    /* 環境音（輕輕嘅海浪聲） */
    _amb: null,
    ambient(type) {
      const ctx = this.ctx; if (!ctx) return;
      this.stopAmbient();
      try {
        const dur = 2.5;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < d.length; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.2;
        }
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = type === 'underwater' ? 380 : 800;
        const g = ctx.createGain(); g.gain.value = 0.0;
        src.connect(f).connect(g).connect(this.musicBus);
        src.start();
        g.gain.linearRampToValueAtTime(type ? 0.10 : 0.07, ctx.currentTime + 1.2);
        this._amb = { src, g };
      } catch (e) {}
    },
    stopAmbient() {
      if (!this._amb) return;
      const { src, g } = this._amb;
      try {
        g.gain.linearRampToValueAtTime(0.0001, this.now + 0.4);
        src.stop(this.now + 0.45);
      } catch (e) {}
      this._amb = null;
    },
  };

  function clampRate(r) { return Math.max(0.5, Math.min(2, r)); }

  window.AudioKit = AudioKit;
})();
