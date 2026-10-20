/* =========================================================================
 *  screen-learn.js — 第一部分：三個學習小遊戲 + 結算
 * ========================================================================= */
(function () {
  'use strict';
  const C = window.Core;
  const { $, $$, sleep, shuffle, clamp } = C;
  const A = () => window.AudioKit;

  const MODES = {
    A: { id: 'A', name: '聽聲音，揀圖案', answerKind: 'picture' },
    B: { id: 'B', name: '睇圖案，揀字詞', answerKind: 'word' },
    C: { id: 'C', name: '睇字詞，揀圖案', answerKind: 'picture' },
  };

  const Q = {
    mode: 'A',
    total: 5,
    idx: 0,
    score: 0,          // 每題 2 分（答啱第一次 2 / 第二次 1）
    correctCount: 0,
    attempts: 0,
    locked: false,
    cur: null,
    fruits: 0,
    queue: [],
    _gen: 0,
  };

  /* --------------------------------------------------------------- 題庫選擇 */
  function allTopics() {
    const list = [];
    for (const [id, t] of Object.entries(window.VOCAB)) {
      list.push({ id, zh: t.zh, en: t.en, emoji: t.emoji, items: t.items, artType: t.artType });
    }
    const at = window.buildAnimalTopic();
    list.unshift({ id: 'animal', zh: at.zh, en: at.en, emoji: at.emoji, items: at.items, artType: 'animal' });
    return list;
  }

  function activeTopics() {
    const ids = C.state.settings.topics || [];
    return allTopics().filter((t) => ids.includes(t.id));
  }

  function pickTopics() {
    let ts = activeTopics();
    if (!ts.length) ts = allTopics();
    return ts;
  }

  /* ------------------------------------------------------------------ 發音 */
  function audioKey(item, lang) {
    if (item.art && item.art.startsWith('animal:')) {
      return 'a/' + item.art.slice(7) + '/' + lang;
    }
    return 'v/' + item.topicId + '/' + item.index + '/' + lang;
  }
  function playWord(item) {
    const lang = C.state.settings.speakLang;
    const key = audioKey(item, lang);
    return A().play(key, { fallbackText: C.state.settings.textLang === 'en' ? item.en : item.zh, rate: C.state.settings.rate });
  }

  /* -------------------------------------------------------------- 字／圖 render */
  function picHtml(item) {
    return `<div class="ans-pic">${window.Art.item(item)}</div>`;
  }
  function wordHtml(item) {
    const lang = C.state.settings.textLang;
    if (lang === 'en') return `<div class="ans-word"><span class="ans-en">${C.escapeHtml(item.en)}</span></div>`;
    return `<div class="ans-word"><span class="ans-han">${C.escapeHtml(item.zh)}</span>${item.py ? `<span class="ans-py">${C.escapeHtml(item.py)}</span>` : ''}</div>`;
  }
  function bigWordHtml(item) {
    if (C.state.settings.textLang === 'en') {
      return `<span class="prompt-text"><span style="font-size:clamp(30px,9vw,52px);font-weight:900;color:#2a5fa8">${C.escapeHtml(item.en)}</span></span>`;
    }
    return `<span class="prompt-text"><span class="han-big">${C.escapeHtml(item.zh)}</span></span>
            <span class="prompt-sub">${C.escapeHtml(item.py || '')}</span>`;
  }

  /* ------------------------------------------------------------------ 出題 */
  function buildQueue() {
    const topics = pickTopics();
    const pool = [];
    for (const t of topics) {
      t.items.forEach((it, i) => {
        pool.push({ ...it, topicId: t.id, topicZh: t.zh, index: i });
      });
    }
    return shuffle(pool);
  }

  function flatten(topicList) {
    const out = [];
    for (const t of topicList) t.items.forEach((it, i) => out.push({ ...it, topicId: t.id, topicZh: t.zh, index: i }));
    return out;
  }

  function nextQuestion() {
    if (!Q.queue.length) Q.queue = buildQueue();
    const target = Q.queue.pop();
    const topics = pickTopics();
    const sameTopic = topics.find((t) => t.id === target.topicId);
    const isTarget = (it) => it.index === target.index && it.topicId === target.topicId;
    const usedArt = new Set([target.art]);
    const usedWord = new Set([target.zh + '|' + target.en]);
    const distractors = [];
    const take = (pool) => {
      for (const it of shuffle(pool)) {
        if (distractors.length >= 3) return;
        if (isTarget(it)) continue;
        // 唔好用同一個 family（例如狐狸 vs 耳郭狐）
        if (target.family && it.family === target.family) continue;
        if (usedArt.has(it.art) || usedWord.has(it.zh + '|' + it.en)) continue;
        usedArt.add(it.art);
        usedWord.add(it.zh + '|' + it.en);
        distractors.push(it);
      }
    };
    // 1) 同一個題目庫
    if (sameTopic) take(sameTopic.items.map((it, i) => ({ ...it, topicId: sameTopic.id, index: i })));
    // 2) 其他已選題目庫
    if (distractors.length < 3) take(flatten(topics));
    // 3) 所有題目庫（保證夠 4 個選項）
    if (distractors.length < 3) take(flatten(allTopics()));
    while (distractors.length < 3) {
      // 最後防線：用其他題目庫任意 item（容許重複圖）
      const all = flatten(allTopics()).filter((it) => !isTarget(it));
      const it = pick(all);
      if (it) distractors.push(it); else break;
    }
    const options = shuffle([target, ...distractors]);
    Q.cur = { target, options, attempt: 0, answered: false };
    renderQuestion();
  }

  function renderQuestion() {
    const { target, options } = Q.cur;
    Q.locked = false;
    Q.attempts = 0;

    // 進度點
    const dots = $('#quiz-dots');
    if (dots) {
      dots.innerHTML = '';
      for (let i = 0; i < Q.total; i++) {
        const d = document.createElement('i');
        d.className = 'qp-dot' + (i < Q.idx ? ' done' : i === Q.idx ? ' now' : '');
        dots.appendChild(d);
      }
    }

    // 題目提示
    const prompt = $('#quiz-prompt');
    const showSpeaker = Q.mode === 'A';
    const speaker = $('#quiz-speaker');
    if (speaker) speaker.style.display = showSpeaker ? 'grid' : 'none';
    const pt = $('#quiz-prompt-text');
    const ps = $('#quiz-prompt-sub');
    if (Q.mode === 'A') {
      pt.innerHTML = '';
      ps.textContent = '聽下係咩？揀正確嘅圖案！';
      $('#quiz-speaker').classList.add('playing');
      playWord(target).then(() => { const s = $('#quiz-speaker'); if (s) s.classList.remove('playing'); });
    } else if (Q.mode === 'B') {
      pt.innerHTML = `<span class="prompt-pic">${window.Art.item(target)}</span>`;
      ps.textContent = C.state.settings.textLang === 'en' ? 'Which word?' : '邊個字詞係啱嘅？';
      if (C.state.settings.speakLang) A().play(audioKey(target, C.state.settings.speakLang));
    } else {
      pt.innerHTML = bigWordHtml(target);
      ps.textContent = C.state.settings.textLang === 'en' ? 'Which picture?' : '邊幅圖係啱嘅？';
      A().play(audioKey(target, C.state.settings.speakLang));
    }

    // 預載今題會用到嘅音檔（減少第一次播放嘅等待）
    try {
      const keys = [];
      for (const it of options) {
        keys.push(audioKey(it, C.state.settings.speakLang));
        keys.push(audioKey(it, 'yue'));
      }
      window.AudioKit.preload(keys, 4);
    } catch (e) {}

    // 答案
    const ansEl = $('#quiz-answers');
    const picAnswers = Q.mode !== 'B';
    ansEl.className = 'answers ' + (picAnswers ? 'cols-2' : (C.state.settings.textLang === 'en' ? 'cols-1' : 'cols-2'));
    ansEl.innerHTML = '';
    options.forEach((it) => {
      const btn = document.createElement('button');
      btn.className = 'answer';
      btn.dataset.id = it.topicId + ':' + it.index;
      btn.innerHTML = picAnswers ? picHtml(it) : wordHtml(it);
      btn.addEventListener('click', () => choose(btn, it));
      ansEl.appendChild(btn);
    });
  }

  /* ------------------------------------------------------------------ 作答 */
  async function choose(btn, item) {
    if (Q.locked) return;
    const { target } = Q.cur;
    const isRight = item.topicId === target.topicId && item.index === target.index;
    C.haptic();
    if (isRight) {
      Q.locked = true;
      btn.classList.add('correct');
      $$('#quiz-answers .answer').forEach((el) => { if (el !== btn) el.classList.add('dim'); });
      const gained = Q.attempts === 0 ? 2 : Q.attempts === 1 ? 1 : 0;
      Q.score += gained;
      Q.correctCount++;
      Q.fruits += gained;
      C.state.progress.quizzes = (C.state.progress.quizzes || 0) + 1;
      C.state.progress.correct = (C.state.progress.correct || 0) + 1;
      C.save();
      A().correct();
      feedback('👍');
      // 顯示生果
      if (gained > 0) {
        const f = document.createElement('div');
        f.className = 'fly-score';
        f.textContent = '+' + gained + ' 🍎';
        f.style.left = btn.getBoundingClientRect().left + btn.offsetWidth / 2 + 'px';
        f.style.top = btn.getBoundingClientRect().top + 10 + 'px';
        f.style.position = 'fixed';
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 1100);
      }
      // 播正確答案嘅讀音
      setTimeout(() => A().play(audioKey(target, C.state.settings.speakLang), {}), 260);
      await sleep(C.state.settings.autoNext ? 1250 : 900);
      Q.idx++;
      if (Q.idx >= Q.total) finish();
      else nextQuestion();
    } else {
      Q.attempts++;
      btn.classList.add('wrong');
      A().wrong();
      if (C.state.settings.easyMode) {
        // 輕鬆模式：可以再試
        feedback('💪');
        setTimeout(() => btn.classList.remove('wrong'), 600);
        setTimeout(() => A().play('p/zh-HK/try-again'), 240);
        // 再播一次題目
        if (Q.mode === 'A') setTimeout(() => playWord(target), 1500);
        else if (Q.mode === 'C') setTimeout(() => A().play(audioKey(target, C.state.settings.speakLang)), 1500);
      } else {
        Q.locked = true;
        // 顯示正確答案
        const rightBtn = $$('#quiz-answers .answer').find((el) => {
          return el.dataset.id === target.topicId + ':' + target.index;
        });
        if (rightBtn) rightBtn.classList.add('correct');
        btn.classList.remove('wrong');
        btn.classList.add('dim');
        feedback('💪');
        await sleep(1400);
        Q.idx++;
        if (Q.idx >= Q.total) finish();
        else nextQuestion();
      }
    }
  }

  function feedback(txt) {
    const el = $('#quiz-feedback');
    if (!el) return;
    el.textContent = txt;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 900);
  }

  /* ------------------------------------------------------------------ 結算 */
  function finish() {
    const stars = Q.score >= 9 ? 3 : Q.score >= 6 ? 2 : Q.score >= 3 ? 1 : 0;
    const p = C.state.progress;
    p.fruits += Q.fruits;
    p.fruitsLifetime = (p.fruitsLifetime || 0) + Q.fruits;
    C.save();
    window.Profile.refreshFruitBars(true);

    // 結算畫面
    const st = $('#result-stars');
    if (st) {
      st.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        st.insertAdjacentHTML('beforeend', `<svg class="star ${i < stars ? 'on' : 'off'}" viewBox="0 0 24 24"><path d="M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9z"/></svg>`);
      }
    }
    const title = $('#result-title');
    if (title) title.textContent = stars >= 3 ? '嘩！好犀利呀！' : stars === 2 ? '好叻呀！' : stars === 1 ? '做得好好！' : '多謝你陪我玩！';
    const sub = $('#result-sub');
    if (sub) sub.textContent = `你答啱咗 ${Q.correctCount} / ${Q.total} 題`;
    const fh = $('#result-fruits');
    if (fh) {
      fh.innerHTML = '';
      for (let i = 0; i < Q.fruits; i++) {
        const s = document.createElement('span');
        s.className = 'fh-ico';
        s.textContent = window.Game.FRUIT_EMOJI[i % window.Game.FRUIT_EMOJI.length];
        s.style.animationDelay = i * 0.08 + 's';
        fh.appendChild(s);
      }
      if (!Q.fruits) fh.innerHTML = '<span class="fh-ico">✨</span>';
    }
    C.go('result');
    A().star();
    setTimeout(() => A().play('p/zh-HK/all-done'), 400);
    setTimeout(() => A().play('p/zh-HK/fruits-earned'), 2100);
  }

  /* ------------------------------------------------------------------ 開始 */
  function startGame(mode, opts) {
    opts = opts || {};
    Q.mode = mode;
    Q.total = opts.total || 5;
    Q.idx = 0;
    Q.score = 0;
    Q.correctCount = 0;
    Q.attempts = 0;
    Q.fruits = 0;
    Q.queue = buildQueue();
    C.go('quiz');
    A().pop();
    setTimeout(() => {
      nextQuestion();
      const titles = { A: 'game-a-title', B: 'game-b-title', C: 'game-c-title' };
      A().play('p/zh-HK/' + titles[mode]);
    }, 260);
  }

  /* --------------------------------------------------------------- 學習選單 */
  function renderLearnMenu() {
    const prev = $('#learn-topics');
    if (!prev) return;
    const ts = pickTopics();
    prev.innerHTML = '<div class="tp-title">今次嘅題目庫</div><div class="topic-chips">' +
      ts.map((t) => `<span class="topic-chip"><span class="tc-e">${t.emoji || ''}</span>${C.escapeHtml(t.zh)}</span>`).join('') +
      '</div>';
  }

  function bind() {
    $$('#screen-learn [data-quiz]').forEach((el) => {
      el.addEventListener('click', () => {
        C.haptic();
        startGame(el.dataset.quiz);
      });
    });
    const speaker = $('#quiz-speaker');
    if (speaker) {
      speaker.addEventListener('click', () => {
        if (!Q.cur) return;
        A().tap();
        A().play(audioKey(Q.cur.target, C.state.settings.speakLang));
      });
    }
    const quit = $('[data-quiz-quit]');
    if (quit) quit.addEventListener('click', () => { A().stop(); C.back('learn'); });
    const again = $('#result-again');
    if (again) again.addEventListener('click', () => startGame(Q.mode));
  }

  C.registerScreen('learn', { enter() { renderLearnMenu(); window.Game.hideTip(); } });
  C.registerScreen('quiz', { enter() {}, leave() { A().stop(); } });
  C.registerScreen('result', { enter() {}, leave() { A().stop(); } });

  document.addEventListener('DOMContentLoaded', bind);

  window.LearnGame = { startGame, allTopics, activeTopics };
})();
