/* =========================================================================
 *  screen-boot.js — 開機、註冊 Service Worker、hash 跳轉
 *  （app.js 會呼叫 Boot.start()）
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $ } = C;

  const Boot = {
    started: false,
    async start() {
      if (this.started) return;
      this.started = true;
      C.load();
      if (window.I18N) setTimeout(() => window.I18N.applyLang(), 30);
      refreshFruitBars();
      bindGlobal();
      await this.loadAudio();
      this.readyToStart();
      this.registerSW();
      return true;
    },
    async loadAudio() {
      const bar = $('.boot-bar i');
      if (bar) bar.style.width = '34%';
      try { await window.AudioKit.init(); } catch (e) { console.warn(e); }
      if (bar) bar.style.width = '100%';
    },
    readyToStart() {
      const btn = $('#btn-boot-start');
      if (!btn) return;
      btn.hidden = false;
      const go = () => {
        window.AudioKit.unlock();
        window.AudioKit.pop();
        const hash = (location.hash || '').replace('#', '');
        const target = hash && document.getElementById('screen-' + hash) && hash !== 'boot' ? hash : 'home';
        C.go(target, { resetStack: true, replace: true });
        if (target === 'home') setTimeout(() => this.greet(), 500);
      };
      btn.addEventListener('click', go, { once: true });
    },
    greet() {
      const hour = new Date().getHours();
      const greet = hour < 11 ? '早晨呀！' : hour < 18 ? '下晝好呀！' : '夜晚好呀！';
      const el = $('#home-greeting');
      if (el) el.textContent = greet + ' 一齊學中英普，餵動物食魔法生果！';
      window.Game.say(C.phrase('hi'));
    },
    async registerSW() {
      if (!('serviceWorker' in navigator)) return;
      if (!/^https?:$/.test(location.protocol)) return;
      try { await navigator.serviceWorker.register('sw.js', { scope: './' }); }
      catch (e) { console.warn('[sw] register failed', e); }
    },
  };

  function refreshFruitBars() {
    const n = C.state.progress.fruits;
    Array.from(document.querySelectorAll('[data-fruit-val]')).forEach((el) => (el.textContent = n));
    const hv = $('#home-fruit-val');
    if (hv) hv.textContent = n;
  }

  function bindGlobal() {
    window.AudioKit.onFirstGesture();
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch < 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    // 返回鍵（Android）
    window.addEventListener('popstate', () => {
      if (C.screen && C.screen !== 'home' && C.screen !== 'boot') C.back('home');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 語言：內容語言
    window.Boot = Boot;
    Boot.start();
  });
})();
