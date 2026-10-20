/* =========================================================================
 *  Lucian's Magic World — 資料：動物（第二部分探索 + 第一部分動物題庫）
 *  rarity: 1 常見 / 2 少見 / 3 稀有 / 4 傳說
 *  size:   影子大小比例（1 = 一般）
 * ========================================================================= */
window.ANIMAL_DATA = [
  /* ---------------- 沙灘 beach ---------------- */
  {
    id: 'crab', emoji: '🦀', loc: 'beach', family: 'crab', rarity: 1, size: 1.0, clip: 'crab',
    zh: '蟹', py: 'xiè', yue: '蟹', en: 'Crab',
    facts: [
      '蟹仔有十隻腳，其中兩隻係大鉗。',
      '蟹仔識得打橫行，行得好快㗎！',
      '蟹仔嘅殼會隨住長大而換新殼。',
      '有啲蟹會用貝殼做自己嘅小屋。',
    ],
  },
  {
    id: 'starfish', emoji: '⭐', loc: 'beach', rarity: 2, size: 0.95, clip: 'star',
    zh: '海星', py: 'hǎi xīng', yue: '海星', en: 'Starfish',
    facts: [
      '海星有五行，好似星星咁。',
      '如果海星斷咗一隻腳，佢會慢慢再生出嚟。',
      '海星冇腦，但係識得分昼同夜晚。',
      '海星鍾意食蜆同埋海螺。',
    ],
  },
  {
    id: 'seagull', emoji: '🐦', loc: 'beach', family: 'bird', rarity: 1, size: 1.05, clip: 'bird',
    zh: '海鷗', py: 'hǎi ōu', yue: '海鷗', en: 'Seagull',
    facts: [
      '海鷗係海邊最常見嘅雀仔。',
      '海鷗識得喺天空滑翔好耐都唔拍翼。',
      '海鷗嘅叫聲好似笑聲咁。',
      '海鷗最鍾意食魚同埋麵包碎。',
    ],
  },
  {
    id: 'turtle', emoji: '🐢', loc: 'beach', rarity: 1, size: 1.25, clip: 'turtle',
    zh: '海龜', py: 'hǎi guī', yue: '海龜', en: 'Sea Turtle',
    facts: [
      '海龜游水好叻，但係行路好慢。',
      '海龜媽媽會爬上沙灘生蛋。',
      '海龜蛋孵化之後，小海龜會自己爬向大海。',
      '有啲海龜可以活到一百歲以上！',
    ],
  },
  {
    id: 'fiddlercrab', emoji: '🦀', loc: 'beach', family: 'crab', rarity: 3, size: 0.85, clip: 'crab',
    zh: '招潮蟹', py: 'zhāo cháo xiè', yue: '招潮蟹', en: 'Fiddler Crab',
    facts: [
      '招潮蟹有一隻大鉗特別大隻。',
      '佢會舉起大鉗，好似打招呼咁。',
      '招潮蟹住喺沙灘上面嘅小洞。',
      '佢食沙入面細細隻嘅生物。',
    ],
  },

  /* ---------------- 海面 sea ---------------- */
  {
    id: 'dolphin', emoji: '🐬', loc: 'sea', family: 'cetacean', rarity: 2, size: 1.5, clip: 'dolphin',
    zh: '海豚', py: 'hǎi tún', yue: '海豚', en: 'Dolphin',
    facts: [
      '海豚係好聰明嘅海洋動物。',
      '佢哋用聲音同朋友傾偈。',
      '海豚會跳出水面上好高㗎！',
      '海豚係用肺呼吸，要浮上水面抖氣。',
    ],
  },
  {
    id: 'whale', emoji: '🐋', loc: 'sea', family: 'cetacean', rarity: 3, size: 2.1, clip: 'whale',
    zh: '鯨魚', py: 'jīng yú', yue: '鯨魚', en: 'Whale',
    facts: [
      '鯨魚係世界上最大嘅動物。',
      '佢可以噴出水花，好高好高。',
      '鯨魚嘅叫聲可以傳得好遠。',
      '雖然住喺海，但鯨魚都係要上水面呼吸。',
    ],
  },
  {
    id: 'seal', emoji: '🦭', loc: 'sea', rarity: 2, size: 1.2, clip: 'seal',
    zh: '海豹', py: 'hǎi bào', yue: '海豹', en: 'Seal',
    facts: [
      '海豹有圓圓嘅身體同埋短短嘅鰭。',
      '佢喺水入面游得好快，喺陸地就行得好慢。',
      '海豹BB有白色毛毛，好可愛。',
      '海豹鍾意攤喺石頭上曬太陽。',
    ],
  },
  {
    id: 'flyingfish', emoji: '🐟', loc: 'sea', family: 'fish', rarity: 3, size: 1.0, clip: 'fish',
    zh: '飛魚', py: 'fēi yú', yue: '飛魚', en: 'Flying Fish',
    facts: [
      '飛魚識得跳出水面，用鰭滑翔。',
      '佢可以喺空中飛十幾米咁遠。',
      '飛魚飛起嚟係為咗避開大魚。',
      '飛魚嘅鰭又大又長，好似翅膀。',
    ],
  },

  /* ---------------- 海底 underwater ---------------- */
  {
    id: 'octopus', emoji: '🐙', loc: 'underwater', rarity: 2, size: 1.2, clip: 'octopus',
    zh: '八爪魚', py: 'bā zhuǎ yú', yue: '八爪魚', en: 'Octopus',
    facts: [
      '八爪魚有八隻手。',
      '佢識得變色，可以同周圍環境一樣。',
      '八爪魚好聰明，識得打開樽蓋。',
      '遇到危險佢會噴墨汁遮住自己。',
    ],
  },
  {
    id: 'clownfish', emoji: '🐠', loc: 'underwater', family: 'fish', rarity: 1, size: 0.9, clip: 'fish',
    zh: '小丑魚', py: 'xiǎo chǒu yú', yue: '小丑魚', en: 'Clownfish',
    facts: [
      '小丑魚身上有白色同橙色嘅條紋。',
      '佢住喺海葵入面，海葵會保護佢。',
      '小丑魚唔會被海葵刺傷。',
      '小丑魚爸爸會照顧魚卵。',
    ],
  },
  {
    id: 'jellyfish', emoji: '🪼', loc: 'underwater', rarity: 2, size: 1.2, clip: 'jelly',
    zh: '水母', py: 'shuǐ mǔ', yue: '水母', en: 'Jellyfish',
    facts: [
      '水母好似一把透明嘅雨傘。',
      '佢身體入面大部分都係水。',
      '水母會發光，好靚㗎！',
      '有啲水母會刺人，要小心唔好亂摸。',
    ],
  },
  {
    id: 'seahorse', emoji: '🐴', loc: 'underwater', rarity: 3, size: 0.95, clip: 'horse',
    zh: '海馬', py: 'hǎi mǎ', yue: '海馬', en: 'Seahorse',
    facts: [
      '海馬嘅頭好似馬仔。',
      '海馬爸爸會生BB㗎！',
      '佢用尾巴捲住海草，唔會沖走。',
      '海馬游得好慢，用背鰭不停擺動。',
    ],
  },
  {
    id: 'shark', emoji: '🦈', loc: 'underwater', rarity: 3, size: 1.8, clip: 'shark',
    zh: '鯊魚', py: 'shā yú', yue: '鯊魚', en: 'Shark',
    facts: [
      '鯊魚嘅牙齒掉咗會再生新嘅。',
      '鯊魚游水嘅時候要不停郁吓。',
      '鯊魚可以聞到好遠嘅味道。',
      '世界上有超過五百種鯊魚。',
    ],
  },

  /* ---------------- 河流 river ---------------- */
  {
    id: 'duck', emoji: '🦆', loc: 'river', family: 'bird', rarity: 1, size: 1.0, clip: 'duck',
    zh: '鴨', py: 'yā', yue: '鴨', en: 'Duck',
    facts: [
      '鴨嘅腳有蹼，游水好叻。',
      '鴨叫聲係「嘎嘎嘎」。',
      '鴨仔會跟住鴨媽媽排隊行。',
      '鴨嘅羽毛有油，所以唔會濕。',
    ],
  },
  {
    id: 'frog', emoji: '🐸', loc: 'river', rarity: 1, size: 0.9, clip: 'frog',
    zh: '青蛙', py: 'qīng wā', yue: '青蛙', en: 'Frog',
    facts: [
      '青蛙識得跳，捉蟲好犀利。',
      '青蛙BB叫蝌蚪，住喺水入面。',
      '青蛙嘅叫聲係「呱呱呱」。',
      '青蛙用皮膚飲水。',
    ],
  },
  {
    id: 'crocodile', emoji: '🐊', loc: 'river', rarity: 3, size: 1.7, clip: 'croc',
    zh: '鱷魚', py: 'è yú', yue: '鱷魚', en: 'Crocodile',
    facts: [
      '鱷魚有大牙同硬硬嘅鱗片。',
      '佢會靜靜雞喺河邊等獵物。',
      '鱷魚媽媽會用口幫BB離開蛋。',
      '鱷魚可以幾個星期都唔食嘢。',
    ],
  },
  {
    id: 'salmon', emoji: '🐟', loc: 'river', family: 'fish', rarity: 2, size: 1.0, clip: 'fish',
    zh: '三文魚', py: 'sān wén yú', yue: '三文魚', en: 'Salmon',
    facts: [
      '三文魚會由大海游返河流生蛋。',
      '佢要跳出瀑布先游到上游。',
      '三文魚記得自己出世嘅地方。',
      '三文魚嘅肉係橙橙色。',
    ],
  },

  /* ---------------- 森林 forest ---------------- */
  {
    id: 'bear', emoji: '🐻', loc: 'forest', family: 'bear', rarity: 2, size: 1.4, clip: 'bear',
    zh: '熊', py: 'xióng', yue: '熊', en: 'Bear',
    facts: [
      '熊好鍾意食蜂蜜同埋莓。',
      '冬天有啲熊會瞓好耐，叫做冬眠。',
      '熊嘅鼻子好嗅得。',
      '熊熊BB會跟住媽媽學搵嘢食。',
    ],
  },
  {
    id: 'fox', emoji: '🦊', loc: 'forest', family: 'fox', rarity: 2, size: 1.0, clip: 'fox',
    zh: '狐狸', py: 'hú lí', yue: '狐狸', en: 'Fox',
    facts: [
      '狐狸有條長長嘅尾巴。',
      '狐狸好聰明，識得避開危險。',
      '佢嘅耳朵好靈敏。',
      '狐狸會住喺地洞入面。',
    ],
  },
  {
    id: 'squirrel', emoji: '🐿️', loc: 'forest', rarity: 1, size: 0.85, clip: 'squirrel',
    zh: '松鼠', py: 'sōng shǔ', yue: '松鼠', en: 'Squirrel',
    facts: [
      '松鼠有條毛毛大尾巴。',
      '佢會儲起果實，留返冬天食。',
      '松鼠好叻爬樹。',
      '松鼠會用尾巴保持平衡。',
    ],
  },
  {
    id: 'owl', emoji: '🦉', loc: 'forest', family: 'owl', rarity: 2, size: 1.0, clip: 'owl',
    zh: '貓頭鷹', py: 'māo tóu yīng', yue: '貓頭鷹', en: 'Owl',
    facts: [
      '貓頭鷹眼仔大大，夜晚先出嚟。',
      '佢嘅頭可以轉到好後。',
      '貓頭鷹飛嘅時候冇聲，好靜。',
      '貓頭鷹嘅叫聲係「咕咕」。',
    ],
  },
  {
    id: 'bee', emoji: '🐝', loc: 'forest', rarity: 2, size: 0.8, clip: 'bee',
    zh: '蜜蜂', py: 'mì fēng', yue: '蜜蜂', en: 'Bee',
    facts: [
      '蜜蜂會採花蜜，整成蜂蜜。',
      '蜜蜂住喺蜂巢入面。',
      '蜜蜂跳舞係為咗話俾朋友知邊度有花。',
      '蜜蜂有黃色同黑色嘅條紋。',
    ],
  },

  /* ---------------- 草原 grass ---------------- */
  {
    id: 'lion', emoji: '🦁', loc: 'grass', rarity: 3, size: 1.4, clip: 'lion',
    zh: '獅子', py: 'shī zi', yue: '獅子', en: 'Lion',
    facts: [
      '獅子爸爸有長長嘅鬃毛。',
      '獅子嘅叫聲好大聲，可以傳好遠。',
      '獅子一家一齊住，叫做獅群。',
      '獅子媽媽負責捉食物。',
    ],
  },
  {
    id: 'zebra', emoji: '🦓', loc: 'grass', rarity: 2, size: 1.4, clip: 'zebra',
    zh: '斑馬', py: 'bān mǎ', yue: '斑馬', en: 'Zebra',
    facts: [
      '斑馬身上有黑白色嘅條紋。',
      '每隻斑馬嘅條紋都唔同，好似指紋咁。',
      '斑馬一齊住，可以互相保護。',
      '斑馬跑得好快，可以避開獅子。',
    ],
  },
  {
    id: 'giraffe', emoji: '🦒', loc: 'grass', rarity: 3, size: 1.7, clip: 'giraffe',
    zh: '長頸鹿', py: 'cháng jǐng lù', yue: '長頸鹿', en: 'Giraffe',
    facts: [
      '長頸鹿嘅頸好長，可以食到高高嘅樹葉。',
      '長頸鹿係世界上最高嘅動物。',
      '佢嘅舌頭又長又深色。',
      '長頸鹿瞓覺時間好短。',
    ],
  },
  {
    id: 'elephant', emoji: '🐘', loc: 'grass', rarity: 3, size: 1.8, clip: 'elephant',
    zh: '大象', py: 'dà xiàng', yue: '大象', en: 'Elephant',
    facts: [
      '大象有長長嘅鼻子，可以飲水同洗澡。',
      '大象嘅耳朵好大，可以散熱。',
      '大象記性好好。',
      '大象行路嘅時候，地下都會震。',
    ],
  },
  {
    id: 'monkey', emoji: '🐒', loc: 'grass', rarity: 1, size: 0.95, clip: 'monkey',
    zh: '馬騮', py: 'mǎ liū', yue: '馬騮', en: 'Monkey',
    facts: [
      '馬騮好叻爬樹。',
      '馬騮有隻長尾巴，可以抓住樹枝。',
      '馬騮鍾意食生果。',
      '馬騮會一齊玩，好熱鬧。',
    ],
  },

  /* ---------------- 沙漠 desert ---------------- */
  {
    id: 'camel', emoji: '🐫', loc: 'desert', rarity: 2, size: 1.4, clip: 'camel',
    zh: '駱駝', py: 'luò tuo', yue: '駱駝', en: 'Camel',
    facts: [
      '駱駝背上面有駝峰，可以儲脂肪。',
      '駱駝可以好耐都唔飲水。',
      '駱駝嘅眼睫毛好長，可以擋沙。',
      '駱駝識得喺沙漠行好遠。',
    ],
  },
  {
    id: 'fennec', emoji: '🦊', loc: 'desert', family: 'fox', rarity: 3, size: 0.8, clip: 'fox',
    zh: '耳郭狐', py: 'ěr guō hú', yue: '耳郭狐', en: 'Fennec Fox',
    facts: [
      '耳郭狐有大耳朵，可以散熱。',
      '佢係最細隻嘅狐狸。',
      '耳郭狐夜晚先出嚟搵嘢食。',
      '佢住喺沙漠嘅地洞入面。',
    ],
  },
  {
    id: 'scorpion', emoji: '🦂', loc: 'desert', rarity: 4, size: 0.8, clip: 'scorpion',
    zh: '蠍子', py: 'xiē zi', yue: '蠍子', en: 'Scorpion',
    facts: [
      '蠍子有鉗同埋一條有刺嘅尾巴。',
      '蠍子夜晚先出嚟活動。',
      '蠍子媽媽會背住BB行。',
      '蠍子識得喺沙入面匿埋。',
    ],
  },
  {
    id: 'rattlesnake', emoji: '🐍', loc: 'desert', rarity: 4, size: 1.1, clip: 'snake',
    zh: '響尾蛇', py: 'xiǎng wěi shé', yue: '響尾蛇', en: 'Rattlesnake',
    facts: [
      '響尾蛇嘅尾巴會發出「沙沙」聲。',
      '佢用舌頭聞味道。',
      '響尾蛇冇腳，用身體爬行。',
      '佢會蛻皮，換新皮膚。',
    ],
  },

  /* ---------------- 雪地 snow ---------------- */
  {
    id: 'penguin', emoji: '🐧', loc: 'snow', rarity: 2, size: 1.1, clip: 'penguin',
    zh: '企鵝', py: 'qǐ é', yue: '企鵝', en: 'Penguin',
    facts: [
      '企鵝唔識飛，但係游水好叻。',
      '企鵝爸爸會孵蛋。',
      '企鵝一齊行，可以互相取暖。',
      '企鵝嘅黑白顏色好似穿西裝。',
    ],
  },
  {
    id: 'polarbear', emoji: '🐻‍❄️', loc: 'snow', family: 'bear', rarity: 4, size: 1.5, clip: 'bear',
    zh: '北極熊', py: 'běi jí xióng', yue: '北極熊', en: 'Polar Bear',
    facts: [
      '北極熊有厚厚嘅白色毛毛。',
      '佢游水好叻，可以游好遠。',
      '北極熊嘅皮膚其實係黑色。',
      '北極熊住喺北極嘅冰上面。',
    ],
  },
  {
    id: 'snowyowl', emoji: '🦉', loc: 'snow', family: 'owl', rarity: 3, size: 1.0, clip: 'owl',
    zh: '雪鴞', py: 'xuě xiāo', yue: '雪鴞', en: 'Snowy Owl',
    facts: [
      '雪鴞有白色嘅羽毛，好似雪咁。',
      '佢嘅眼睛係黃色。',
      '雪鴞飛得好靜。',
      '佢住喺好凍嘅地方。',
    ],
  },
];

