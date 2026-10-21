# 部署上 GitHub + Cloudflare Pages

呢個網站係**純靜態**（HTML / CSS / JS / MP3 / WebP），冇 build step，所以 Cloudflare Pages 可以直接由 GitHub repo 部署。

---

## 一、推上 GitHub

### 1. 喺 GitHub 開一個新 repo

1. 去 https://github.com/new
2. **Repository name**：`lucian-magic-world`（或者自己改）
3. **Private** 或 **Public** 都可以（Private 都用得 Cloudflare Pages，但要喺 Cloudflare 授權 GitHub App）
4. **唔好**勾「Add a README / .gitignore / license」（因為本地已經有）
5. 撳 **Create repository**

### 2. 本地推上去

喺 `C:\Users\louie\OneDrive\Desktop\DSH\Lucian game` 開 PowerShell，跟住改 `你的用戶名`：

```powershell
cd "C:\Users\louie\OneDrive\Desktop\DSH\Lucian game"

# 已經有 git repo（我幫你 init 好），只要加 remote
git remote add origin https://github.com/你的用戶名/lucian-magic-world.git

# 確保 branch 叫 main
git branch -M main

# 推上去（第一次會彈 GitHub 登入／要 Personal Access Token）
git push -u origin main
```

> 如果之前已經加過 remote：`git remote set-url origin https://github.com/你的用戶名/lucian-magic-world.git`

### 3. 之後每次更新

```powershell
cd "C:\Users\louie\OneDrive\Desktop\DSH\Lucian game"
git add -A
git commit -m "更新內容"
git push
```

推完之後 Cloudflare Pages 會**自動重新部署**（大約 1 分鐘）。

---

## 二、Cloudflare Pages 設定

1. 去 https://dash.cloudflare.com/ → 左邊 **Workers & Pages**
2. **Create application** → **Pages** → **Connect to Git**
3. 授權 GitHub，揀返 `lucian-magic-world` 呢個 repo
4. **Set up builds and deployments**：

   | 設定 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | **留空** |
   | Build output directory | `/`（或者留空） |
   | Root directory | 留空 |

5. 撳 **Save and Deploy**

大約 30 秒後會有一個網址：`https://lucian-magic-world.pages.dev`

### 加自訂網域（可選）

Cloudflare Pages → 你嘅 project → **Custom domains** → **Set up a domain**
（如果網域本身已經喺 Cloudflare 托管，一撳就得；否則要改 DNS CNAME 去 `xxx.pages.dev`）

---

## 三、呢個 repo 有咩特別設定

| 檔案 | 作用 |
|---|---|
| `_headers` | Cloudflare Pages 專用：設定 cache（mp3／圖長快取、HTML／sw.js 唔快取）同安全 header |
| `_redirects` | 留空（靜態網站唔需要 redirect） |
| `sw.js` | Service Worker，第二次開就完全離線玩；改版時記得改 `VERSION`（已經升到 v2.0.0） |
| `manifest.webmanifest` | PWA：可以「加到主畫面」 |
| `.nojekyll` | 唔使用 GitHub Pages，但留住都冇壞 |

> 之前嘅 `netlify.toml` 已經刪咗，改用 `_headers`（Netlify 同 Cloudflare 都各自有自己嘅 header 格式）。

---

## 四、常見問題

**Q：Cloudflare Pages 顯示 404 / 白畫面？**
- 檢查 **Build output directory** 係 `/` 或空
- 檢查 repo 根目錄真係有 `index.html`

**Q：更新完但係手機仲係舊版？**
- Service Worker 會 cache，等 10–30 秒再開，或者喺瀏覽器設定清 site data
- 每次大更新我會順手升 `sw.js` 嘅 `VERSION`

**Q：Private repo 用唔用到？**
- 用到，但要喺 GitHub → Settings → Applications → Cloudflare Pages 授權，或者喺 Cloudflare 連接時揀「Install & Authorize」

**Q：大檔案？**
- Repo 大約 19MB（12MB 係 944 段 MP3，5MB 係圖），遠低於 GitHub 限制
- 原始 AI 生成圖（hero 原檔、items-raw）同 screenshots 已經唔入 git

---

## 五、倉庫內容一覽

```
index.html                 ← 全部畫面
assets/css/*.css           ← 樣式
assets/js/*.js             ← 遊戲邏輯（無 build）
assets/audio/*.mp3         ← 944 段語音（粵／普／英）
assets/img/**              ← 動物圖、題目圖、圖示
assets/img/animals/hero-web/*.jpg     ← 35 動物（P4 畫風，seed 1）
assets/img/animals/cutout-webp/*.webp ← 去背剪影（探索影子用）
assets/img/items/<topic>/*.webp|jpg   ← 135 張題目圖
sw.js / manifest.webmanifest          ← PWA
_headers / _redirects                 ← Cloudflare Pages 設定
tools/*.mjs                           ← 生成／測試工具（唔影響網站）
```
