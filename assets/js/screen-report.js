/* =========================================================================
 *  screen-report.js — 家長報告：今日／7 日表現、最需要重溫嘅字、動物進度
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$ } = C;

  function lastNDays(n) {
    const st = C.stats();
    const out = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = C.dayKey(d);
      out.push({ key: k, ...(st.days[k] || { q: 0, c: 0, f: 0 }) });
    }
    return out;
  }

  function topicOf(itemKey) {
    const tid = String(itemKey).split(':')[0];
    for (const [id, t] of Object.entries(window.VOCAB || {})) {
      if (id === tid) return { id, zh: t.zh, items: t.items };
    }
    if (tid === 'zoo') {
      const at = window.buildAnimalTopic();
      return { id: 'zoo', zh: at.zh, items: at.items };
    }
    return null;
  }
  function itemOf(key) {
    const [tid, idx] = String(key).split(':');
    const t = topicOf(tid);
    if (!t) return null;
    const it = t.items[Number(idx)];
    if (!it) return null;
    return { ...it, topicId: tid, index: Number(idx), topicZh: t.zh };
  }
  function picHtml(it) {
    try { return window.Art.item(it); } catch (e) { return ''; }
  }

  function render() {
    const host = $('#report-body');
    if (!host) return;
    const s = C.state;
    const p = s.progress;
    const st = C.stats();
    const today = lastNDays(1)[0];
    const week = lastNDays(7);
    const weekQ = week.reduce((a, d) => a + (d.q || 0), 0);
    const weekC = week.reduce((a, d) => a + (d.c || 0), 0);
    const weekF = week.reduce((a, d) => a + (d.f || 0), 0);
    const acc = weekQ ? Math.round((weekC / weekQ) * 100) : 0;

    /* 最需要重溫：wrong 最多 */
    const items = Object.entries(st.items || {})
      .map(([k, v]) => ({ key: k, it: itemOf(k), ...v }))
      .filter((x) => x.it && x.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong || b.seen - a.seen)
      .slice(0, 8);

    /* 已解鎖動物 */
    const collected = Object.keys(p.collected || {}).length;
    const totalAnimals = (window.ANIMAL_DATA || []).length;
    const byLoc = {};
    for (const a of window.ANIMAL_DATA || []) {
      byLoc[a.loc] = byLoc[a.loc] || { got: 0, all: 0 };
      byLoc[a.loc].all++;
      if (p.collected[a.id]) byLoc[a.loc].got++;
    }

    const todayCard = `
      <div class="rep-card">
        <div class="rep-title">今日</div>
        <div class="rep-nums">
          <div><b>${today.q || 0}</b><span>答題</span></div>
          <div><b>${(today.q ? Math.round(((today.c || 0) / today.q) * 100) : 0)}%</b><span>正確率</span></div>
          <div><b>${today.f || 0}</b><span>餵動物</span></div>
        </div>
      </div>`;

    const weekCard = `
      <div class="rep-card">
        <div class="rep-title">過去 7 日</div>
        <div class="rep-nums">
          <div><b>${weekQ}</b><span>答題</span></div>
          <div><b>${acc}%</b><span>正確率</span></div>
          <div><b>${weekF}</b><span>餵動物</span></div>
        </div>
        <div class="rep-bars">
          ${week.slice().reverse().map((d) => {
            const h = Math.min(100, (d.q || 0) * 8);
            return `<div class="rep-bar" title="${d.key}: ${d.q || 0} 題"><i style="height:${h}%"></i><span>${d.key.slice(5)}</span></div>`;
          }).join('')}
        </div>
      </div>`;

    const weakCard = items.length
      ? `<div class="rep-card">
          <div class="rep-title">最需要重溫</div>
          <div class="rep-list">
            ${items.map((x) => `
              <div class="rep-item">
                <span class="rep-pic">${picHtml(x.it)}</span>
                <span class="rep-word"><b>${C.escapeHtml(C.zh(x.it.zh))}</b><small>${C.escapeHtml(x.it.py || '')} · ${C.escapeHtml(x.it.en || '')}</small></span>
                <span class="rep-badge">錯 ${x.wrong} / 共 ${x.seen}</span>
              </div>`).join('')}
          </div>
          <p class="rep-note">建議：同小朋友玩「${items[0].it.topicZh}」主題，逐個字讀一次。</p>
        </div>`
      : `<div class="rep-card"><div class="rep-title">最需要重溫</div><p class="rep-note">暫時未有答錯記錄，繼續玩啦！</p></div>`;

    const animalCard = `
      <div class="rep-card">
        <div class="rep-title">動物圖鑑 ${collected} / ${totalAnimals}</div>
        <div class="rep-locs">
          ${Object.entries(byLoc).map(([loc, v]) => {
            const L = (window.LOCATIONS || []).find((x) => x.id === loc) || { zh: loc, emoji: '' };
            const pct = Math.round((v.got / v.all) * 100);
            return `<div class="rep-loc"><span>${L.emoji} ${C.escapeHtml(L.zh)}</span><i><em style="width:${pct}%"></em></i><b>${v.got}/${v.all}</b></div>`;
          }).join('')}
        </div>
      </div>`;

    const footCard = `
      <div class="rep-card">
        <div class="rep-title">累計</div>
        <div class="rep-nums">
          <div><b>${p.quizzes || 0}</b><span>答過題目</span></div>
          <div><b>${p.correct || 0}</b><span>答啱</span></div>
          <div><b>${p.fruitsLifetime || 0}</b><span>魔法生果</span></div>
        </div>
        <button class="btn ghost" id="rep-clear">清除統計（唔影響進度）</button>
      </div>`;

    host.innerHTML = todayCard + weekCard + weakCard + animalCard + footCard;

    const clr = $('#rep-clear');
    if (clr) clr.addEventListener('click', () => {
      C.confirmPopup('清除統計資料？', () => {
        C.state.progress.stats = { items: {}, days: {} };
        C.save();
        render();
        C.toast('統計已清除');
      });
    });
  }

  C.registerScreen('report', { enter() { render(); } });
  window.Report = { render };
})();
