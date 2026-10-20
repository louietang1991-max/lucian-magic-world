/* tools/remove-bg.ps1 — 把「乾淨淺藍背景」嘅動物圖去背（由邊緣 flood fill，唔會食到動物內部）
 *  用法: pwsh -File tools/remove-bg.ps1
 */
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$inDir = Join-Path $root 'assets\img\animals\cutout'
$outDir = Join-Path $root 'assets\img\animals\cutout-web'
New-Item -ItemType Directory -Force $outDir | Out-Null

Add-Type -AssemblyName System.Drawing
$cs = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class BgRemover
{
    // 由四邊 flood fill，把接近背景色嘅像素變透明
    public static int Process(string input, string output, int tol, int edgeSoft)
    {
        using (var bmp = new Bitmap(input))
        {
            int w = bmp.Width, h = bmp.Height;
            var rect = new Rectangle(0, 0, w, h);
            var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            byte[] buf = new byte[stride * h];
            Marshal.Copy(data.Scan0, buf, 0, buf.Length);

            // 背景色 = 四角平均
            int[] xs = { 2, w - 3, 2, w - 3 };
            int[] ys = { 2, 2, h - 3, h - 3 };
            long br = 0, bg = 0, bb = 0;
            for (int i = 0; i < 4; i++)
            {
                int idx = ys[i] * stride + xs[i] * 4;
                bb += buf[idx]; bg += buf[idx + 1]; br += buf[idx + 2];
            }
            double R = br / 4.0, G = bg / 4.0, B = bb / 4.0;

            bool[] removed = new bool[w * h];
            var q = new Queue<int>();
            Func<int, int, bool> isBg = (x, y) =>
            {
                int idx = y * stride + x * 4;
                double dr = buf[idx + 2] - R, dg = buf[idx + 1] - G, db = buf[idx] - B;
                return Math.Sqrt(dr * dr + dg * dg + db * db) <= tol;
            };
            for (int x = 0; x < w; x++) { if (isBg(x, 0)) { q.Enqueue(x); removed[x] = true; } if (isBg(x, h - 1)) { q.Enqueue((h - 1) * w + x); removed[(h - 1) * w + x] = true; } }
            for (int y = 0; y < h; y++) { if (isBg(0, y)) { q.Enqueue(y * w); removed[y * w] = true; } if (isBg(w - 1, y)) { q.Enqueue(y * w + w - 1); removed[y * w + w - 1] = true; } }

            int removedCount = 0;
            while (q.Count > 0)
            {
                int p = q.Dequeue();
                int px = p % w, py = p / w;
                removedCount++;
                int[] dx = { 1, -1, 0, 0 };
                int[] dy = { 0, 0, 1, -1 };
                for (int d = 0; d < 4; d++)
                {
                    int nx = px + dx[d], ny = py + dy[d];
                    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                    int np = ny * w + nx;
                    if (removed[np]) continue;
                    if (!isBg(nx, ny)) continue;
                    removed[np] = true;
                    q.Enqueue(np);
                }
            }

            // 寫入 alpha（邊緣做少少羽化）
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int p = y * w + x;
                    int idx = y * stride + x * 4;
                    if (removed[p]) { buf[idx + 3] = 0; }
                    else if (edgeSoft > 0)
                    {
                        // 鄰近有無被移除嘅像素 → 半透明羽化
                        bool near = false;
                        for (int oy = -1; oy <= 1 && !near; oy++)
                            for (int ox = -1; ox <= 1; ox++)
                            {
                                int nx = x + ox, ny = y + oy;
                                if (nx < 0 || ny < 0 || nx >= w || ny >= h) { continue; }
                                if (removed[ny * w + nx]) { near = true; break; }
                            }
                        if (near) buf[idx + 3] = 200;
                    }
                }
            }
            Marshal.Copy(buf, 0, data.Scan0, buf.Length);
            bmp.UnlockBits(data);
            bmp.Save(output, ImageFormat.Png);
            return removedCount;
        }
    }
}
'@
Add-Type -TypeDefinition $cs -ReferencedAssemblies System.Drawing

$files = Get-ChildItem $inDir -Filter *.png
$n = 0
foreach ($f in $files) {
    $dest = Join-Path $outDir $f.Name
    $removed = [BgRemover]::Process($f.FullName, $dest, 42, 1)
    $n++
    if ($n % 5 -eq 0) { Write-Host "  $n/$($files.Count) … $($f.BaseName)" }
}
Write-Host "done: $n files -> $outDir"
