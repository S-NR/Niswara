<#
.SYNOPSIS
  One-time setup for MailMind AI: Python venv, dependencies, dashboard build,
  database migrations and the Claude Code MCP configuration.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
#>
param([switch]$SkipFrontend)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Find-Python {
    foreach ($v in @("3.12", "3.13", "3.11")) {
        try { $p = & py "-$v" -c "import sys; print(sys.executable)" 2>$null; if ($LASTEXITCODE -eq 0 -and $p) { return $p.Trim() } } catch {}
    }
    $p = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ($p) {
        $ver = & $p -c "import sys; print('%d.%d' % sys.version_info[:2])"
        if ([version]$ver -ge [version]"3.11") { return $p }
    }
    throw "Python 3.11+ (3.12 recommended) not found. Install it: winget install Python.Python.3.12"
}

Write-Host "== MailMind AI setup ==" -ForegroundColor Cyan
$py = Find-Python
Write-Host "Python: $py ($(& $py --version))"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    & $py -m venv .venv
}
$vpy = Join-Path $Root ".venv\Scripts\python.exe"
& $vpy -m pip install --quiet --upgrade pip
& $vpy -m pip install --quiet -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw "pip install failed" }

New-Item -ItemType Directory -Force -Path data, config, logs, backups | Out-Null

if (-not $SkipFrontend) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "Node.js LTS (npm) not found: winget install OpenJS.NodeJS.LTS" }
    Push-Location frontend
    if (Test-Path package-lock.json) { npm ci --no-audit --no-fund } else { npm install --no-audit --no-fund }
    npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw "frontend build failed" }
    Pop-Location
}

# Database schema
& $vpy -c "from backend.db.session import run_migrations; run_migrations(); print('Database migrated')"

# Claude Code MCP config with absolute paths for this machine
$mcp = @{ mcpServers = @{ mailmind = @{ type = "stdio"; command = ($vpy -replace '\\', '/'); args = @((Join-Path $Root "backend\mcp_server\__main__.py") -replace '\\', '/'); env = @{} } } }
$json = $mcp | ConvertTo-Json -Depth 6
# Write UTF-8 *without* BOM: Windows PowerShell 5's "-Encoding utf8" adds a BOM that breaks JSON parsers
[System.IO.File]::WriteAllText((Join-Path $Root ".mcp.json"), $json, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Wrote .mcp.json (MailMind MCP server for Claude Code)"

# Restrict the data folder to the current user (tokens + cached mail live here)
try {
    icacls data /inheritance:r /grant:r "$($env:USERNAME):(OI)(CI)F" | Out-Null
    Write-Host "Restricted data\ to $($env:USERNAME)"
} catch { Write-Warning "Could not restrict ACLs on data\: $_" }

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Put your Google OAuth client file at config\client_secret.json (docs\INSTALL.md)"
Write-Host "  2. scripts\login.ps1     - sign in to Gmail (read-only)"
Write-Host "  3. scripts\start.ps1     - start MailMind and open http://127.0.0.1:8765"
Write-Host "  Optional: scripts\load_sample_data.ps1 to try it with synthetic data first"
