# push-github.ps1 — 一鍵推上 GitHub（第一次用）
# 用法：
#   1. 喺 GitHub 開一個新 repo（唔好加 README / .gitignore），記住個名
#   2. 喺呢個資料夾開 PowerShell，執行：
#        .\push-github.ps1 -User 你的GitHub用戶名 -Repo lucian-magic-world
#
param(
  [string]$User = "louietang1991-max",
  [string]$Repo = "lucian-magic-world"
)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$url = "https://github.com/$User/$Repo.git"
Write-Host "→ remote: $url"

$existing = git remote
if ($existing -contains "origin") {
  git remote set-url origin $url
} else {
  git remote add origin $url
}

git branch -M main
Write-Host "→ 開始 push（第一次會要你登入 GitHub / 或用 Personal Access Token）"
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "✅ 推完！跟住去 Cloudflare Pages 連接呢個 repo："
  Write-Host "   https://dash.cloudflare.com/?to=/:account/workers-and-pages"
  Write-Host "   Create → Pages → Connect to Git → 揀 $Repo"
  Write-Host "   Build command 留空、Build output directory 填 / → Save and Deploy"
} else {
  Write-Host ""
  Write-Host "❌ Push 失敗。常見原因："
  Write-Host "   1. repo 未喺 GitHub 開（去 https://github.com/new）"
  Write-Host "   2. 用戶名／repo 名唔對（改 -User / -Repo 再試）"
  Write-Host "   3. 未登入：用 Personal Access Token 做密碼（Settings → Developer settings → Tokens）"
}
