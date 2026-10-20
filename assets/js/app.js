/* =========================================================================
 *  app.js — 共用遊戲邏輯（魔法生果 / 圖鑑 / 提示）
 *  開機流程喺 screen-boot.js
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, clamp } = C;

  /* ------------------------------------------------------------------ 生果 */
  const FRUIT_EMOJI = ['🍎', '🍓', '🍇', '🍊', '🍋', '🥝', '🍒'];

  const Profile = {
    get fruits() { return C.state.progress.fruits; },
    refreshFruitBars,
    setFruits(n) {
      C.state.progress.fruits = clamp(Math.round(n), 0, 9999);
      C.save();
      refreshFruitBars();
    },
    addFruits(n, silent) {
      const before = C.state.progress.fruits;
      this.setFruits(before + n);
      C.state.progress.fruitsLifetime = (C.state.progress.fruitsLifetime || 0) + Math.max(0, n);
      C.save();
      refreshFruitBars(true);
      if (!silent && n > 0) window.AudioKit.coin();
      return n;
    },
    spendFruits(n) {
      const have = C.state.progress.fruits;
      const use = Math.min(have, n);
      this.setFruits(have - use);
      return use;
    },
    /** 唔夠生果時，精靈送俾小朋友（唔會卡死） */
    ensureFruits(min) {
      if (C.state.progress.fruits < min) {
        C.state.progress.fruits = min;
        C.save();
        refreshFruitBars();
        return true;
      }
      return false;
    },
    collected(id) { return C.state.progress.collected[id] || null; },
    /** stars: 0-3 ; facts: 已解鎖冷知識數 */
    recordAnimal(id, stars, facts) {
      const p = C.state.progress;
      const rec = p.collected[id] || { stars: 0, times: 0, facts: 1, firstAt: Date.now() };
      const isNew = !p.collected[id];
      rec.times = (rec.times || 0) + 1;
      rec.lastAt = Date.now();
      rec.stars = Math.max(rec.stars || 0, stars);
      rec.facts = Math.max(rec.facts || 1, Math.min(facts, 4));
      p.collected[id] = rec;
      p.feedings = (p.feedings || 0) + 1;
      C.save();
      return isNew;
    },
  };

  function refreshFruitBars(bump) {
    const n = C.state.progress.fruits;
    $$('[data-fruit-val]').forEach((el) => {
      el.textContent = n;
      if (bump) {
        const pill = el.closest('.fruit-pill');
        if (pill) { pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }
      }
    });
    const hv = $('#home-fruit-val');
    if (hv) hv.textContent = n;
  }

  /* --------------------------------------------------------------- 圖鑑進度 */
  function albumStats() {
    const all = window.ANIMAL_DATA || [];
    const got = Object.keys(C.state.progress.collected || {}).length;
    return { got, total: all.length, pct: Math.round((got / Math.max(1, all.length)) * 100) };
  }

  /* ------------------------------------------------------------------ 提示 */
  let tipEl = null, tipTimer = null;
  function showTip(text, ms) {
    if (!tipEl) tipEl = document.getElementById('global-tip');
    if (!tipEl) return;
    tipEl.textContent = text;
    tipEl.classList.add('show');
    clearTimeout(tipTimer);
    if (ms) tipTimer = setTimeout(() => tipEl.classList.remove('show'), ms);
  }
  function hideTip() {
    if (!tipEl) tipEl = document.getElementById('global-tip');
    if (tipEl) tipEl.classList.remove('show');
  }

  /** 講一句（音檔），key 例如 'p/zh-HK/good' */
  function say(key, opts) {
    const A = window.AudioKit;
    if (!A.has(key) && opts && opts.fallback) return A.say(opts.fallback, opts);
    return A.play(key, opts);
  }
  function sayText(text, opts) { return window.AudioKit.say(text, opts); }

  /* 分數 → 星 */
  function scoreToStars(score) {
    if (score >= 78) return 3;
    if (score >= 52) return 2;
    if (score >= 26) return 1;
    return 0;
  }
  function starsToFacts(stars) { return clamp(1 + stars, 1, 4); }

  document.addEventListener('DOMContentLoaded', () => {
    // 全局提示層
    if (!document.getElementById('global-tip')) {
      const t = document.createElement('div');
      t.className = 'feed-tip';
      t.id = 'global-tip';
      document.body.appendChild(t);
    }
    tipEl = document.getElementById('global-tip');
  });

  window.Profile = Profile;
  window.Game = {
    refreshFruitBars, albumStats, showTip, hideTip, say, sayText,
    scoreToStars, starsToFacts, FRUIT_EMOJI,
  };
})();
