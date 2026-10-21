# Lucian 的魔法世界 · Magic World

為 3 歲小朋友而設嘅**中／英／普學習 + 搵動物餵食遊戲**，純 HTML5，手機直向操作，支援離線玩（PWA）。

> 所有圖案都係手繪 SVG，所有語音都係預先合成嘅 MP3 音檔（499 段，用 Microsoft Edge Neural 語音），唔需要上網都可以玩。

---

> **部署**：GitHub → Cloudflare Pages，詳細步驟睇 [DEPLOY-GitHub-Cloudflare.md](DEPLOY-GitHub-Cloudflare.md)

## 一、點樣放上網（最快 3 分鐘）

整個資料夾就係一個靜態網站，冇 build step、冇 server-side code。以下任揀一個：

### 方法 A：GitHub + Cloudflare Pages（推薦，詳細步驟見 `DEPLOY-GitHub-Cloudflare.md`）

1. 喺 GitHub 開一個新 repo（唔好加 README / .gitignore）
2. 本地：
   ```powershell
   cd "C:\Users\louie\OneDrive\Desktop\DSH\Lucian game"
   git remote add origin https://github.com/你的用戶名/lucian-magic-world.git
   git branch -M main
   git push -u origin main
   ```
3. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → 揀呢個 repo
4. **Build command 留空**、**Build output directory**: `/` → Save and Deploy
5. 完成後網址：`https://<project>.pages.dev`（可以再加自訂網域）

> 之後每次 `git push`，Cloudflare 會自動重新部署。
> Repo 已經設定好 `_headers`（cache）同 `_redirects`，唔使再設定其他嘢。

### 方法 B：Netlify Drop（最簡單，唔使 git）
1. 去 <https://app.netlify.com/drop>
2. 將**整個資料夾**（或者打包好嘅 `lucian-magic-world.zip`）拖入去
3. 即刻有條 `https://xxxx.netlify.app` 嘅網址，用手機開就得
4. （可選）註冊帳戶就可以改個好記嘅名，例如 `lucian-magic.netlify.app`

