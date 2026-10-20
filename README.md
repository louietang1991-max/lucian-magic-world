# Lucian 的魔法世界 · Magic World

為 3 歲小朋友而設嘅**中／英／普學習 + 動物餵食節奏遊戲**，純 HTML5，手機直向操作，支援離線玩（PWA）。

> 所有圖案都係手繪 SVG，所有語音都係預先合成嘅 MP3 音檔（495 段），唔需要上網都可以玩。

---

## 一、點樣放上網（最快 3 分鐘）

整個資料夾就係一個靜態網站，冇 build step、冇 server-side code。以下任揀一個：

### 方法 A：Netlify Drop（最簡單，唔使 git）
1. 去 <https://app.netlify.com/drop>
2. 將**整個資料夾**（或者我幫你打包好嘅 `lucian-magic-world.zip`）拖入去
3. 即刻有條 `https://xxxx.netlify.app` 嘅網址，用手機開就得
4. （可選）註冊帳戶就可以改個好記嘅名，例如 `lucian-magic.netlify.app`

### 方法 B：GitHub Pages
```bash
git init
git add .
git commit -m "Lucian magic world v1.0"
git branch -M main
git remote add origin https://github.com/<你嘅帳號>/lucian-magic-world.git
git push -u origin main
```
然後去 repo → **Settings → Pages → Source: Deploy from a branch → main / (root)** → Save。
等 1 分鐘就有 `https://<你嘅帳號>.github.io/lucian-magic-world/`。

### 方法 C：Cloudflare Pages / Vercel
- Cloudflare Pages：Framework preset 揀 **None**，Build command 留空，Output directory 填 `/`
- Vercel：Import 個 repo，Framework 揀 **Other**，其餘留空

### 手機加到主畫面（似 App 咁全螢幕玩）
- **iPhone**：Safari 開網址 → 分享 → 「加入主畫面」
- **Android**：Chrome 開網址 → 右上角 ⋮ → 「安裝應用程式 / 加到主畫面」

---

## 二、遊戲內容

### 第一部分：學習小遊戲（每個遊戲 5 題）
| 遊戲 | 玩法 | 答案 |
|---|---|---|
| A 聽聲音，揀圖案 | 播放粵語／普通話／英語發音 | 4 選 1 圖案 |
| B 睇圖案，揀字詞 | 顯示圖案 | 4 選 1 中文字（附拼音）或英文字 |
| C 睇字詞，揀圖案 | 顯示中文字／英文字 | 4 選 1 圖案 |

- 答啱第一次 **+2 魔法生果**，第二次 **+1**，所以一個遊戲最多贏 **10 個**魔法生果
- 答錯有溫柔提示，可以再試（輕鬆模式，預設開啟）
- 題目庫（9 個主題）：動物、生果、蔬菜、交通工具、顏色、形狀、數字、身體、屋企

### 第二部分：尋找動物（8 個地點）
沙灘 · 海面 · 海底 · 河流 · 森林 · 草原 · 沙漠 · 雪地

1. 入到地點會**隨機出現 3–5 隻動物嘅影子**，匿喺沙／水／雪／樹葉下面
2. 小朋友用手指**撥開**沙／水，就會見到影子（影子外框顏色 = 稀有度）
3. 撳影子 → 餵食畫面：
   - **掟魔法生果**入圈圈（撳圈或由生果籃向上拉瞄準），越中間越高分（每次最多 20 分，共 3 次）
   - **跟拍子**：圈圈先跟節拍閃 4 下（數拍子），然後正式開始，跟住拍子撳圈圈（每拍最多 10 分，共 4 拍）
   - 無論成功失敗，動物都會現身，代表餵食成功
4. 分數越高 → 越多星 → 解鎖越多**動物冷知識**（最多 4 條）
5. 儲齊 **35 隻動物**圖鑑，稀有度分 4 級：普通（綠）· 少見（藍）· 稀有（紫）· 傳說（金）

---

## 三、家長設定（有計數鎖）

主頁右上角 **長按齒輪 1 秒** → 答啱一條加法 → 入到設定：

- **題目庫**：勾選想練嘅主題（最少一個）
- **發音語言**：粵語 / 普通話 / English（影響遊戲 A 同所有動物名讀音）
- **文字語言**：中文（附拼音）/ English（影響遊戲 B、C 顯示嘅字）
- **語速**：0.6x – 1.2x
- **節奏速度**：60 – 120 BPM（預設 90，覺得太快可以調慢）
- **音效開關**
- **答啱自動去下一題**
- **輕鬆模式**（答錯可以再試）
- **清除所有進度**

進度（魔法生果、圖鑑、統計）會自動存在手機瀏覽器（localStorage），換手機或清除網站資料就會冇。

---

## 四、本機測試 / 修改

```bash
npm start          # 開 http://127.0.0.1:8123
```

| 指令 | 做乜 |
|---|---|
| `npm start` | 起一個本機靜態 server（必須用 http:// 開，唔好直接 double click HTML） |
| `npm run audio` | 重新產生所有語音檔（需要網絡；會寫入 `assets/audio/`） |
| `npm run icons` | 由 `assets/img/logo.svg` 重新產生 PWA 圖示 |
| `npm test` | 用 Chrome 行一次完整流程測試（會出截圖喺 `tools/shots/`） |

### 專案結構
```
index.html                 入口（所有畫面嘅 HTML）
manifest.webmanifest       PWA 設定
sw.js                      Service Worker（離線快取）
assets/css/                theme.css / layout.css / games.css / feed.css
assets/js/
  data-animals.js          35 隻動物資料（名、稀有度、冷知識、family）
  data-vocab.js            9 個題目庫
  artwork.js               全部 SVG 手繪圖案（動物 + 物品）
  audio.js                 音檔播放 + Web Audio 音效合成
  rhythm.js                節拍器（精準排程）
  core.js                  狀態 / 畫面切換 / 小工具
  screen-*.js              每個畫面
assets/audio/              495 段預先合成語音 + manifest.json
assets/img/                Logo 同 App 圖示
tools/                     產生語音、圖示、測試用嘅 script
```

### 想加動物？
1. 喺 `assets/js/data-animals.js` 加一筆（`id / loc / rarity / zh / en / facts`）
2. 喺 `assets/js/artwork.js` 嘅 `ANIMALS` 加一個畫法函式（用 `ellipse / path / face / earsTri` 等 helper，畫布 200×200）
3. 跑 `npm run audio` 產生新嘅讀音同冷知識音檔

---

## 五、技術備註

- **語音**：預先用 Google Translate TTS 合成成 MP3（粵語 zh-HK、普通話 zh-CN、英語），遊戲時直接播放，因此任何手機／瀏覽器發音都一致
- **音效**：Web Audio API 即時合成（拍子聲、過關音樂、咬嘢聲），冇額外檔案
- **節拍**：Web Audio 排程 + `lookahead`，拍子誤差 < 10ms；評分容許 ±0.34 秒（對小朋友好寬鬆）
- **離線**：Service Worker 會 cache 核心檔案；語音係「用過先 cache」，所以第一次玩某個字會有少少載入時間，之後就唔使再落載
- **唔會收集任何個人資料**，冇分析、冇廣告、冇第三方追蹤

## 六、授權 / 注意

- 圖案（SVG）為本專案原創，可自由用於私人用途
- 語音由 Google Translate TTS 合成，僅供私人／家庭使用；如要公開發佈或商業使用，請自行替換為其他 TTS 或真人錄音
- 動物冷知識內容為兒童向簡化描述
