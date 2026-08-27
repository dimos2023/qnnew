$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host 'Starting Yangwang U8 viewer at http://127.0.0.1:8766/'
Start-Process 'http://127.0.0.1:8766/'
python -m http.server 8766 --bind 127.0.0.1 --directory $root
