/* =========================================================================
 *  動物資料 — 海面 sea（新增 12 種，連原有 4 種 = 16）
 * ========================================================================= */
window.ANIMAL_DATA.push(
  {
    id: 'orca', emoji: '🐋', loc: 'sea', rarity: 4, size: 1.5,
    zh: '虎鯨', py: 'hǔ jīng', yue: '虎鯨', en: 'Orca',
    facts: [
      '虎鯨係黑白兩色嘅大海豚。',
      '佢哋會成群一齊游水。',
      '虎鯨好聰明，識得合作捉魚。',
      '虎鯨背上面有一個大鰭。',
    ],
  },
  {
    id: 'swordfish', emoji: '🐟', loc: 'sea', rarity: 3, size: 1.2,
    zh: '劍魚', py: 'jiàn yú', yue: '劍魚', en: 'Swordfish',
    facts: [
      '劍魚嘅嘴好似一把劍。',
      '佢用長嘴撥開魚群。',
      '劍魚游水好快。',
      '佢係大海入面嘅獵人。',
    ],
  },
  {
    id: 'sailfish', emoji: '🐟', loc: 'sea', rarity: 3, size: 1.2,
    zh: '旗魚', py: 'qí yú', yue: '旗魚', en: 'Sailfish',
    facts: [
      '旗魚背上有一個好似帆嘅鰭。',
      '佢係游得最快嘅魚之一。',
      '旗魚會舉起背鰭嚇走敵人。',
      '佢個嘴又長又尖。',
    ],
  },
  {
    id: 'mantaray', emoji: '🐟', loc: 'sea', rarity: 3, size: 1.3,
    zh: '魔鬼魚', py: 'mó guǐ yú', yue: '魔鬼魚', en: 'Manta Ray',
    facts: [
      '魔鬼魚好似一個大風箏。',
      '佢用大翼拍水游動。',
      '魔鬼魚好溫柔，只食小蝦。',
      '佢會跳出水面。',
    ],
  },
  {
    id: 'sunfish', emoji: '🐟', loc: 'sea', rarity: 3, size: 1.2,
    zh: '翻車魚', py: 'fān chē yú', yue: '翻車魚', en: 'Sunfish',
    facts: [
      '翻車魚圓圓扁扁好可愛。',
      '佢係最重嘅硬骨魚。',
      '翻車魚鍾意浮上水面曬太陽。',
      '佢食水母。',
    ],
  },
  {
    id: 'tuna', emoji: '🐟', loc: 'sea', rarity: 2, size: 1.1,
    zh: '吞拿魚', py: 'tūn ná yú', yue: '吞拿魚', en: 'Tuna',
    facts: [
      '吞拿魚游得好快又游得好遠。',
      '佢身體流線型，好適合游水。',
      '吞拿魚會成群一齊游。',
      '佢係大海入面常見嘅魚。',
    ],
  },
  {
    id: 'albatross', emoji: '🐦', loc: 'sea', family: 'bird', rarity: 3, size: 1.2,
    zh: '信天翁', py: 'xìn tiān wēng', yue: '信天翁', en: 'Albatross',
    facts: [
      '信天翁嘅翼好長好長。',
      '佢可以飛好遠都唔使落地。',
      '信天翁會喺海面浮住休息。',
      '佢哋一生只會有一個伴侶。',
    ],
  },
  {
    id: 'hammerhead', emoji: '🦈', loc: 'sea', family: 'shark', rarity: 3, size: 1.3,
    zh: '雙髻鯊', py: 'shuāng jì shā', yue: '雙髻鯊', en: 'Hammerhead Shark',
    facts: [
      '雙髻鯊個頭好似一把錘仔。',
      '佢用個闊頭感應獵物。',
      '雙髻鯊會成群游水。',
      '佢游水嘅時候好有型。',
    ],
  },
  {
    id: 'stingray', emoji: '🐟', loc: 'sea', rarity: 2, size: 1.1,
    zh: '黃貂魚', py: 'huáng diāo yú', yue: '黃貂魚', en: 'Stingray',
    facts: [
      '黃貂魚扁扁地貼住海床。',
      '佢尾巴有一支刺。',
      '黃貂魚會撥沙搵蜆食。',
      '佢游水好似一隻大鳥飛過。',
    ],
  },
  {
    id: 'marlin', emoji: '🐟', loc: 'sea', rarity: 3, size: 1.2,
    zh: '槍魚', py: 'qiāng yú', yue: '槍魚', en: 'Marlin',
    facts: [
      '槍魚有個又長又尖嘅嘴。',
      '佢游水好快，識得跳起。',
      '槍魚背上有高高嘅鰭。',
      '佢係釣魚人最想捉嘅魚。',
    ],
  },
  {
    id: 'barracuda', emoji: '🐟', loc: 'sea', rarity: 2, size: 1.1,
    zh: '梭子魚', py: 'suō zi yú', yue: '梭子魚', en: 'Barracuda',
    facts: [
      '梭子魚身體又長又瘦。',
      '佢有尖尖嘅牙齒。',
      '梭子魚游得好快。',
      '佢會追住小魚游。',
    ],
  },
  {
    id: 'squid', emoji: '🦑', loc: 'sea', rarity: 2, size: 1.0,
    zh: '魷魚', py: 'yóu yú', yue: '魷魚', en: 'Squid',
    facts: [
      '魷魚有十隻腕足。',
      '佢識得噴墨汁避開敵人。',
      '魷魚游水會噴水推進。',
      '佢會變色保護自己。',
    ],
  }
);
