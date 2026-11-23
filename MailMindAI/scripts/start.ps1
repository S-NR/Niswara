<#
.SYNOPSIS  Start MailMind AI (API + dashboard) on 127.0.0.1 in the background.
.PARAMETER DataDir  Use a different data folder (e.g. the synthetic demo in .\data_demo).
.PARAMETER Port     Port to listen on (default 8765).
.PARAMETER NoBrowser  Do not open the dashboard.
#>
[CmdletBinding()]
param([string]$DataDir, [int]$Port = 8765, [switch]$NoBrowser, [switch]$EnableCleanup)
$ErrorActionPreference = "Stop"
if ($EnableCleanup) {
    $d = if ($DataDir) { " -DataDir $DataDir" } else { "" }
    Write-Error "-EnableCleanup belongs to the sign-in script. Run: scripts\login.ps1$d -EnableCleanup  (then start MailMind normally)"
    exit 1
}
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$vpy = Join-Path $Root ".venv\Scripts\python.exe"
if (-not (Test-Path $vpy)) { throw "Run scripts\setup.ps1 first" }
if (-not (Test-Path "frontend\dist\index.html")) { Write-Warning "Dashboard not built; run scripts\setup.ps1 (API will still start)" }

if ($DataDir) {
    New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
    $env:MAILMIND_DATA_DIR = (Resolve-Path $DataDir).Path
}
$env:MAILMIND_PORT = "$Port"
$data = if ($env:MAILMIND_DATA_DIR) { $env:MAILMIND_DATA_DIR } else { Join-Path $Root "data" }
New-Item -ItemType Directory -Force -Path $data, logs | Out-Null
$pidFile = Join-Path $data "mailmind.pid"
# one pair of log files per data folder, so several accounts can run side by side
$logName = if ($DataDir) { "server-" + (Split-Path -Leaf $data) } else { "server" }
$outLog = "logs\$logName.out.log"
$errLog = "logs\$logName.err.log"

if (Test-Path $pidFile) {
    $old = Get-Content $pidFile
    if (Get-Process -Id $old -ErrorAction SilentlyContinue) { Write-Host "MailMind is already running (PID $old) at http://127.0.0.1:$Port"; exit 0 }
    Remove-Item $pidFile -Force
}

$inUse = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($inUse) { throw "Port $Port is already in use (PID $($inUse[0].OwningProcess)). Stop that process or use -Port." }

$proc = Start-Process -FilePath $vpy -ArgumentList "-m", "backend.run" -WorkingDirectory $Root -WindowStyle Hidden `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
$url = "http://127.0.0.1:$Port"
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 500
    if ($proc.HasExited) { break }
    try { if ((Invoke-RestMethod "$url/api/health" -TimeoutSec 2).status -eq "ok") { $ok = $true; break } } catch {}
}
if (-not $ok) {
    Write-Error "MailMind failed to start. See $errLog"
    exit 1
}
Write-Host "MailMind running at $url (PID $($proc.Id)). Data: $data" -ForegroundColor Green
if (-not $NoBrowser) { Start-Process $url }
