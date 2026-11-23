<#
.SYNOPSIS  Ask a running MailMind server to sync now (then run approved Delete-list rules),
           wait for it to finish and print a short report. Used by the mailmind-sync Claude Code skill.
.PARAMETER DataDir  Data folder of the account (omit for the default account in .\data).
.PARAMETER Port     Port of that account's server. Normally not needed: read from <DataDir>\mailmind.port.
.PARAMETER All      Sync every running account (.\data and .\data_* folders), one after another.
.PARAMETER From     Optional start date (yyyy-mm-dd) to sync a date range instead of just new mail.
.PARAMETER To       Optional end date (yyyy-mm-dd, inclusive); defaults to today when -From is given.
.PARAMETER NoWait   Start the sync and return immediately.
.EXAMPLE   scripts\sync.ps1
.EXAMPLE   scripts\sync.ps1 -DataDir data_work
.EXAMPLE   scripts\sync.ps1 -All
.EXAMPLE   scripts\sync.ps1 -From 2026-01-01 -To 2026-06-30
#>
[CmdletBinding()]
param([string]$DataDir, [int]$Port, [switch]$All, [string]$From, [string]$To, [switch]$NoWait)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$headers = @{ "X-MailMind-Request" = "1" }

function Get-AccountPort([string]$dir) {
    $f = Join-Path $dir "mailmind.port"
    if (Test-Path $f) { return [int](Get-Content $f) }
    if ((Split-Path -Leaf $dir) -eq "data") { return 8765 }
    return $null
}

function Invoke-AccountSync([string]$dir, [int]$port) {
    $label = Split-Path -Leaf $dir
    $base = "http://127.0.0.1:$port/api"
    try { $null = Invoke-RestMethod "$base/health" -TimeoutSec 3 }
    catch {
        $hint = if ($label -ne "data") { " -DataDir $label -Port $port" } else { "" }
        Write-Host "[$label] MailMind is not running on port $port. Start it with: scripts\start.ps1$hint -NoBrowser" -ForegroundColor Red
        return $false
    }
    $body = @{ mode = "auto" }
    if ($From) {
        $end = if ($To) { $To } else { (Get-Date).ToString("yyyy-MM-dd") }
        $body = @{ mode = "range"; date_from = $From; date_to = $end }
    }
    $before = (Invoke-RestMethod "$base/delete-list").runs | Select-Object -First 1
    try {
        $null = Invoke-RestMethod "$base/sync" -Method Post -Headers $headers -ContentType "application/json" `
            -Body ($body | ConvertTo-Json)
    }
    catch {
        Write-Host "[$label] Sync could not start: $($_.ErrorDetails.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host "[$label] Sync started (mode: $($body.mode))."
    if ($NoWait) { return $true }

    do {
        Start-Sleep -Seconds 3
        $st = Invoke-RestMethod "$base/sync/status"
        $p = $st.progress
        Write-Progress -Activity "MailMind sync ($label)" -Status "$($p.phase): $($p.fetched) fetched / ~$($p.estimated_total)"
    } while ($p.running)
    Write-Progress -Activity "MailMind sync ($label)" -Completed

    $run = $st.history | Select-Object -First 1
    Write-Host "[$label] Account: $($st.state.account)"
    Write-Host "[$label] Sync: $($run.status) - $($run.inserted) new, $($run.updated) updated, $($run.skipped) already cached, $($run.errors) errors"
    if ($run.error) { Write-Host "[$label] Error: $($run.error)" -ForegroundColor Red }

    $dl = Invoke-RestMethod "$base/delete-list"
    $last = $dl.runs | Select-Object -First 1
    if (-not $dl.trash_enabled) {
        Write-Host "[$label] Cleanup: cleanup mode is not enabled for this account, so the Delete list does not run"
    } elseif ($dl.paused) {
        Write-Host "[$label] Cleanup: the Delete list is paused"
    } elseif ($last -and (-not $before -or $last.id -ne $before.id)) {
        Write-Host "[$label] Cleanup: Delete list run #$($last.id) $($last.status) - $($last.trashed) moved to Trash, $($last.failed) failed"
    } else {
        Write-Host "[$label] Cleanup: nothing to move to Trash"
    }
    foreach ($r in @($dl.rules | Where-Object { -not $_.approved -and $_.pending_count -gt 0 })) {
        Write-Host "[$label] Needs approval in the dashboard: $($r.pattern) ($($r.pending_count) emails older than $($r.older_than_days) days)" -ForegroundColor Yellow
    }
    return ($run.status -eq "completed")
}

$targets = @()
if ($All) {
    $dirs = @(Get-ChildItem $Root -Directory | Where-Object { $_.Name -eq "data" -or ($_.Name -like "data_*" -and $_.Name -ne "data_demo") })
    foreach ($d in $dirs) {
        $p = Get-AccountPort $d.FullName
        if (-not (Test-Path (Join-Path $d.FullName "gmail_token.bin"))) { continue }
        if ($p) { $targets += , @($d.FullName, $p) }
        else { Write-Host "[$($d.Name)] skipped: port unknown (start it once with scripts\start.ps1 -DataDir $($d.Name) -Port <port>)" }
    }
} else {
    $dir = if ($DataDir) { (Resolve-Path $DataDir).Path } else { Join-Path $Root "data" }
    $p = if ($Port) { $Port } else { Get-AccountPort $dir }
    if (-not $p) { Write-Error "Port for $DataDir is unknown; pass -Port"; exit 1 }
    $targets += , @($dir, $p)
}
if (-not $targets) { Write-Host "No signed-in accounts found."; exit 1 }

$ok = $true
foreach ($t in $targets) {
    if (-not (Invoke-AccountSync $t[0] $t[1])) { $ok = $false }
}
if (-not $ok) { exit 2 }
