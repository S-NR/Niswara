<#
.SYNOPSIS  Sign in to Gmail (opens your browser). Read-only by default.
           -EnableCleanup also grants "move to Trash" so approved delete-list rules can run.
           -Logout deletes the local token.
           -DataDir signs in a separate account stored in its own data folder (e.g. data_work).
#>
[CmdletBinding()]
param([switch]$Logout, [switch]$EnableCleanup, [string]$DataDir)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
if ($DataDir) {
    New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
    $env:MAILMIND_DATA_DIR = (Resolve-Path $DataDir).Path
    Write-Host "Using data folder $env:MAILMIND_DATA_DIR"
}
$a = @("-m", "backend.gmail.login")
if ($Logout) { $a += "--logout" }
if ($EnableCleanup) { $a += "--enable-cleanup" }
& (Join-Path $Root ".venv\Scripts\python.exe") @a