### 方法 B：GitHub Pages
```bash
git init
git add .
git commit -m "Lucian magic world"
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

## 題目庫（第一部分）

共 **17 個主題 / 203 個項目**（設定 → 題目庫可以逐個開關）：

| 主題 | 項目 |
|---|---|
| 動物 | 牛 羊 魚 馬 兔 貓 狗 鳥 大象 青蛙 |
| 水果 | 蘋果 香蕉 橙 梨子 西瓜 葡萄 草莓 牛油果 |
| 蔬菜 | 紅蘿蔔 番茄 粟米 青瓜 蘑菇 西蘭花 薯仔 洋蔥 |
| 交通工具 | 火車 巴士 單車 電車 飛機 渡輪 直昇機 的士 |
| 顏色 | 紅 黃 藍 綠 橙 紫 黑 白 |
| 形狀 | 圓形 正方形 三角形 星形 心形 橢圓形 長方形 |
| 數字 | 一 二 三 四 五 六 七 八 九 十 |
| 身體 | 口 耳 手 眼 牙 鼻 腳 足 |
| 自然 | 日 月 天 星 雲 石 雨 火 水 木 花 草 樹 土 田 春 夏 秋 冬 |
| 形容詞 | 大 小 多 少 快 慢 高 矮 熱 冷 |
| 位置 | 上 下 左 右 外面 裡面 |
| 人物 | 爸 媽 哥 弟 妹 姊 男 女 人 小朋友 |
| 食物 | 米 豆 果 奶 肉 蛋 菜 瓜 蛋糕 |
| 動詞 | 走 坐 跑 跳 游 行 玩 拿 拍 打 吃 叫 喝 唱 做 說 愛 喜歡 看見 聽 |
| 物品 | 紙 筆 書 尺 信 球 玩具 布 門 窗 桌子 椅子 燈 電視機 牀 電腦 杯 匙羹 鐘 |
| 量詞 | 本 朵 位 顆 個 隻 輛 片（只喺「聽粵語，揀字詞」出現） |
| 動物圖鑑 | 35 隻第二部分動物 |

### 四個學習小遊戲

| 遊戲 | 玩法 | 用邊啲題目 |
|---|---|---|
| A 聽聲音，揀圖案 | 聽粵語／普通話／英文，揀正確圖片 | 有圖嘅題目 |
| B 睇圖案，揀字詞 | 睇圖，揀中文字（繁／簡）或英文字 | 有圖嘅題目 |
| C 睇字詞，揀圖案 | 睇字，揀圖 | 有圖嘅題目 |
| **D 聽粵語，揀字詞** | 聽把聲，揀正確中文字（有拼音） | **全部題目**（包括量詞、動詞、形容詞） |

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

### 第二部分：尋找動物（8 個地點 × 35 隻動物）

| 地點 | 玩法 |
|---|---|
| **沙灘 · 沙漠 · 雪地** | 🏖️ **刮刮卡**：用手指撥開沙／雪，逐隻影子撥出嚟（唔會一隻就開哂） |
| **海面 · 河流** | 🌊 **浮上水面**：影子沉喺水底（模糊、半透明），定時浮上水面，浮起先撳到 |
| **海底 · 森林 · 草原** | 🌿 **匿埋探頭**：影子收埋喺水草／草／樹叢後面，不時探頭出嚟，探頭先撳到 |

- 每個地點**隨機出 3–5 隻**動物嘅影子，影子外框顏色 = 稀有度：綠 普通 · 藍 少見 · 紫 稀有 · **金 傳說**
- 未探頭時撳 → 影子會搖一搖 + 語音提示「等佢出嚟先撳啦！」
- 撳到影子 → **餵食畫面**：
  - **掟 3 個魔法生果入圈圈**（撳圈或由生果籃向上拉瞄準），越中間越高分（最多 60 分）
  - **餵食**：掟完 3 個魔法生果 → 動物即刻食（播咬嘢聲、心心飄起）→ 揭曉獎勵卡
    - （拍子小遊戲已經移除）
    - 分數＝掟生果準確度換算成 100 分制；越準越多星、解鎖越多冷知識
  - 無論成功失敗，動物都會**現身**、食得好開心，代表餵食成功
- 分數 → 星星 → 解鎖**動物冷知識**（最多 4 條）＋圖鑑星級
- 儲齊 **35 隻動物** 圖鑑；餵過嘅動物會用彩色留喺場景度

---

## 三、家長設定（有計數鎖）

主頁右上角 **長按齒輪 1 秒** → 答啱一條加法 → 入到設定：

- **題目庫**：勾選想練嘅主題（最少一個）
- **發音語言**：粵語 / 普通話 / English（影響遊戲 A 同所有動物名讀音）
- **文字語言**：中文（附拼音）/ English（影響遊戲 B、C 顯示嘅字）
- **語速**：0.6x – 1.2x
- **（節奏速度已停用）**：拍子小遊戲已移除，呢個設定保留但唔會影響遊戲
- **音效開關**
- **答啱自動去下一題**
- **輕鬆模式**（答錯可以再試）
- **清除所有進度**

進度（魔法生果、圖鑑、統計）會自動存在手機瀏覽器（localStorage），換手機或清除網站資料就會冇。

---

## 四、題目庫／圖鑑對照表（俾家長核對）

- `題目庫對照表.pdf` — 可以直接睇／print，每個字詞同動物都有 **ID**（例如 `fruit-0`、`animal-fennec`、`p-good`）
- `題目庫對照表.html` — 互動版（用瀏覽器開）
- 覺得邊張圖／邊個字／邊句粵語有問題，同我講個 ID 就得

---

## 五、本機測試 / 修改

```bash
npm start          # 開 http://127.0.0.1:8123
```

| 指令 | 做乜 |
|---|---|
| `npm start` | 起一個本機靜態 server（必須用 http:// 開，唔好直接 double click HTML） |
| `npm run audio` | 重新產生所有語音（Edge Neural；需要網絡；寫入 `assets/audio/`） |
| `npm run audio:google` | 後備：用 Google Translate TTS 產生（較機械聲） |
| `npm run audio:manifest` | 更新 `assets/js/audio-manifest.js`（fetch 失敗時嘅後備清單） |
| `npm run icons` | 由 `assets/img/logo.svg` 重新產生 PWA 圖示 |
| `npm run review` | 重新產生題目庫對照表 PDF |
| `畫風選擇.html` | AI 畫風樣本（用 ComfyUI 生成，等家長揀） |
| `npm run pack` | 打包 `lucian-magic-world.zip`（上傳用） |
| `npm test` | 用 Chrome 行一次完整流程測試 |

### 專案結構
```
index.html                 入口（所有畫面嘅 HTML）
題目庫對照表.html / .pdf    題目庫＋圖鑑對照（家長核對用，唔需要上傳）
manifest.webmanifest       PWA 設定
sw.js                      Service Worker（離線快取）
_headers                   Cloudflare Pages 用嘅 cache／安全 header 設定
assets/css/                theme.css / layout.css / games.css / feed.css
assets/js/
  data-animals.js          35 隻動物（名、稀有度、冷知識、family）
  data-vocab.js            9 個題目庫
  artwork.js               全部 SVG 手繪圖案（動物 + 物品）
  audio.js                 音檔播放 + Web Audio 音效合成
  audio-manifest.js        語音清單（fetch manifest.json 失敗時嘅後備）
  rhythm.js                節拍器（已停用，留俾日後）
  core.js                  狀態 / 畫面切換 / 返回導航 / 小工具
  screen-*.js              每個畫面
