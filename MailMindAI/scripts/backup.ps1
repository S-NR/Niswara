<#
.SYNOPSIS  Back up the local MailMind database (consistent online backup, integrity-checked).
.PARAMETER Dest  Destination folder (default .\backups).  .PARAMETER Keep  Number of backups to keep (default 10).
.NOTES  The Gmail token is not backed up (it is DPAPI-bound); sign in again after restoring.
        Backups contain cached email text - store them as securely as the original data folder.
#>
param([string]$Dest = "", [int]$Keep = 10)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$args2 = @("-m", "backend.backup", "--keep", "$Keep")
if ($Dest) { $args2 += @("--dest", $Dest) }
& (Join-Path $Root ".venv\Scripts\python.exe") @args2
if ($LASTEXITCODE -ne 0) { throw "backup failed" }
