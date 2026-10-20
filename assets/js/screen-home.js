/* =========================================================================
 *  screen-home.js — 主頁
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$ } = C;

  function refreshHome() {
    const p = C.state.progress;
    const fv = $('#home-fruit-val');
    if (fv) fv.textContent = p.fruits;
    const st = window.Game.albumStats();
    const b = $('#album-badge');
    if (b) b.textContent = st.got + '/' + st.total;
  }

  /** 長按齒輪 1 秒先入設定，避免小朋友誤入 */
  function bindGear() {
    const btn = $('#btn-settings');
    if (!btn) return;
    let timer = null, fired = false;
    const down = () => {
      fired = false;
      btn.classList.add('holding');
      btn.style.transform = 'scale(0.92)';
      timer = setTimeout(() => {
        fired = true;
        btn.classList.remove('holding');
        btn.style.transform = '';
        C.haptic();
        window.AudioKit.pop();
        C.go('settings');
      }, 900);
    };
    const up = () => {
      clearTimeout(timer);
      btn.style.transform = '';
      if (!fired) {
        C.toast('長按齒輪 1 秒開設定 🔒');
      }
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', () => { clearTimeout(timer); btn.style.transform = ''; });
  }

  function bind() {
    // [data-go] 由 core.js 全局處理，呢度只綁齒輪
    bindGear();
  }

  C.registerScreen('home', {
    enter() {
      refreshHome();
      window.Game.hideTip();
      window.AudioKit.stopAmbient();
      // 輕輕嘅背景音樂感
    },
    leave() {},
  });

  document.addEventListener('DOMContentLoaded', bind);
  window.refreshHome = refreshHome;
})();
