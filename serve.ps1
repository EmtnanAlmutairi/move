$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173

Set-Location $projectRoot

Write-Host "Serving $projectRoot on http://127.0.0.1:$port/"
python -m http.server $port --bind 127.0.0.1 --directory $projectRoot
