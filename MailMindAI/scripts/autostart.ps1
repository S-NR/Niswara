<#
.SYNOPSIS  Start MailMind automatically when you log in to Windows (one entry per account),
           or remove that again. Uses a shortcut in your Startup folder - no admin rights needed.
           Combine with Settings -> Automatic sync so syncing and Delete-list cleanup run unattended.
.PARAMETER DataDir  Account data folder (omit for the default account).
.PARAMETER Port     Port for that account (default 8765).
.PARAMETER Remove   Remove the startup entry instead of adding it.
.PARAMETER List     Show the MailMind startup entries.
.EXAMPLE   scripts\autostart.ps1
.EXAMPLE   scripts\autostart.ps1 -DataDir data_work -Port 8767
.EXAMPLE   scripts\autostart.ps1 -DataDir data_work -Remove
#>
[CmdletBinding()]
param([string]$DataDir, [int]$Port = 8765, [switch]$Remove, [switch]$List)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$startup = [Environment]::GetFolderPath("Startup")
$name = if ($DataDir) { "MailMind AI ($((Split-Path -Leaf $DataDir)))" } else { "MailMind AI" }
$lnk = Join-Path $startup "$name.lnk"

if ($List) {
    Get-ChildItem $startup -Filter "MailMind AI*.lnk" | ForEach-Object {
        $sc = (New-Object -ComObject WScript.Shell).CreateShortcut($_.FullName)
        "{0}`n    {1}" -f $_.BaseName, $sc.Arguments
    }
    exit 0
}
if ($Remove) {
    if (Test-Path $lnk) { Remove-Item $lnk -Force; Write-Host "Removed startup entry '$name'." }
    else { Write-Host "No startup entry '$name'." }
    exit 0
}

$argLine = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Root\scripts\start.ps1`" -NoBrowser -Port $Port"
if ($DataDir) {
    $full = (Resolve-Path $DataDir).Path
    $argLine += " -DataDir `"$full`""
}
$sc = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$sc.TargetPath = (Get-Command powershell.exe).Source
$sc.Arguments = $argLine
$sc.WorkingDirectory = $Root
$sc.WindowStyle = 7  # minimized
$sc.Description = "Start MailMind AI on 127.0.0.1:$Port"
try {
    $sc.Save()
} catch {
    Write-Host "Windows refused to add '$name' to your Startup folder." -ForegroundColor Yellow
    Write-Host "This is usually security software (e.g. 360 Total Security or company endpoint protection) guarding"
    Write-Host "the Startup folder. MailMind does not try to get around that. Options:"
    Write-Host "  1. Allow it in your security software (or ask IT), then run this script again."
    Write-Host "  2. Create a Task Scheduler task yourself: trigger 'At log on', action 'Start a program':"
    Write-Host "       Program:   powershell.exe"
    Write-Host "       Arguments: $argLine"
    Write-Host "       Start in:  $Root"
    Write-Host "  3. Skip auto-start: run scripts\start.ps1 after logging in; Automatic sync works while it runs."
    exit 1
}
Write-Host "MailMind ($name) will start at Windows login on http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "Turn on Settings -> Automatic sync in that dashboard so it also syncs and cleans up on its own."
Write-Host "Undo with: scripts\autostart.ps1$(if ($DataDir) { " -DataDir $DataDir" }) -Remove"