window.LOCATIONS = [
  { id: 'beach',      zh: '沙灘',   en: 'Beach',      emoji: '🏖️', theme: 'beach' },
  { id: 'sea',        zh: '海面',   en: 'Sea',        emoji: '⛵', theme: 'sea' },
  { id: 'underwater', zh: '海底',   en: 'Underwater', emoji: '🐠', theme: 'underwater' },
  { id: 'river',      zh: '河流',   en: 'River',      emoji: '🏞️', theme: 'river' },
  { id: 'forest',     zh: '森林',   en: 'Forest',     emoji: '🌳', theme: 'forest' },
  { id: 'grass',      zh: '草原',   en: 'Grassland',  emoji: '🌾', theme: 'grass' },
  { id: 'desert',     zh: '沙漠',   en: 'Desert',     emoji: '🏜️', theme: 'desert' },
  { id: 'snow',       zh: '雪地',   en: 'Snow',       emoji: '❄️', theme: 'snow' },
];

window.RARITY = {
  1: { zh: '普通',  color: '#7ed957', glow: '#b6ff8a', stars: 1 },
  2: { zh: '少見',  color: '#4aa8ff', glow: '#9bd0ff', stars: 2 },
  3: { zh: '稀有',  color: '#c36bff', glow: '#e3b3ff', stars: 3 },
  4: { zh: '傳說',  color: '#ffb300', glow: '#ffe28a', stars: 4 },
};
