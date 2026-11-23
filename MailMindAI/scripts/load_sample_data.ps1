<#
.SYNOPSIS  Load the SYNTHETIC sample dataset into .\data_demo (never touches your real data folder),
           then start MailMind against it on port 8766.
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$demo = Join-Path $Root "data_demo"
$env:MAILMIND_DATA_DIR = $demo
& (Join-Path $Root ".venv\Scripts\python.exe") -m backend.sample_data --data-dir $demo
if ($LASTEXITCODE -ne 0) { throw "loading sample data failed" }
& (Join-Path $PSScriptRoot "start.ps1") -DataDir $demo -Port 8766
Write-Host "Stop the demo with: scripts\stop.ps1 -DataDir data_demo"
