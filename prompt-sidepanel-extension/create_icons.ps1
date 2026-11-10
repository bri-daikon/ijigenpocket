Add-Type -AssemblyName System.Drawing
$destDir = "y:\ijigenpocket\prompt-sidepanel-extension\icons"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

$sizes = @(16, 48, 128)
foreach ($sz in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $sz, $sz
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Background circle with gradient
    $rect = New-Object System.Drawing.Rectangle 0, 0, $sz, $sz
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(56, 189, 248)), ([System.Drawing.Color]::FromArgb(129, 140, 248)), 45.0
    $g.FillEllipse($brush, 1, 1, ($sz - 2), ($sz - 2))

    # Lightning bolt coordinates
    $p1 = New-Object System.Drawing.PointF ($sz * 0.52), ($sz * 0.18)
    $p2 = New-Object System.Drawing.PointF ($sz * 0.32), ($sz * 0.52)
    $p3 = New-Object System.Drawing.PointF ($sz * 0.54), ($sz * 0.52)
    $p4 = New-Object System.Drawing.PointF ($sz * 0.44), ($sz * 0.82)
    $p5 = New-Object System.Drawing.PointF ($sz * 0.70), ($sz * 0.46)
    $p6 = New-Object System.Drawing.PointF ($sz * 0.48), ($sz * 0.46)

    $fillBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddLines(@($p1, $p2, $p3, $p4, $p5, $p6, $p1))
    $g.FillPath($fillBrush, $path)

    $outPath = Join-Path $destDir ("icon" + $sz + ".png")
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $path.Dispose()
    $fillBrush.Dispose()
    $brush.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

Write-Host "Icons generated successfully!"
