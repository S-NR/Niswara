<# .SYNOPSIS  Run the automated test suite (synthetic data only) and the dashboard type-check. #>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
& (Join-Path $Root ".venv\Scripts\python.exe") -m pytest
$py = $LASTEXITCODE
Push-Location frontend; npm run typecheck; $ts = $LASTEXITCODE; Pop-Location
if ($py -ne 0 -or $ts -ne 0) { exit 1 }
