$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host 'Starting Maextro S800 viewer at http://127.0.0.1:8765/index.html?SN=5008010020201'
Start-Process 'http://127.0.0.1:8765/index.html?SN=5008010020201'
python -m http.server 8765 --bind 127.0.0.1 --directory $root
