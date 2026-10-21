/* =========================================================================
 *  i18n.js — 顯示語言：繁體中文 / 简体中文 / English
 *  - 內容字詞：Core.T() / Core.zh()
 *  - 介面文字：applyLang() 會掃 DOM text node，按語言轉換
 * ========================================================================= */
(function () {
  'use strict';

  /* 介面英文對照（用中文原文做 key，動態 render 出嚟嘅字都對得上） */
  const EN = {
    // 主頁
    '學習小遊戲': 'Learning Games',
    '尋找動物': 'Find Animals',
    '動物圖鑑': 'Animal Album',
    '聽聲音學字詞': 'Listen & learn words',
    '去 8 個地方探險': 'Explore 8 places',
    '一齊學中英普，餵動物食魔法生果！': "Let's learn and feed the magic animals!",
    // 學習選單
    '揀一個遊戲玩啦！': 'Pick a game!',
    '聽聲音，揀圖案': 'Hear it, pick the picture',
    '睇圖案，揀字詞': 'See it, pick the word',
    '睇字詞，揀圖案': 'Read it, pick the picture',
    '聽粵語 / 英語 / 普通話，揀正確圖片': 'Listen in Cantonese / Mandarin / English',
    '睇圖片，揀正確嘅中文字 / 英文字': 'Look at the picture, choose the word',
    '睇中文字 / 英文字，揀正確圖片': 'Read the word, choose the picture',
    '今次嘅題目庫': 'Topics this round',
    // 答題
    '聽下係咩？揀正確嘅圖案！': 'Listen! Which picture is it?',
    '邊個字詞係啱嘅？': 'Which word is right?',
    '邊幅圖係啱嘅？': 'Which picture is right?',
    '再聽一次': 'Listen again',
    // 結算
    '完成啦！': 'All done!',
    '好叻呀！': 'Well done!',
    '再玩一次': 'Play again',
    '揀第二個遊戲': 'Another game',
    '去搵動物 🔭': 'Find animals 🔭',
    '返主頁': 'Home',
    // 探索
    '去邊度探險？': 'Where to explore?',
    '撳一個地方，去搵動物嘅影子！': 'Tap a place to find animal shadows!',
    '用手指撥開啲沙，見到影子就撳佢！': 'Wipe the sand and tap the shadow!',
    '用手指撥開啲雪，見到影子就撳佢！': 'Wipe the snow and tap the shadow!',
    '啲影子會由水底浮上嚟，浮上水面先撳佢！': 'Shadows float up — tap when they surface!',
    '啲影子匿埋咗，等佢探頭出嚟先撳佢！': 'Shadows are hiding — tap when they peek out!',
    '撳個影子，餵動物食嘢！': 'Tap a shadow to feed the animal!',
    '呢度嘅動物都搵晒啦！': 'You found every animal here!',
    '再玩呢度': 'Play here again',
    '去另一個地方': 'Another place',
    // 餵食
    '餵動物啦！': 'Feed the animal!',
    '想聽多次就撳「聽節拍」': 'Tap "Listen" to hear the beat again',
    '跟拍子遊戲': 'Rhythm game',
    '聽節拍': 'Listen',
    '開始': 'Start',
    '將魔法生果掟入圈圈！': 'Throw the magic fruit into the circle!',
    '再掟多一個！': 'One more fruit!',
    '準備跟拍子…': 'Get ready for the beat…',
    '準備好就撳「開始」！': 'Tap "Start" when ready!',
    '準備⋯⋯': 'Ready…',
    '跟住拍子撳圈圈！': 'Tap the circle on the beat!',
    '跟住拍子撳！': 'Tap on the beat!',
    '好叻呀！': 'Well done!',
    '動物食得好開心呀！': 'The animal is happy!',
    '撳圈圈！': 'Tap the circle!',
    '聽下個拍子…': 'Listen to the beat…',
    '呢拍休息': 'rest beat',
    '撳': 'TAP',
    // 獎勵卡
    '繼續': 'Continue',
    '再餵一次': 'Feed again',
    '再餵多幾次，解鎖更多冷知識…': 'Feed again to unlock more fun facts…',
    // 圖鑑
    '全部': 'All',
    '沙灘': 'Beach', '海面': 'Sea', '海底': 'Underwater', '河流': 'River',
    '森林': 'Forest', '草原': 'Grassland', '沙漠': 'Desert', '雪地': 'Snow',
    '普通': 'Common', '少見': 'Uncommon', '稀有': 'Rare', '傳說': 'Legendary',
    '粵語': 'Cantonese', '普通話': 'Mandarin', '中文': 'Chinese',
    '閂': 'Close',
    // 設定
    '設定（家長用）': 'Settings (Parents)',
    '呢度俾家長用，請先答啱：': 'For parents — answer first:',
    '題目庫（學習遊戲用）': 'Topics (for learning games)',
    '可以揀多個主題；「動物」會用第二部分嘅動物。': 'Pick one or more topics.',
    '發音語言': 'Audio language',
    '文字語言（遊戲 2 / 3）': 'Text language (games 2 / 3)',
    '語速': 'Speech speed',
    '節奏速度': 'Rhythm tempo',
    '開關': 'Options',
    '音效': 'Sound effects',
    '答啱自動去下一題': 'Auto next when correct',
    '輕鬆模式（答錯可以再試）': 'Easy mode (retry allowed)',
    '進度': 'Progress',
    '清除所有進度': 'Reset all progress',
    '確定要清除所有進度？': 'Reset all progress?',
    '唔清除': 'Cancel',
    '確定清除': 'Reset',
    '關於': 'About',
    '魔法生果': 'Magic fruit',
    '動物': 'Animals', '生果': 'Fruits', '蔬菜': 'Vegetables', '交通工具': 'Vehicles',
    '顏色': 'Colors', '形狀': 'Shapes', '數字': 'Numbers', '身體': 'Body', '屋企': 'Home',
    '繁體中文': 'Traditional Chinese', '简体中文': 'Simplified Chinese',
  };

  const reverse = {};
  for (const [zh, en] of Object.entries(EN)) reverse[en] = zh;

  const cache = new WeakMap(); // textNode -> 原文

  function convertText(node, lang) {
    if (node.nodeType !== 3) return;
    const parent = node.parentElement;
    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) return;
    if (parent && parent.hasAttribute && parent.hasAttribute('data-keep')) return;
    let orig = cache.get(node);
    if (orig === undefined) {
      orig = node.nodeValue;
      cache.set(node, orig);
    }
    const trimmed = orig.trim();
    if (!trimmed) return;
    if (lang === 'zh') {
      if (node.nodeValue !== orig) node.nodeValue = orig;
      return;
    }
    if (lang === 'zhs') {
      const s = window.toSimp ? window.toSimp(orig) : orig;
      if (node.nodeValue !== s) node.nodeValue = s;
      return;
    }
    if (lang === 'en') {
      const en = EN[trimmed];
      if (en) {
        const lead = orig.match(/^\s*/)[0];
        const tail = orig.match(/\s*$/)[0];
        const next = lead + en + tail;
        if (node.nodeValue !== next) node.nodeValue = next;
      } else if (node.nodeValue !== orig) {
        node.nodeValue = orig; // 冇對照就保留中文
      }
    }
  }

  function applyLang(root) {
    const lang = (window.Core && window.Core.state && window.Core.state.settings.textLang) || 'zh';
    const host = root || document.getElementById('app') || document.body;
    if (!host) return;
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null);
    let n;
    const nodes = [];
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach((node) => convertText(node, lang));
  }

  window.I18N = { EN, reverse, applyLang };
})();
