/* =========================================================================
 *  動物資料 — 河流 river（新增 12 種，連原有 4 種 = 16）
 * ========================================================================= */
window.ANIMAL_DATA.push(
  {
    id: 'otter', emoji: '🦦', loc: 'river', rarity: 2, size: 1.1,
    zh: '水獺', py: 'shuǐ tǎ', yue: '水獺', en: 'Otter',
    facts: [
      '水獺游水好叻。',
      '佢會拖住同伴隻手一齊瞓。',
      '水獺最鍾意食魚。',
      '佢嘅毛濕咗都仲保暖。',
    ],
  },
  {
    id: 'beaver', emoji: '🦫', loc: 'river', rarity: 3, size: 1.15,
    zh: '河狸', py: 'hé lí', yue: '河狸', en: 'Beaver',
    facts: [
      '河狸用樹枝起水壩。',
      '佢有一隻又扁又闊嘅尾。',
      '河狸牙齒好利，識咬樹。',
      '佢會喺河邊起屋住。',
    ],
  },
  {
    id: 'catfish', emoji: '🐟', loc: 'river', rarity: 2, size: 1.1,
    zh: '鯰魚', py: 'nián yú', yue: '鯰魚', en: 'Catfish',
    facts: [
      '鯰魚嘴邊有幾條長鬚。',
      '佢用鬚感應食物。',
      '鯰魚鍾意住喺河底。',
      '佢夜晚先出嚟搵食。',
    ],
  },
  {
    id: 'koi', emoji: '🐟', loc: 'river', rarity: 2, size: 1.0,
    zh: '錦鯉', py: 'jǐn lǐ', yue: '錦鯉', en: 'Koi',
    facts: [
      '錦鯉顏色靚，有紅有白有金。',
      '佢可以活好多好多年。',
      '錦鯉鍾意喺池塘游來游去。',
      '佢會游上水面食嘢。',
    ],
  },
  {
    id: 'dragonfly', emoji: '🦟', loc: 'river', rarity: 2, size: 0.8,
    zh: '蜻蜓', py: 'qīng tíng', yue: '蜻蜓', en: 'Dragonfly',
    facts: [
      '蜻蜓有四塊透明翅膀。',
      '佢飛得又快又靈活。',
      '蜻蜓會喺水邊飛。',
      '佢食蚊同小昆蟲。',
    ],
  },
  {
    id: 'heron', emoji: '🐦', loc: 'river', family: 'bird', rarity: 2, size: 1.15,
    zh: '鷺', py: 'lù', yue: '鷺', en: 'Heron',
    facts: [
      '鷺有長長嘅腳同頸。',
      '佢會企喺水邊等魚。',
      '鷺啄魚嘅時候好快。',
      '佢飛起嘅時候頸會曲起。',
    ],
  },
  {
    id: 'watersnake', emoji: '🐍', loc: 'river', family: 'snake', rarity: 2, size: 1.0,
    zh: '水蛇', py: 'shuǐ shé', yue: '水蛇', en: 'Water Snake',
    facts: [
      '水蛇識得游水。',
      '佢會喺河邊搵青蛙同魚食。',
      '水蛇冇腳，用身體擺動前進。',
      '佢會蛻皮換新皮膚。',
    ],
  },
  {
    id: 'crayfish', emoji: '🦐', loc: 'river', family: 'crab', rarity: 2, size: 0.8,
    zh: '小龍蝦', py: 'xiǎo lóng xiā', yue: '小龍蝦', en: 'Crayfish',
    facts: [
      '小龍蝦有一對鉗。',
      '佢住喺河底石頭下面。',
      '小龍蝦會向後彈開。',
      '夜晚係佢最活躍嘅時候。',
    ],
  },
  {
    id: 'riverturtle', emoji: '🐢', loc: 'river', rarity: 2, size: 1.0,
    zh: '水龜', py: 'shuǐ guī', yue: '水龜', en: 'River Turtle',
    facts: [
      '水龜識游水又識爬上岸。',
      '佢會爬上石頭曬太陽。',
      '水龜食魚、蝦同水草。',
      '佢個殼可以保護自己。',
    ],
  },
  {
    id: 'minnow', emoji: '🐟', loc: 'river', rarity: 1, size: 0.7,
    zh: '鯽魚', py: 'jì yú', yue: '鯽魚', en: 'Minnow',
    facts: [
      '鯽魚細細隻，成群游。',
      '佢住喺河同池塘。',
      '鯽魚食水中小生物。',
      '佢游得好快好靈活。',
    ],
  },
  {
    id: 'eel', emoji: '🐍', loc: 'river', family: 'eel', rarity: 3, size: 1.05,
    zh: '鰻魚', py: 'mán yú', yue: '鰻魚', en: 'Eel',
    facts: [
      '鰻魚身體又長又滑。',
      '佢會匿喺泥入面。',
      '鰻魚夜晚先出嚟搵食。',
      '佢游水好似蛇咁擺動。',
    ],
  },
  {
    id: 'toad', emoji: '🐸', loc: 'river', family: 'frog', rarity: 2, size: 0.9,
    zh: '蟾蜍', py: 'chán chú', yue: '蟾蜍', en: 'Toad',
    facts: [
      '蟾蜍皮膚有小小粒粒。',
      '佢跳得冇青蛙咁遠。',
      '蟾蜍鍾意住喺潮濕嘅地方。',
      '佢食昆蟲同蝸牛。',
    ],
  }
);
