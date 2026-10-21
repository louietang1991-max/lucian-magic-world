/* =========================================================================
 *  screen-settings.js — 家長設定（有計數鎖）
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, rndInt, shuffle } = C;

  let unlocked = false;

  function makeLock() {
    const a = rndInt(3, 9), b = rndInt(3, 9);
    const ans = a + b;
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(ans + rndInt(-4, 4) || ans + 1);
    const list = shuffle(Array.from(opts));
    const q = $('#lock-q');
    if (q) q.textContent = `${a} + ${b} = ?`;
    const box = $('#lock-options');
    if (box) {
      box.innerHTML = '';
      list.forEach((n) => {
        const b2 = document.createElement('button');
        b2.textContent = n;
        b2.addEventListener('click', () => {
          if (n === ans) {
            unlocked = true;
            window.AudioKit.correct();
            showContent(true);
          } else {
            window.AudioKit.wrong();
            b2.style.background = '#ffe0e6';
            makeLock();
          }
        });
        box.appendChild(b2);
      });
    }
  }

  function showContent(show) {
    const lock = $('#set-lock');
    const content = $('#set-content');
    if (lock) lock.hidden = show;
    if (content) content.hidden = !show;
    if (show) renderSettings();
  }

  function renderSettings() {
    const s = C.state.settings;
    // 題目庫
    const chips = $('#set-topics');
    if (chips) {
      const all = window.LearnGame.allTopics();
      chips.innerHTML = '';
      all.forEach((t) => {
        const b = document.createElement('button');
        b.className = 'chip' + (s.topics.includes(t.id) ? ' on' : '');
        b.innerHTML = `${t.emoji || ''} ${C.escapeHtml(C.zh(t.zh))}`;
        b.addEventListener('click', () => {
          const on = s.topics.includes(t.id);
          if (on) {
            if (s.topics.length <= 1) { C.toast('最少要揀一個題目庫'); return; }
            s.topics = s.topics.filter((x) => x !== t.id);
          } else s.topics.push(t.id);
          C.save();
          b.classList.toggle('on', !on);
          window.AudioKit.tap();
        });
        chips.appendChild(b);
      });
    }
    // 發音語言
    seg('set-speak', s.speakLang, (v) => { s.speakLang = v; C.save(); window.AudioKit.tap(); });
    seg('set-text', s.textLang, (v) => { s.textLang = v; C.save(); window.AudioKit.tap(); if (window.I18N) window.I18N.applyLang(); });
    // 語速
    const rate = $('#set-rate');
    const rateVal = $('#set-rate-val');
    if (rate) {
      rate.value = s.rate;
      rateVal.textContent = Number(s.rate).toFixed(2) + 'x';
      rate.oninput = () => { rateVal.textContent = Number(rate.value).toFixed(2) + 'x'; };
      rate.onchange = () => { s.rate = Number(rate.value); C.save(); };
    }
    // 節奏
    const tempo = $('#set-tempo');
    const tempoVal = $('#set-tempo-val');
    if (tempo) {
      tempo.value = s.tempo;
      tempoVal.textContent = s.tempo + ' BPM';
      tempo.oninput = () => { tempoVal.textContent = tempo.value + ' BPM'; };
      tempo.onchange = () => { s.tempo = Number(tempo.value); C.save(); };
    }
    // 開關
    bindSwitch('#set-sfx', s.sfx, (v) => { s.sfx = v; C.save(); window.AudioKit.setSfx(v); });
    bindSwitch('#set-autonext', s.autoNext, (v) => { s.autoNext = v; C.save(); });
    bindSwitch('#set-easy', s.easyMode, (v) => { s.easyMode = v; C.save(); });
    // 進度
    const note = $('#set-progress-note');
    if (note) {
      const st = window.Game.albumStats();
      const p = C.state.progress;
      note.innerHTML = `魔法生果：🍎 ${p.fruits}（累計 ${p.fruitsLifetime || 0}）<br>
        圖鑑：${st.got} / ${st.total} 隻動物（${st.pct}%）<br>
        餵食次數：${p.feedings || 0}　答題：${p.quizzes || 0} 次`;
    }
    const reset = $('#set-reset');
    if (reset) {
      reset.onclick = () => {
        const layer = document.getElementById('layer-popup');
        const p = C.popup(`<div class="popup-card">
            <p class="popup-text">確定要清除所有進度？<br><small style="font-size:14px;color:#8d7fab">魔法生果同圖鑑都會冇晒</small></p>
            <div class="popup-actions">
              <button class="btn ghost" data-cancel>唔清除</button>
              <button class="btn danger" data-yes>確定清除</button>
            </div>
          </div>`, { cls: 'center', dismissible: false });
        p.el.querySelector('[data-cancel]').addEventListener('click', () => p.close());
        p.el.querySelector('[data-yes]').addEventListener('click', () => {
          C.state.progress = {
            fruits: 3, fruitsLifetime: 0, collected: {}, quizzes: 0, correct: 0, feedings: 0,
          };
          C.saveNow();
          p.close();
          window.Profile.refreshFruitBars();
          renderSettings();
          C.toast('已清除進度');
        });
      };
    }
  }

  function seg(id, cur, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    $$('button', el).forEach((b) => {
      b.classList.toggle('on', b.dataset.v === cur);
      b.onclick = () => {
        $$('button', el).forEach((x) => x.classList.toggle('on', x === b));
        cb(b.dataset.v);
      };
    });
  }
  function bindSwitch(sel, val, cb) {
    const el = $(sel);
    if (!el) return;
    el.checked = !!val;
    el.onchange = () => cb(el.checked);
  }

  function bind() {
    // 任何 pointer 事件都唔好觸發長按選單
    const lock = $('#set-lock');
    if (lock) lock.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  C.registerScreen('settings', {
    enter() {
      window.Game.hideTip();
      if (!unlocked) { showContent(false); makeLock(); }
      else showContent(true);
    },
    leave() { /* 離開後重新上鎖 */ unlocked = false; },
  });

  document.addEventListener('DOMContentLoaded', bind);
})();