assets/audio/              499 段預先合成語音 + manifest.json
assets/img/                Logo 同 App 圖示
screenshots/               遊戲截圖（唔需要上傳）
tools/                     產生語音、圖示、對照表、打包、測試用嘅 script
lucian-magic-world.zip     👈 直接上傳用嘅打包檔
```

### 想加動物？
1. 喺 `assets/js/data-animals.js` 加一筆（`id / loc / rarity / zh / en / facts`）
2. 喺 `assets/js/artwork.js` 嘅 `ANIMALS` 加一個畫法函式（用 `ellipse / path / face / earsTri` 等 helper，畫布 200×200）
3. 跑 `npm run audio` 產生新嘅讀音同冷知識音檔，再 `npm run audio:manifest`

---

## 六、技術備註

- **語音**：Microsoft Edge（Azure Neural）合成，粵語 `zh-HK-HiuMaanNeural`、普通話 `zh-CN-XiaoxiaoNeural`、英語 `en-US-JennyNeural`，語速 −8~10%、音調 +2Hz（小朋友聽得清楚啲）。**預先合成成 MP3**，所以所有手機發音一致
- **音效**：Web Audio API 即時合成（拍子聲、過關音樂、咬嘢聲），冇額外檔案
- **音效**：Web Audio 即時合成；語音用 Microsoft Edge Neural TTS（944 段）
- **返回導航**：每個畫面有固定「上一層」，唔會跳去奇怪畫面；結算頁有 ◀ 返主頁、再玩一次、揀第二個遊戲、去搵動物
- **離線**：Service Worker 會 cache 核心檔案；語音係「用過先 cache」
- **唔會收集任何個人資料**，冇分析、冇廣告、冇第三方追蹤
- **動物「相片」**：為咗統一畫風同保持檔案細，圖鑑用可愛卡通插畫。想換真實相片可以將 `Art.animal()` 改成回傳 `<img>`，再放相到 `assets/img/animals/`

## 七、畫風（進行中）

目前遊戲圖案係手繪 SVG。已用本機 ComfyUI（Z-Image Turbo / FLUX.2 Klein）生成 **5 個畫風樣本**，放喺 `畫風選擇.html` 同 `風格樣本/`，
等家長揀邊個風格再全套換（35 動物 + 102 字詞 + 8 地點背景）。

## 八、iOS / Android 注意

- iOS 第一次要有用戶點擊（按「開始遊戲」）之後先會有聲，屬正常
- 如果 iPhone 側邊嘅靜音開關開咗，網頁聲音可能會冇聲
- Android Chrome 第一次可能要等 1–2 秒載入語音

## 九、授權 / 注意

- 圖案（SVG）為本專案原創，可自由用於私人用途
- 語音由 Microsoft Edge 語音服務合成，僅供私人／家庭使用；如要公開發佈或商業使用，請自行替換為 Azure 正式 API／其他 TTS 或真人錄音
- 動物冷知識內容為兒童向簡化描述
