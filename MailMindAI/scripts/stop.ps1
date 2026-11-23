<#
.SYNOPSIS  Stop a running MailMind AI server.
.PARAMETER DataDir  Data folder the server was started with (default .\data).
#>
[CmdletBinding()]
param([string]$DataDir, [int]$Port)  # -Port is accepted for symmetry with start.ps1; the data folder identifies the server
$Root = Split-Path -Parent $PSScriptRoot
$data = if ($DataDir) { (Resolve-Path $DataDir).Path } elseif ($env:MAILMIND_DATA_DIR) { $env:MAILMIND_DATA_DIR } else { Join-Path $Root "data" }
$pidFile = Join-Path $data "mailmind.pid"
if (-not (Test-Path $pidFile)) { Write-Host "MailMind is not running (no PID file in $data)"; exit 0 }
$procId = [int](Get-Content $pidFile)
# The venv python.exe is a launcher, so verify by command line rather than executable path.
$p = Get-CimInstance Win32_Process -Filter "ProcessId = $procId" -ErrorAction SilentlyContinue
if ($p -and $p.CommandLine -match "backend\.run") {
    Stop-Process -Id $procId
    Write-Host "Stopped MailMind (PID $procId)"
} elseif ($p) {
    Write-Warning "PID $procId is not a MailMind server ($($p.CommandLine)); not stopping it"
} else {
    Write-Host "Process $procId already exited"
}
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
