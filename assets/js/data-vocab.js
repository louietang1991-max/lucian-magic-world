/* =========================================================================
 *  Lucian 的魔法世界 — 學習題庫（第一部分）
 *  每個 item: zh 繁中 / yue 粵語用字 / py 拼音 / en 英文 / art 圖案 key
 *  img  = AI 圖 prompt（有就生成 3D 圖）
 *  zhOnly = true → 只出現喺「粵語聽聲揀字」（量詞呢類冇圖／英文難對應）
 * ========================================================================= */
window.VOCAB = {
  /* ---------------------------------------------------------------- 動物 */
  animal: {
    zh: '動物', en: 'Animals', emoji: '🐾', artType: 'animal',
    items: [
      { zh: '牛', yue: '牛', py: 'niú', en: 'cow', art: 'cow', img: 'cute cartoon cow with black and white spots and small horns' },
      { zh: '羊', yue: '羊', py: 'yáng', en: 'sheep', art: 'sheep', img: 'cute cartoon fluffy white sheep with a happy face' },
      { zh: '魚', yue: '魚', py: 'yú', en: 'fish', art: 'fish', img: 'cute cartoon orange fish with big eyes and fins' },
      { zh: '馬', yue: '馬', py: 'mǎ', en: 'horse', art: 'horse', img: 'cute cartoon brown horse with a mane and tail' },
      { zh: '兔', yue: '兔仔', py: 'tù', en: 'rabbit', art: 'rabbit', img: 'cute cartoon white rabbit with long ears and a fluffy tail' },
      { zh: '貓', yue: '貓', py: 'māo', en: 'cat', art: 'cat', img: 'cute cartoon orange tabby cat with big eyes' },
      { zh: '狗', yue: '狗', py: 'gǒu', en: 'dog', art: 'dog', img: 'cute cartoon brown puppy with floppy ears' },
      { zh: '鳥', yue: '雀仔', py: 'niǎo', en: 'bird', art: 'bird', img: 'cute cartoon little blue bird with a yellow beak' },
      { zh: '大象', yue: '大象', py: 'dà xiàng', en: 'elephant', art: 'elephant', img: 'cute cartoon grey elephant with big ears and a trunk' },
      { zh: '青蛙', yue: '青蛙', py: 'qīng wā', en: 'frog', art: 'frog', img: 'cute cartoon green frog with big eyes and a wide smile' },
    ],
  },
  /* ---------------------------------------------------------------- 水果 */
  fruit: {
    zh: '水果', en: 'Fruits', emoji: '🍎', artType: 'fruit',
    items: [
      { zh: '蘋果', yue: '蘋果', py: 'píng guǒ', en: 'apple', art: 'apple', img: 'a shiny red apple with a green leaf and a small stem' },
      { zh: '香蕉', yue: '香蕉', py: 'xiāng jiāo', en: 'banana', art: 'banana', img: 'a bunch of two ripe yellow bananas' },
      { zh: '橙', yue: '橙', py: 'chéng', en: 'orange', art: 'orange', img: 'a round orange fruit with a small green leaf' },
      { zh: '梨子', yue: '梨', py: 'lí zi', en: 'pear', art: 'pear', img: 'a green pear with a small brown stem and leaf' },
      { zh: '西瓜', yue: '西瓜', py: 'xī guā', en: 'watermelon', art: 'watermelon', img: 'a slice of watermelon with green rind, red flesh and black seeds' },
      { zh: '葡萄', yue: '提子', py: 'pú táo', en: 'grapes', art: 'grapes', img: 'a bunch of purple grapes with a green stem and leaf' },
      { zh: '草莓', yue: '士多啤梨', py: 'cǎo méi', en: 'strawberry', art: 'strawberry', img: 'a red strawberry with tiny seeds and a green leafy top' },
      { zh: '牛油果', yue: '牛油果', py: 'niú yóu guǒ', en: 'avocado', art: 'avocado', img: 'a halved avocado with a brown pit and green skin' },
    ],
  },
  /* ---------------------------------------------------------------- 蔬菜 */
  veg: {
    zh: '蔬菜', en: 'Vegetables', emoji: '🥕', artType: 'veg',
    items: [
      { zh: '紅蘿蔔', yue: '紅蘿蔔', py: 'hóng luó bo', en: 'carrot', art: 'carrot', img: 'an orange carrot with a green leafy top' },
      { zh: '番茄', yue: '番茄', py: 'fān qié', en: 'tomato', art: 'tomato', img: 'a round red tomato with a green star-shaped top' },
      { zh: '粟米', yue: '粟米', py: 'sù mǐ', en: 'corn', art: 'corn', img: 'a yellow corn cob with green husk leaves' },
      { zh: '青瓜', yue: '青瓜', py: 'qīng guā', en: 'cucumber', art: 'cucumber', img: 'a green cucumber with small bumps' },
      { zh: '蘑菇', yue: '蘑菇', py: 'mó gu', en: 'mushroom', art: 'mushroom', img: 'a cute red mushroom with white spots and a pale stem' },
      { zh: '西蘭花', yue: '西蘭花', py: 'xī lán huā', en: 'broccoli', art: 'broccoli', img: 'a green broccoli with a thick pale stem' },
      { zh: '薯仔', yue: '薯仔', py: 'shǔ zǎi', en: 'potato', art: 'potato', img: 'a brown potato with a few spots' },
      { zh: '洋蔥', yue: '洋蔥', py: 'yáng cōng', en: 'onion', art: 'onion', img: 'a purple onion with a small green sprout on top' },
    ],
  },
  /* ---------------------------------------------------------- 交通工具 */
  vehicle: {
    zh: '交通工具', en: 'Transport', emoji: '🚗', artType: 'vehicle',
    items: [
      { zh: '火車', yue: '火車', py: 'huǒ chē', en: 'train', art: 'train', img: 'a cute green toy train engine with a chimney and wheels' },
      { zh: '巴士', yue: '巴士', py: 'bā shì', en: 'bus', art: 'bus', img: 'a cute yellow bus with windows and black wheels' },
      { zh: '單車', yue: '單車', py: 'dān chē', en: 'bicycle', art: 'bike', img: 'a cute pink bicycle with two wheels and a basket' },
      { zh: '電車', yue: '電車', py: 'diàn chē', en: 'tram', art: 'tram', img: 'a cute green double-decker Hong Kong tram with a pole and windows' },
      { zh: '飛機', yue: '飛機', py: 'fēi jī', en: 'airplane', art: 'plane', img: 'a cute white and blue aeroplane with wings and a tail' },
      { zh: '渡輪', yue: '渡輪', py: 'dù lún', en: 'ferry', art: 'ferry', img: 'a cute small two-deck ferry boat, red and white, with windows' },
      { zh: '直昇機', yue: '直升機', py: 'zhí shēng jī', en: 'helicopter', art: 'heli', img: 'a cute blue helicopter with a big rotor on top' },
      { zh: '的士', yue: '的士', py: 'dí shì', en: 'taxi', art: 'taxi', img: 'a cute red Hong Kong taxi car with a roof sign' },
    ],
  },
  /* ---------------------------------------------------------------- 顏色 */
  color: {
    zh: '顏色', en: 'Colors', emoji: '🎨', artType: 'color',
    items: [
      { zh: '紅', yue: '紅色', py: 'hóng', en: 'red', art: 'swatch', c: '#ff3b3b', img: 'a glossy red 3D paint blob, shiny, simple' },
      { zh: '黃', yue: '黃色', py: 'huáng', en: 'yellow', art: 'swatch', c: '#ffd60a', img: 'a glossy yellow 3D paint blob, shiny, simple' },
      { zh: '藍', yue: '藍色', py: 'lán', en: 'blue', art: 'swatch', c: '#3a86ff', img: 'a glossy blue 3D paint blob, shiny, simple' },
      { zh: '綠', yue: '綠色', py: 'lǜ', en: 'green', art: 'swatch', c: '#2ec27e', img: 'a glossy green 3D paint blob, shiny, simple' },
      { zh: '橙', yue: '橙色', py: 'chéng', en: 'orange', art: 'swatch', c: '#ff9f1c', img: 'a glossy orange 3D paint blob, shiny, simple' },
      { zh: '紫', yue: '紫色', py: 'zǐ', en: 'purple', art: 'swatch', c: '#9d4edd', img: 'a glossy purple 3D paint blob, shiny, simple' },
      { zh: '黑', yue: '黑色', py: 'hēi', en: 'black', art: 'swatch', c: '#2b2438', img: 'a glossy black 3D ball, shiny, simple' },
      { zh: '白', yue: '白色', py: 'bái', en: 'white', art: 'swatch', c: '#f7f7fb', img: 'a glossy white 3D ball, shiny, simple' },
    ],
  },
  /* ---------------------------------------------------------------- 形狀 */
  shape: {
    zh: '形狀', en: 'Shapes', emoji: '🔺', artType: 'shape',
    items: [
      { zh: '圓形', yue: '圓形', py: 'yuán xíng', en: 'circle', art: 'circle', c: '#ff595e' },
      { zh: '正方形', yue: '正方形', py: 'zhèng fāng xíng', en: 'square', art: 'square', c: '#1982c4' },
      { zh: '三角形', yue: '三角形', py: 'sān jiǎo xíng', en: 'triangle', art: 'triangle', c: '#8ac926' },
      { zh: '星形', yue: '星形', py: 'xīng xíng', en: 'star', art: 'star', c: '#ffca3a' },
      { zh: '心形', yue: '心形', py: 'xīn xíng', en: 'heart', art: 'heart', c: '#ff5d8f' },
      { zh: '橢圓形', yue: '橢圓形', py: 'tuǒ yuán xíng', en: 'oval', art: 'oval', c: '#6a4c93' },
      { zh: '長方形', yue: '長方形', py: 'cháng fāng xíng', en: 'rectangle', art: 'rectangle', c: '#ff924c' },
    ],
  },
  /* ---------------------------------------------------------------- 數字 */
  number: {
    zh: '數字', en: 'Numbers', emoji: '🔢', artType: 'number',
    items: [
      { zh: '一', yue: '一', py: 'yī', en: 'one', art: 'n1', n: 1 },
      { zh: '二', yue: '二', py: 'èr', en: 'two', art: 'n2', n: 2 },
      { zh: '三', yue: '三', py: 'sān', en: 'three', art: 'n3', n: 3 },
      { zh: '四', yue: '四', py: 'sì', en: 'four', art: 'n4', n: 4 },
      { zh: '五', yue: '五', py: 'wǔ', en: 'five', art: 'n5', n: 5 },
      { zh: '六', yue: '六', py: 'liù', en: 'six', art: 'n6', n: 6 },
      { zh: '七', yue: '七', py: 'qī', en: 'seven', art: 'n7', n: 7 },
      { zh: '八', yue: '八', py: 'bā', en: 'eight', art: 'n8', n: 8 },
      { zh: '九', yue: '九', py: 'jiǔ', en: 'nine', art: 'n9', n: 9 },
      { zh: '十', yue: '十', py: 'shí', en: 'ten', art: 'n10', n: 10 },
    ],
  },
  /* ---------------------------------------------------------------- 身體 */
  body: {
    zh: '身體', en: 'Body', emoji: '👀', artType: 'body',
    items: [
      { zh: '口', yue: '口', py: 'kǒu', en: 'mouth', art: 'mouth', img: 'a cute cartoon open smiling mouth, just lips and teeth, close-up, pink' },
      { zh: '耳', yue: '耳仔', py: 'ěr', en: 'ear', art: 'ears', img: 'a cute cartoon human ear, single, close-up, skin colour' },
      { zh: '手', yue: '手', py: 'shǒu', en: 'hand', art: 'hand', img: 'a cute cartoon child hand with five fingers, palm open, skin colour' },
      { zh: '眼', yue: '眼', py: 'yǎn', en: 'eye', art: 'eyes', img: 'a pair of cute cartoon eyes with big shiny pupils and lashes' },
      { zh: '牙', yue: '牙', py: 'yá', en: 'tooth', art: 'teeth', img: 'a cute cartoon white tooth with a happy face, dental style' },
      { zh: '鼻', yue: '鼻', py: 'bí', en: 'nose', art: 'nose', img: 'a cute cartoon human nose, simple, skin colour, front view' },
      { zh: '腳', yue: '腳', py: 'jiǎo', en: 'foot', art: 'foot', img: 'a cute cartoon child foot with five toes, side view, skin colour' },
      { zh: '足', yue: '足', py: 'zú', en: 'foot', art: 'foot2', img: 'a single human bare foot, sole and toes clearly visible, skin colour, no fur, not an animal' },
    ],
  },
  /* ---------------------------------------------------------------- 自然 */
  nature: {
    zh: '自然', en: 'Nature', emoji: '🌳', artType: 'nature',
    items: [
      { zh: '日', yue: '太陽', py: 'rì', en: 'sun', art: 'sun', img: 'a cute cartoon bright yellow sun with a smiling face and rays' },
      { zh: '月', yue: '月亮', py: 'yuè', en: 'moon', art: 'moon', img: 'a cute cartoon crescent moon, pale yellow, friendly face' },
      { zh: '天', yue: '天空', py: 'tiān', en: 'sky', art: 'sky', img: 'a plain bright blue sky with a few soft white fluffy clouds, no words, no letters' },
      { zh: '星', yue: '星星', py: 'xīng', en: 'star', art: 'star', img: 'a cute cartoon yellow five-point star with a happy face' },
      { zh: '雲', yue: '雲', py: 'yún', en: 'cloud', art: 'cloud', img: 'a fluffy white cartoon cloud with a soft smile' },
      { zh: '石', yue: '石頭', py: 'shí', en: 'rock', art: 'rock', img: 'a cute cartoon grey rock, rounded, with small highlights' },
      { zh: '雨', yue: '雨', py: 'yǔ', en: 'rain', art: 'rain', img: 'a cute cartoon rain cloud with blue raindrops falling' },
      { zh: '火', yue: '火', py: 'huǒ', en: 'fire', art: 'fire', img: 'a cute cartoon campfire flame, warm orange and yellow, friendly' },
      { zh: '水', yue: '水', py: 'shuǐ', en: 'water', art: 'water', img: 'a cute cartoon water droplet with a small splash, shiny blue' },
      { zh: '木', yue: '木', py: 'mù', en: 'wood', art: 'wood', img: 'a cute cartoon wooden log with brown bark' },
      { zh: '花', yue: '花', py: 'huā', en: 'flower', art: 'flower', img: 'a cute cartoon pink flower with green leaves' },
      { zh: '草', yue: '草', py: 'cǎo', en: 'grass', art: 'grassimg', img: 'a small patch of cute cartoon green grass blades' },
      { zh: '樹', yue: '樹', py: 'shù', en: 'tree', art: 'tree', img: 'a cute cartoon green tree with a brown trunk' },
      { zh: '土', yue: '泥土', py: 'tǔ', en: 'soil', art: 'soil', img: 'a small cute pile of brown soil with a green sprout' },
      { zh: '田', yue: '田', py: 'tián', en: 'field', art: 'field', img: 'a cute cartoon rice paddy field with green rows of crops' },
      { zh: '春', yue: '春天', py: 'chūn', en: 'spring', art: 'spring', img: 'a cute spring scene with cherry blossoms, green grass and butterflies' },
      { zh: '夏', yue: '夏天', py: 'xià', en: 'summer', art: 'summer', img: 'a cute summer scene with bright sun, beach ball and blue sky' },
      { zh: '秋', yue: '秋天', py: 'qiū', en: 'autumn', art: 'autumn', img: 'a cute autumn scene with orange leaves falling and small pumpkins' },
      { zh: '冬', yue: '冬天', py: 'dōng', en: 'winter', art: 'winter', img: 'a cute winter scene with snowflakes and a snowy tree' },
    ],
  },
  /* -------------------------------------------------------------- 形容詞 */
  adj: {
    zh: '形容詞', en: 'Describing words', emoji: '📏', artType: 'adj',
    items: [
      { zh: '大', yue: '大', py: 'dà', en: 'big', art: 'big', img: 'two cute cartoon elephants side by side, one very big and one tiny, to show big' },
      { zh: '小', yue: '細', py: 'xiǎo', en: 'small', art: 'small', img: 'a tiny cute cartoon mouse next to a big shoe, to show small' },
      { zh: '多', yue: '多', py: 'duō', en: 'many', art: 'many', img: 'a big pile of many colourful cartoon candies' },
      { zh: '少', yue: '少', py: 'shǎo', en: 'few', art: 'few', img: 'just two small cartoon candies on a plain surface, to show few' },
      { zh: '快', yue: '快', py: 'kuài', en: 'fast', art: 'fast', img: 'a cute cartoon cheetah running fast with motion lines' },
      { zh: '慢', yue: '慢', py: 'màn', en: 'slow', art: 'slow', img: 'a cute cartoon turtle walking slowly' },
      { zh: '高', yue: '高', py: 'gāo', en: 'tall', art: 'tall', img: 'a very tall cartoon giraffe next to a short tree, to show tall' },
      { zh: '矮', yue: '矮', py: 'ǎi', en: 'short', art: 'short', img: 'a short cute cartoon penguin next to a taller one, to show short' },
      { zh: '熱', yue: '熱', py: 'rè', en: 'hot', art: 'hot', img: 'a cute cartoon cup of hot drink with steam and a warm red glow' },
      { zh: '冷', yue: '凍', py: 'lěng', en: 'cold', art: 'cold', img: 'a cute cartoon ice cube with a scarf and snowflakes, blue' },
    ],
  },
  /* ---------------------------------------------------------------- 位置 */
  position: {
    zh: '位置', en: 'Position', emoji: '🔀', artType: 'position',
    items: [
      { zh: '上', yue: '上面', py: 'shàng', en: 'on top', art: 'pos-up', img: 'a cute ball sitting on top of a wooden box' },
      { zh: '下', yue: '下面', py: 'xià', en: 'under', art: 'pos-down', img: 'a cute round ball resting on the ground underneath an open wooden box, side view, no words' },
      { zh: '左', yue: '左邊', py: 'zuǒ', en: 'left', art: 'pos-left', img: 'two cartoon arrows pointing left and right, the left one glows yellow' },
      { zh: '右', yue: '右邊', py: 'yòu', en: 'right', art: 'pos-right', img: 'two cartoon arrows pointing left and right, the right one glows yellow' },
      { zh: '外面', yue: '外面', py: 'wài miàn', en: 'outside', art: 'pos-out', img: 'a cute ball outside a small house door, outdoors' },
      { zh: '裡面', yue: '裡面', py: 'lǐ miàn', en: 'inside', art: 'pos-in', img: 'a cute ball inside a cardboard box, to show inside' },
    ],
  },
  /* ---------------------------------------------------------------- 人物 */
  people: {
    zh: '人物', en: 'People', emoji: '👨‍👩‍👧', artType: 'people',
    items: [
      { zh: '爸', yue: '爸爸', py: 'bà', en: 'dad', art: 'dad', img: 'a cute cartoon father, friendly smile, blue shirt, full body' },
      { zh: '媽', yue: '媽媽', py: 'mā', en: 'mum', art: 'mum', img: 'a cute cartoon mother, friendly smile, pink dress, full body' },
      { zh: '哥', yue: '哥哥', py: 'gē', en: 'big brother', art: 'brother', img: 'a cute cartoon boy, green t-shirt, full body' },
      { zh: '弟', yue: '弟弟', py: 'dì', en: 'little brother', art: 'little-bro', img: 'a cute cartoon small toddler boy, yellow t-shirt, full body' },
      { zh: '妹', yue: '妹妹', py: 'mèi', en: 'little sister', art: 'little-sis', img: 'a cute cartoon small toddler girl, purple dress, full body' },
      { zh: '姊', yue: '姐姐', py: 'zǐ', en: 'big sister', art: 'sister', img: 'a cute cartoon girl, red dress, full body' },
      { zh: '男', yue: '男仔', py: 'nán', en: 'boy', art: 'boy', img: 'a cute cartoon boy standing, blue t-shirt and shorts, full body' },
      { zh: '女', yue: '女仔', py: 'nǚ', en: 'girl', art: 'girl', img: 'a cute cartoon girl standing, pink dress, full body' },
      { zh: '人', yue: '人', py: 'rén', en: 'person', art: 'person', img: 'a cute cartoon person standing, friendly smile, full body' },
      { zh: '小朋友', yue: '小朋友', py: 'xiǎo péng yǒu', en: 'child', art: 'child', img: 'a cute cartoon happy child waving, full body' },
    ],
  },
  /* ---------------------------------------------------------------- 食物 */
  food: {
    zh: '食物', en: 'Food', emoji: '🍚', artType: 'food',
    items: [
      { zh: '米', yue: '米', py: 'mǐ', en: 'rice', art: 'rice', img: 'a cute bowl of white rice with a small green leaf' },
      { zh: '豆', yue: '豆', py: 'dòu', en: 'beans', art: 'beans', img: 'a few cute cartoon beans, green and red, round' },
      { zh: '果', yue: '生果', py: 'guǒ', en: 'fruit', art: 'fruitmix', img: 'a small group of cute cartoon fruits: apple, orange and grapes' },
      { zh: '奶', yue: '奶', py: 'nǎi', en: 'milk', art: 'milk', img: 'a cute cartoon carton of milk with a straw' },
      { zh: '肉', yue: '肉', py: 'ròu', en: 'meat', art: 'meat', img: 'a cute cartoon piece of meat on a bone' },
      { zh: '蛋', yue: '蛋', py: 'dàn', en: 'egg', art: 'egg', img: 'a cute cartoon fried egg with a yellow yolk' },
      { zh: '菜', yue: '菜', py: 'cài', en: 'vegetable', art: 'veggie', img: 'a bunch of fresh green cartoon vegetables' },
      { zh: '瓜', yue: '瓜', py: 'guā', en: 'melon', art: 'melon', img: 'a cute cartoon green melon with stripes' },
      { zh: '蛋糕', yue: '蛋糕', py: 'dàn gāo', en: 'cake', art: 'cake', img: 'a cute cartoon birthday cake with pink cream and a candle' },
    ],
  },
  /* ---------------------------------------------------------------- 動詞 */
  verb: {
    zh: '動詞', en: 'Action words', emoji: '🏃', artType: 'verb',
    items: [
      { zh: '走', yue: '走', py: 'zǒu', en: 'walk', art: 'walk', img: 'a cute cartoon child walking, side view, motion lines' },
      { zh: '坐', yue: '坐', py: 'zuò', en: 'sit', art: 'sit', img: 'a cute cartoon child sitting on a chair' },
      { zh: '跑', yue: '跑', py: 'pǎo', en: 'run', art: 'run', img: 'a cute cartoon child running fast with motion lines' },
      { zh: '跳', yue: '跳', py: 'tiào', en: 'jump', art: 'jump', img: 'a cute cartoon child jumping in the air with arms up' },
      { zh: '游', yue: '游水', py: 'yóu', en: 'swim', art: 'swim', img: 'a cute cartoon child swimming in blue water with goggles' },
      { zh: '行', yue: '行', py: 'xíng', en: 'go', art: 'walk2', img: 'a cute cartoon child walking forward with a small backpack' },
      { zh: '玩', yue: '玩', py: 'wán', en: 'play', art: 'play', img: 'a cute cartoon child playing with a ball, happy' },
      { zh: '拿', yue: '拎', py: 'ná', en: 'hold', art: 'hold', img: 'a cute cartoon hand holding a small red apple' },
      { zh: '拍', yue: '拍', py: 'pāi', en: 'clap', art: 'clap', img: 'two cute cartoon hands clapping together' },
      { zh: '打', yue: '打', py: 'dǎ', en: 'hit', art: 'hit', img: 'a cute cartoon hand gently tapping a drum' },
      { zh: '吃', yue: '食', py: 'chī', en: 'eat', art: 'eat', img: 'a cute cartoon child eating with a spoon, happy' },
      { zh: '叫', yue: '叫', py: 'jiào', en: 'shout', art: 'shout', img: 'a cute cartoon child calling out with hands around mouth' },
      { zh: '喝', yue: '飲', py: 'hē', en: 'drink', art: 'drink', img: 'a cute cartoon child drinking water from a cup' },
      { zh: '唱', yue: '唱', py: 'chàng', en: 'sing', art: 'sing', img: 'a cute cartoon child singing into a microphone with music notes' },
      { zh: '做', yue: '做', py: 'zuò', en: 'do', art: 'do', img: 'a cute cartoon child making a craft at a table' },
      { zh: '說', yue: '講', py: 'shuō', en: 'speak', art: 'speak', img: 'a cute cartoon child talking with a speech bubble' },
      { zh: '愛', yue: '愛', py: 'ài', en: 'love', art: 'love', img: 'a cute cartoon pink heart held in two hands' },
      { zh: '喜歡', yue: '鍾意', py: 'xǐ huān', en: 'like', art: 'like', img: 'a cute cartoon child hugging a teddy bear happily' },
      { zh: '看見', yue: '見到', py: 'kàn jiàn', en: 'see', art: 'see', img: 'a cute cartoon pair of eyes looking at a butterfly' },
      { zh: '聽', yue: '聽', py: 'tīng', en: 'listen', art: 'listen', img: 'a cute cartoon ear with music notes around it' },
    ],
  },
  /* ---------------------------------------------------------------- 物品 */
  item: {
    zh: '物品', en: 'Things', emoji: '📦', artType: 'item',
    items: [
      { zh: '紙', yue: '紙', py: 'zhǐ', en: 'paper', art: 'paper', img: 'a sheet of white paper with a tiny pencil' },
      { zh: '筆', yue: '筆', py: 'bǐ', en: 'pencil', art: 'pencil', img: 'a cute yellow pencil with a pink eraser' },
      { zh: '書', yue: '書', py: 'shū', en: 'book', art: 'book', img: 'a cute closed story book with a blue cover and a star' },
      { zh: '尺', yue: '尺', py: 'chǐ', en: 'ruler', art: 'ruler', img: 'a cute yellow ruler with markings' },
      { zh: '信', yue: '信', py: 'xìn', en: 'letter', art: 'letter', img: 'a cute envelope with a red heart seal' },
      { zh: '球', yue: '球', py: 'qiú', en: 'ball', art: 'ball', img: 'a cute colourful striped beach ball' },
      { zh: '玩具', yue: '玩具', py: 'wán jù', en: 'toys', art: 'toys', img: 'a small group of cute toys: teddy bear, block and ball' },
      { zh: '布', yue: '布', py: 'bù', en: 'cloth', art: 'cloth', img: 'a folded piece of soft blue cloth' },
      { zh: '門', yue: '門', py: 'mén', en: 'door', art: 'door', img: 'a cute cartoon wooden door with a round golden handle' },
      { zh: '窗', yue: '窗', py: 'chuāng', en: 'window', art: 'window', img: 'a cute cartoon window with blue glass and a wooden frame' },
      { zh: '桌子', yue: '枱', py: 'zhuō zi', en: 'table', art: 'table', img: 'a cute cartoon wooden table with four legs' },
      { zh: '椅子', yue: '椅', py: 'yǐ zi', en: 'chair', art: 'chair', img: 'a cute cartoon yellow wooden chair' },
      { zh: '燈', yue: '燈', py: 'dēng', en: 'lamp', art: 'lamp', img: 'a cute cartoon desk lamp glowing warm yellow' },
      { zh: '電視機', yue: '電視', py: 'diàn shì jī', en: 'TV', art: 'tv', img: 'a cute cartoon television set with a colour screen' },
      { zh: '牀', yue: '牀', py: 'chuáng', en: 'bed', art: 'bed', img: 'a cute cartoon bed with a blue blanket and a white pillow' },
      { zh: '電腦', yue: '電腦', py: 'diàn nǎo', en: 'computer', art: 'computer', img: 'a cute cartoon open laptop computer with a glowing screen' },
      { zh: '杯', yue: '杯', py: 'bēi', en: 'cup', art: 'cup', img: 'a cute orange cup with a handle and a straw' },
      { zh: '匙羹', yue: '匙羹', py: 'chí gēng', en: 'spoon', art: 'spoon', img: 'a shiny silver spoon' },
      { zh: '鐘', yue: '鐘', py: 'zhōng', en: 'clock', art: 'clock', img: 'a round yellow wall clock with two hands' },
    ],
  },
  /* ---------------------------------------------------------------- 量詞 */
  measure: {
    zh: '量詞', en: 'Measure words', emoji: '🧮', artType: 'measure', zhOnly: true,
    items: [
      { zh: '本', yue: '本', py: 'běn', en: 'measure word for books', art: 'mw-book' },
      { zh: '朵', yue: '朵', py: 'duǒ', en: 'measure word for flowers', art: 'mw-flower' },
      { zh: '位', yue: '位', py: 'wèi', en: 'measure word for people', art: 'mw-person' },
      { zh: '顆', yue: '顆', py: 'kē', en: 'measure word for small round things', art: 'mw-round' },
      { zh: '個', yue: '個', py: 'gè', en: 'general measure word', art: 'mw-general' },
      { zh: '隻', yue: '隻', py: 'zhī', en: 'measure word for animals', art: 'mw-animal' },
      { zh: '輛', yue: '架', py: 'liàng', en: 'measure word for vehicles', art: 'mw-vehicle' },
      { zh: '片', yue: '片', py: 'piàn', en: 'measure word for slices', art: 'mw-slice' },
    ],
  },
};

/* 動物圖鑑題庫由 ANIMAL_DATA 自動產生（35 隻動物） */
window.buildAnimalTopic = function () {
  const seen = new Set();
  const items = [];
  for (const a of window.ANIMAL_DATA) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    items.push({ zh: a.zh, yue: a.yue, py: a.py, en: a.en.toLowerCase(), art: 'animal:' + a.id, emoji: a.emoji, family: a.family || null });
  }
  return { zh: '動物圖鑑', en: 'Animal album', emoji: '🐬', artType: 'animal', items };
};
