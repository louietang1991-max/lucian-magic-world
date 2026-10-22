/* =========================================================================
 *  music.js — 背景音樂（Web Audio 即時合成，冇版權問題、唔使下載檔案）
 *  設定：settings.music（開關）／settings.musicVol（0–1）
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;

  /* C 大調五聲音階（好聽、唔會刺耳） */
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
  const CHORDS = [
    [261.63, 329.63, 392.0],   // C
    [293.66, 349.23, 440.0],   // Dm
    [349.23, 440.0, 523.25],   // F
    [392.0, 493.88, 587.33],   // G
  ];

  const Music = {
    playing: false,
    _timer: null,
    _next: 0,
    _step: 0,
    _nodes: [],

    get ctx() { return window.AudioKit && window.AudioKit.ctx; },

    _gain() {
      const A = window.AudioKit;
      if (!A || !A.musicBus) return null;
      return A.musicBus;
    },

    setVolume(v) {
      const bus = this._gain();
      if (bus) bus.gain.value = Math.max(0, Math.min(1, v));
    },

    start() {
      const s = C.state.settings;
      if (!s.music) return;
      const ctx = this.ctx;
      if (!ctx) return;
      this.setVolume(s.musicVol == null ? 0.35 : s.musicVol);
      if (this.playing) return;
      this.playing = true;
      this._next = ctx.currentTime + 0.15;
      this._step = 0;
      this._tick();
    },

    stop() {
      this.playing = false;
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      const bus = this._gain();
      if (bus) {
        try {
          const t = bus.gain;
          const now = this.ctx ? this.ctx.currentTime : 0;
          t.cancelScheduledValues(now);
          t.setValueAtTime(t.value, now);
          t.linearRampToValueAtTime(0.0001, now + 0.5);
          const s = C.state.settings;
          setTimeout(() => { if (!this.playing) t.value = s.musicVol == null ? 0.35 : s.musicVol; }, 600);
        } catch (e) {}
      }
    },

    _note(freq, at, dur, gainVal, type) {
      const ctx = this.ctx;
      const bus = this._gain();
      if (!ctx || !bus) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gainVal, at + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g).connect(bus);
      o.start(at);
      o.stop(at + dur + 0.05);
      this._nodes.push(o);
      if (this._nodes.length > 80) this._nodes.splice(0, 40);
    },

    /* 每 0.5 秒一個音，8 拍一個和弦 */
    _tick() {
      if (!this.playing) return;
      const ctx = this.ctx;
      if (!ctx) { this.playing = false; return; }
      const lookahead = 0.6;
      while (this._next < ctx.currentTime + lookahead) {
        const at = this._next;
        const step = this._step % 16;
        const bar = Math.floor(this._step / 16) % CHORDS.length;
        /* 柔和和弦墊底（每小節第一拍） */
        if (step === 0) {
          const ch = CHORDS[bar];
          ch.forEach((f, i) => this._note(f / 2, at, 2.2, 0.05 - i * 0.008, 'sine'));
        }
        /* 主旋律：五聲音階，輕輕跳 */
        const pattern = [0, 2, 4, 3, 5, 4, 2, 1];
        if (step % 2 === 0) {
          const idx = (pattern[(step / 2) % pattern.length] + bar) % SCALE.length;
          this._note(SCALE[idx], at, 0.9, 0.055, 'triangle');
        }
        /* 高音裝飾（第 4、12 拍） */
        if (step === 6 || step === 14) this._note(SCALE[5] * 2, at, 0.5, 0.025, 'sine');
        this._next += 0.5;
        this._step++;
      }
      this._timer = setTimeout(() => this._tick(), 200);
    },
  };

  window.Music = Music;

  /* 第一次觸碰之後開音樂 */
  function boot() {
    const s = C.state.settings;
    if (s.music) setTimeout(() => Music.start(), 900);
  }
  document.addEventListener('pointerdown', function once() {
    document.removeEventListener('pointerdown', once);
    const A = window.AudioKit;
    if (A && A.unlock) { try { A.unlock(); } catch (e) {} }
    setTimeout(boot, 400);
  }, { passive: true });

  /* 切去背景就停，返嚟再開 */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) Music.stop();
    else if (C.state.settings.music) Music.start();
  });
})();
