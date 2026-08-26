# Maextro S800 local 3D viewer

This folder contains the captured web viewer and its Maextro S800 assets.

## Run

Right-click `start-local.ps1` and choose **Run with PowerShell**, or run:

```powershell
./start-local.ps1
```

Then open:

`http://127.0.0.1:8765/index.html?SN=5008010020201`

Do not open `index.html` directly with `file://`; WebGL assets require an HTTP server.

## Contents

- `index.html` and the original viewer runtime.
- `files/assets/` containing GLB models, textures, UI assets, audio, shaders, and configuration files.
- `download-report.json` with the initial capture report.
- `referenced-assets-failures.json` with attempts made while resolving transitive references.

## Known upstream issue

Three `.basis` texture URLs currently return HTTP 404 from the original host. The local viewer still renders the vehicle, but those optional textures may affect specific scenes or effects.
