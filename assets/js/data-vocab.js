/* =========================================================================
 *  Lucian's Magic World — 資料：學習題庫（第一部分）
 *  每個 item: zh 繁中 / yue 粵語用字 / py 普通話拼音 / en 英文 / art 圖案 key
 *  topic 可喺設定入面揀選（題目庫）
 * ========================================================================= */
window.VOCAB = {
  fruit: {
    zh: '生果', en: 'Fruits', emoji: '🍎', artType: 'fruit',
    items: [
      { zh: '蘋果',            yue: '蘋果',  py: 'píng guǒ',   en: 'apple',      art: 'apple',      c: '#ff5a5a', c2: '#ffd166' },
      { zh: '香蕉',            yue: '香蕉',  py: 'xiāng jiāo', en: 'banana',     art: 'banana',     c: '#ffd93d', c2: '#ffb703' },
      { zh: '橙',              yue: '橙',    py: 'chéng',      en: 'orange',     art: 'orange',     c: '#ff9f1c', c2: '#ffbf69' },
      { zh: '西瓜',            yue: '西瓜',  py: 'xī guā',     en: 'watermelon', art: 'watermelon', c: '#43aa8b', c2: '#ff5d8f' },
      { zh: '提子',            yue: '提子',  py: 'tí zi',      en: 'grapes',     art: 'grapes',     c: '#9d4edd', c2: '#c77dff' },
      { zh: '士多啤梨',        yue: '士多啤梨', py: 'shì duō bēi lí', en: 'strawberry', art: 'strawberry', c: '#ff4d6d', c2: '#ffd166' },
      { zh: '梨',              yue: '梨',    py: 'lí',         en: 'pear',       art: 'pear',       c: '#c8e04a', c2: '#a3c93a' },
      { zh: '檸檬',            yue: '檸檬',  py: 'níng méng',  en: 'lemon',      art: 'lemon',      c: '#ffe14d', c2: '#ffd000' },
      { zh: '菠蘿',            yue: '菠蘿',  py: 'bō luó',     en: 'pineapple',  art: 'pineapple',  c: '#ffc300', c2: '#8ac926' },
      { zh: '芒果',            yue: '芒果',  py: 'máng guǒ',   en: 'mango',      art: 'mango',      c: '#ffb703', c2: '#fb8500' },
    ],
  },
  veg: {
    zh: '蔬菜', en: 'Vegetables', emoji: '🥕', artType: 'veg',
    items: [
      { zh: '紅蘿蔔',  yue: '紅蘿蔔', py: 'hóng luó bo',  en: 'carrot',     art: 'carrot',    c: '#ff7b00', c2: '#43aa8b' },
      { zh: '番茄',    yue: '番茄',   py: 'fān qié',      en: 'tomato',     art: 'tomato',    c: '#ff3b3b', c2: '#43aa8b' },
      { zh: '粟米',    yue: '粟米',   py: 'sù mǐ',        en: 'corn',       art: 'corn',      c: '#ffd60a', c2: '#2a9d8f' },
      { zh: '青瓜',    yue: '青瓜',   py: 'qīng guā',     en: 'cucumber',   art: 'cucumber',  c: '#5aa82a', c2: '#8fd14f' },
      { zh: '蘑菇',    yue: '蘑菇',   py: 'mó gu',        en: 'mushroom',   art: 'mushroom',  c: '#e07a5f', c2: '#f2e9e4' },
      { zh: '西蘭花',  yue: '西蘭花', py: 'xī lán huā',   en: 'broccoli',   art: 'broccoli',  c: '#2a9d4a', c2: '#63c26b' },
      { zh: '薯仔',    yue: '薯仔',   py: 'shǔ zǎi',      en: 'potato',     art: 'potato',    c: '#c98c3f', c2: '#e0b06a' },
      { zh: '洋蔥',    yue: '洋蔥',   py: 'yáng cōng',    en: 'onion',      art: 'onion',     c: '#c9a3d6', c2: '#efe0f5' },
    ],
  },
  vehicle: {
    zh: '交通工具', en: 'Vehicles', emoji: '🚗', artType: 'vehicle',
    items: [
      { zh: '車',        yue: '車',       py: 'chē',          en: 'car',        art: 'car',      c: '#ff5a5a', c2: '#8ecae6' },
      { zh: '巴士',      yue: '巴士',     py: 'bā shì',       en: 'bus',        art: 'bus',      c: '#ffcf3f', c2: '#3d5a80' },
      { zh: '飛機',      yue: '飛機',     py: 'fēi jī',       en: 'airplane',   art: 'plane',    c: '#dfe9f3', c2: '#3a86ff' },
      { zh: '火車',      yue: '火車',     py: 'huǒ chē',      en: 'train',      art: 'train',    c: '#2a9d8f', c2: '#ffd166' },
      { zh: '船',        yue: '船',       py: 'chuán',        en: 'boat',       art: 'boat',     c: '#aaccff', c2: '#ff6b35' },
      { zh: '單車',      yue: '單車',     py: 'dān chē',      en: 'bicycle',    art: 'bike',     c: '#ff006e', c2: '#3a0ca3' },
      { zh: '直升機',    yue: '直升機',   py: 'zhí shēng jī', en: 'helicopter', art: 'heli',     c: '#4cc9f0', c2: '#f72585' },
      { zh: '消防車',    yue: '消防車',   py: 'xiāo fáng chē', en: 'fire truck', art: 'firetruck', c: '#e63946', c2: '#ffd60a' },
    ],
  },
  color: {
    zh: '顏色', en: 'Colors', emoji: '🎨', artType: 'color',
    items: [
      { zh: '紅色',    yue: '紅色',   py: 'hóng sè',  en: 'red',    art: 'swatch', c: '#ff3b3b' },
      { zh: '黃色',    yue: '黃色',   py: 'huáng sè', en: 'yellow', art: 'swatch', c: '#ffd60a' },
      { zh: '藍色',    yue: '藍色',   py: 'lán sè',   en: 'blue',   art: 'swatch', c: '#3a86ff' },
      { zh: '綠色',    yue: '綠色',   py: 'lǜ sè',    en: 'green',  art: 'swatch', c: '#2ec27e' },
      { zh: '橙色',    yue: '橙色',   py: 'chéng sè', en: 'orange', art: 'swatch', c: '#ff9f1c' },
      { zh: '紫色',    yue: '紫色',   py: 'zǐ sè',    en: 'purple', art: 'swatch', c: '#9d4edd' },
      { zh: '粉紅色',  yue: '粉紅色', py: 'fěn hóng sè', en: 'pink', art: 'swatch', c: '#ff8fb1' },
      { zh: '啡色',    yue: '啡色',   py: 'fēi sè',   en: 'brown',  art: 'swatch', c: '#8d5524' },
    ],
  },
  shape: {
    zh: '形狀', en: 'Shapes', emoji: '🔺', artType: 'shape',
    items: [
      { zh: '圓形',    yue: '圓形',   py: 'yuán xíng',  en: 'circle',    art: 'circle',    c: '#ff595e' },
      { zh: '正方形',  yue: '正方形', py: 'zhèng fāng xíng', en: 'square', art: 'square',   c: '#1982c4' },
      { zh: '三角形',  yue: '三角形', py: 'sān jiǎo xíng', en: 'triangle', art: 'triangle', c: '#8ac926' },
      { zh: '星形',    yue: '星形',   py: 'xīng xíng',  en: 'star',      art: 'star',      c: '#ffca3a' },
      { zh: '心形',    yue: '心形',   py: 'xīn xíng',   en: 'heart',     art: 'heart',     c: '#ff5d8f' },
      { zh: '橢圓形',  yue: '橢圓形', py: 'tuǒ yuán xíng', en: 'oval',   art: 'oval',      c: '#6a4c93' },
      { zh: '長方形',  yue: '長方形', py: 'cháng fāng xíng', en: 'rectangle', art: 'rectangle', c: '#ff924c' },
    ],
  },
  number: {
    zh: '數字', en: 'Numbers', emoji: '🔢', artType: 'number',
    items: [
      { zh: '一', yue: '一', py: 'yī',   en: 'one',   art: 'n1',  n: 1 },
      { zh: '二', yue: '二', py: 'èr',   en: 'two',   art: 'n2',  n: 2 },
      { zh: '三', yue: '三', py: 'sān',  en: 'three', art: 'n3',  n: 3 },
      { zh: '四', yue: '四', py: 'sì',   en: 'four',  art: 'n4',  n: 4 },
      { zh: '五', yue: '五', py: 'wǔ',   en: 'five',  art: 'n5',  n: 5 },
      { zh: '六', yue: '六', py: 'liù',  en: 'six',   art: 'n6',  n: 6 },
      { zh: '七', yue: '七', py: 'qī',   en: 'seven', art: 'n7',  n: 7 },
      { zh: '八', yue: '八', py: 'bā',   en: 'eight', art: 'n8',  n: 8 },
      { zh: '九', yue: '九', py: 'jiǔ',  en: 'nine',  art: 'n9',  n: 9 },
      { zh: '十', yue: '十', py: 'shí',  en: 'ten',   art: 'n10', n: 10 },
    ],
  },
  body: {
    zh: '身體', en: 'Body', emoji: '👀', artType: 'body',
    items: [
      { zh: '眼睛',  yue: '眼',   py: 'yǎn jing', en: 'eyes',   art: 'eyes' },
      { zh: '耳朵',  yue: '耳仔', py: 'ěr duo',   en: 'ears',   art: 'ears' },
      { zh: '鼻子',  yue: '鼻',   py: 'bí zi',    en: 'nose',   art: 'nose' },
      { zh: '嘴巴',  yue: '嘴',   py: 'zuǐ ba',   en: 'mouth',  art: 'mouth' },
      { zh: '手',    yue: '手',   py: 'shǒu',     en: 'hand',   art: 'hand' },
      { zh: '腳',    yue: '腳',   py: 'jiǎo',     en: 'foot',   art: 'foot' },
      { zh: '頭髮',  yue: '頭髮', py: 'tóu fa',   en: 'hair',   art: 'hair' },
      { zh: '牙齒',  yue: '牙',   py: 'yá chǐ',   en: 'teeth',  art: 'teeth' },
    ],
  },
  home: {
    zh: '屋企', en: 'Home', emoji: '🏠', artType: 'home',
    items: [
      { zh: '門',        yue: '門',   py: 'mén',   en: 'door',   art: 'door' },
      { zh: '窗',        yue: '窗',   py: 'chuāng', en: 'window', art: 'window' },
      { zh: '床',        yue: '床',   py: 'chuáng', en: 'bed',    art: 'bed' },
      { zh: '杯',        yue: '杯',   py: 'bēi',   en: 'cup',    art: 'cup' },
      { zh: '匙羹',      yue: '匙羹', py: 'chí gēng', en: 'spoon', art: 'spoon' },
      { zh: '書',        yue: '書',   py: 'shū',   en: 'book',   art: 'book' },
      { zh: '鐘',        yue: '鐘',   py: 'zhōng', en: 'clock',  art: 'clock' },
      { zh: '椅子',      yue: '椅',   py: 'yǐ zi', en: 'chair',  art: 'chair' },
    ],
  },
};

/* 動物題庫由 ANIMAL_DATA 自動產生 */
window.buildAnimalTopic = function () {
  const seen = new Set();
  const items = [];
  for (const a of window.ANIMAL_DATA) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    items.push({ zh: a.zh, yue: a.yue, py: a.py, en: a.en.toLowerCase(), art: 'animal:' + a.id, emoji: a.emoji, family: a.family || null });
  }
  return { zh: '動物', en: 'Animals', emoji: '🐾', artType: 'animal', items };
};
