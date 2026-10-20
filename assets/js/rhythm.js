/* =========================================================================
 *  rhythm.js — 節拍器（Web Audio 精準排程）
 * ========================================================================= */
(function () {
  'use strict';

  const Metro = {
    bpm: 90,
    running: false,
    startAt: 0,          // AudioContext 時間（第 1 拍）
    countIn: 0,          // 有幾多拍係數拍（唔計分）
    totalBeats: 0,
    onBeat: null,        // (beatIndex, isCountIn) => void
    onEnd: null,
    _timer: null,
    _next: 0,
    _idx: 0,
    _ctx: null,
    _originPerf: 0,      // performance.now/1000 對應 ctx 時間嘅原點
    _tapWindow: 0.30,    // 拍子容許誤差（秒）

    /** 開始：countIn 拍數拍 + beats 拍計分 */
    start(opts) {
      opts = opts || {};
      const ctx = window.AudioKit.ctx;
      if (!ctx) return false;
      this.stop();
      this._ctx = ctx;
      this.bpm = opts.bpm || 90;
      this.countIn = opts.countIn != null ? opts.countIn : 4;
      this.totalBeats = opts.beats != null ? opts.beats : 4;
      this.onBeat = opts.onBeat || null;
      this.onEnd = opts.onEnd || null;
      this._tapWindow = opts.window || 0.30;
      const spb = 60 / this.bpm;
      this.startAt = ctx.currentTime + 0.25;
      this._originPerf = performance.now() / 1000 - ctx.currentTime; // 用嚟換算
      this._spb = spb;
      this._next = this.startAt;
      this._idx = 0;
      this.running = true;
      const total = this.countIn + this.totalBeats;
      const tick = () => {
        if (!this.running) return;
        const horizon = ctx.currentTime + 0.12;
        while (this._idx < total && this._next < horizon) {
          const i = this._idx;
          const isCountIn = i < this.countIn;
          const when = this._next;
          this._scheduleSound(when, isCountIn, i, spb);
          this._scheduleCb(when, () => {
            if (!this.running) return;
            if (this.onBeat) { try { this.onBeat(i, isCountIn); } catch (e) { console.warn(e); } }
          });
          this._idx++;
          this._next += spb;
        }
        if (this._idx >= total) {
          // 最後一拍後等一陣再收工
          const endAt = this._next + 0.1;
          const delay = Math.max(0, endAt - ctx.currentTime);
          setTimeout(() => {
            if (!this.running) return;
            this.running = false;
            clearInterval(this._timer);
            if (this.onEnd) { try { this.onEnd(); } catch (e) { console.warn(e); } }
          }, delay * 1000);
          clearInterval(this._timer);
        }
      };
      this._timer = setInterval(tick, 25);
      tick();
      return true;
    },

    _scheduleSound(when, isCountIn, i, spb) {
      const A = window.AudioKit;
      const ctx = this._ctx;
      try {
        const accent = i % 4 === 0;
        A._tone(isCountIn ? (accent ? 880 : 660) : (accent ? 1320 : 1100), 0.08, 'triangle', isCountIn ? 0.09 : 0.13, when);
        A._tone((isCountIn ? (accent ? 440 : 330) : (accent ? 660 : 550)), 0.1, 'sine', isCountIn ? 0.07 : 0.1, when);
      } catch (e) {}
    },

    _scheduleCb(when, fn) {
      const ctx = this._ctx;
      const delay = Math.max(0, when - ctx.currentTime);
      setTimeout(fn, delay * 1000);
    },

    stop() {
      this.running = false;
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    },

    /** 而家係第幾拍（可能係小數） */
    position() {
      const ctx = this._ctx;
      if (!ctx || !this.running) return -1;
      return (ctx.currentTime - this.startAt) / this._spb;
    },

    /** 距離下一拍仲有幾多秒（負數 = 過咗） */
    toNext() {
      const ctx = this._ctx;
      if (!ctx || !this.running) return 99;
      const p = this.position();
      const next = Math.ceil(p);
      return (next - p) * this._spb;
    },

    /** 距離最近一拍嘅誤差（秒，絕對值） */
    offset() {
      const ctx = this._ctx;
      if (!ctx || !this.running) return 99;
      const p = this.position();
      if (p < 0) return 99;
      const frac = p - Math.floor(p);
      return Math.min(frac, 1 - frac) * this._spb;
    },

    /** 事件時間轉 AudioContext 時間 */
    eventTime(ev) {
      const ctx = this._ctx;
      if (!ctx) return 0;
      // ev.timeStamp 係 performance.now 基準（毫秒）
      return (ev.timeStamp || performance.now()) / 1000 - this._originPerf;
    },

    /** 計分：用 AudioContext 時間判斷離最近一拍幾遠 */
    rateAt(t) {
      const p = (t - this.startAt) / this._spb;
      if (p < 0) return { ok: false, dist: 99, beat: -1, p };
      const beat = Math.round(p);
      const dist = Math.abs(p - beat) * this._spb;
      return { ok: dist <= this._tapWindow, dist, beat, p };
    },

    /** 以「而家」計分 */
    rateNow() {
      return this.rateAt(this._ctx ? this._ctx.currentTime : 0);
    },

    get spb() { return this._spb || 60 / this.bpm; },
    get window() { return this._tapWindow; },
  };

  window.Metro = Metro;
})();
