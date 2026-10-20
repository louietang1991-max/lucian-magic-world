/* =========================================================================
 *  screen-album.js — 動物圖鑑
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$ } = C;
  const LOC = window.LOCATIONS || [];
  const ANIMALS = window.ANIMAL_DATA || [];

  let filter = 'all';

  function photoStars(rec) {
    if (!rec) return 0;
    return C.clamp(1 + (rec.stars || 0) + ((rec.facts || 1) >= 4 ? 1 : 0), 1, 5);
  }

  function list() {
    if (filter === 'all') return ANIMALS.slice();
    return ANIMALS.filter((a) => a.loc === filter);
  }

  function renderTabs() {
    const box = $('#album-tabs');
    if (!box) return;
    const tabs = [{ id: 'all', zh: '全部', emoji: '📚' }].concat(LOC.map((l) => ({ id: l.id, zh: l.zh, emoji: l.emoji })));
    box.innerHTML = '';
    tabs.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'album-tab' + (filter === t.id ? ' on' : '');
      b.innerHTML = `${t.emoji} ${t.zh}`;
      b.addEventListener('click', () => {
        filter = t.id;
        window.AudioKit.tap();
        render();
      });
      box.appendChild(b);
    });
  }

  function render() {
    renderTabs();
    const grid = $('#album-grid');
    if (!grid) return;
    const arr = list();
    const collected = C.state.progress.collected || {};
    const got = arr.filter((a) => collected[a.id]).length;
    const prog = $('#album-progress');
    if (prog) {
      const all = window.Game.albumStats();
      prog.textContent = (filter === 'all' ? all.got : got) + '/' + (filter === 'all' ? all.total : arr.length);
    }
    grid.innerHTML = '';
    if (!arr.length) {
      grid.innerHTML = '<div class="album-empty">呢度暫時未有動物</div>';
      return;
    }
    arr.forEach((a) => {
      const rec = collected[a.id];
      const rar = window.RARITY[a.rarity] || window.RARITY[1];
      const card = document.createElement('button');
      card.className = 'album-card' + (rec ? '' : ' locked');
      card.style.setProperty('--rar', rar.color);
      card.innerHTML = `
        <span class="ac-rar"></span>
        <span class="ac-art">${window.Art.animal(a.id, { shadow: !rec })}</span>
        <span class="ac-name">${rec ? C.escapeHtml(a.zh) : '？？？'}</span>
        <span class="ac-en">${rec ? C.escapeHtml(a.en) : '???'}</span>
        <span class="ac-stars">${rec ? C.starsSvg(photoStars(rec), 5) : ''}</span>
        ${rec ? '' : '<span class="ac-lock">🔒</span>'}`;
      if (rec) card.addEventListener('click', () => openSheet(a, rec));
      grid.appendChild(card);
    });
  }

  function openSheet(a, rec) {
    window.AudioKit.tap();
    const rar = window.RARITY[a.rarity] || window.RARITY[1];
    const ps = photoStars(rec);
    const facts = rec.facts || 1;
    const rows = a.facts.map((f, i) => {
      const on = i < facts;
      return `<div class="fact-row${on ? '' : ' locked'}"><span class="fr-ico">${on ? '💡' : '🔒'}</span><span>${on ? C.escapeHtml(f) : '未解鎖'}</span></div>`;
    }).join('');
    const p = C.popup(`<div class="popup-card animal-sheet" style="max-height:86vh;overflow-y:auto">
        <button class="sheet-close" data-close aria-label="閂">✕</button>
        <div class="as-art">${window.Art.animal(a.id)}</div>
        <div class="as-name">${C.escapeHtml(a.zh)}</div>
        <div class="as-en">${C.escapeHtml(a.en)}</div>
        <div class="reveal-rarity" style="position:static;margin-top:2px;background:${rar.color}">${'★'.repeat(a.rarity)} ${rar.zh}</div>
        <div style="margin-top:6px">${C.starsSvg(ps, 5)}</div>
        <div style="font-size:13px;color:#a08fc0;font-weight:800">親密度 ${'❤️'.repeat(Math.max(1, (rec.stars || 0) + 1))} · 餵食 ${rec.times || 1} 次</div>
        <div class="as-facts">${rows}</div>
        <div class="as-actions">
          <button class="btn ghost" data-say="yue">粵語</button>
          <button class="btn ghost" data-say="man">普通話</button>
          <button class="btn primary" data-say="en">English</button>
        </div>
      </div>`, { cls: 'center' });
    p.el.querySelectorAll('[data-say]').forEach((b) => {
      b.addEventListener('click', () => {
        window.AudioKit.play('a/' + a.id + '/' + b.dataset.say, { fallbackText: b.dataset.say === 'en' ? a.en : a.zh });
      });
    });
    window.AudioKit.play('a/' + a.id + '/' + C.state.settings.speakLang);
  }

  C.registerScreen('album', {
    enter() {
      window.Game.hideTip();
      render();
      const s = window.Game.albumStats();
      const b = $('#album-badge');
      if (b) b.textContent = s.got + '/' + s.total;
    },
  });

  window.Album = { render };
})();
