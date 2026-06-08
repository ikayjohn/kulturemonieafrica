Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot "..\assets\images"
$targetDir = Join-Path $sourceDir "optimized"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$cwebpCommand = Get-Command cwebp -ErrorAction SilentlyContinue
if ($cwebpCommand) {
  $cwebp = $cwebpCommand.Source
}
else {
  $cwebp = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter cwebp.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $cwebp) {
  throw "cwebp.exe was not found. Install Google.Libwebp and retry."
}
$maxWidth = 1600
$quality = 76
$files = Get-ChildItem $sourceDir -File |
  Where-Object { $_.Extension -match "^\.(png|jpg|jpeg)$" }

foreach ($file in $files) {
  $image = [System.Drawing.Image]::FromFile($file.FullName)
  try {
    $target = Join-Path $targetDir "$($file.BaseName).webp"
    $args = @("-quiet", "-q", $quality, "-m", "6")
    if ($image.Width -gt $maxWidth) {
      $args += @("-resize", $maxWidth, "0")
    }
    $args += @($file.FullName, "-o", $target)
    & $cwebp @args
  }
  finally {
    $image.Dispose()
  }
}
