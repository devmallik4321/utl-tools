# ==============================================================================
# UTL.tools — Scheduled Project Intelligence Daily Runner
# ==============================================================================
# Executed by Windows Task Scheduler daily at 08:00 UAE time.
# Bounded collection and synchronization into UTL-CONTROL-CENTER.xlsx.
# ==============================================================================

$ErrorActionPreference = "Continue"

$repoRoot = "C:\Users\mallik\Documents\AAEP\03-Projects\UTILITY-OS"
$nodeExe = "C:\Program Files\nodejs\node.exe"
$scriptPath = Join-Path $repoRoot "scripts\run_project_intelligence.mjs"
$logDir = Join-Path $repoRoot "logs\project-intelligence"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$today = (Get-Date).ToString("yyyy-MM-dd")
$logFile = Join-Path $logDir "project-intelligence-$today.log"
$lockFile = Join-Path $logDir "runner.lock"

function Log-Line([string]$msg) {
    $line = "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

Log-Line "=================================================================="
Log-Line "STARTING SCHEDULED DAILY PROJECT INTELLIGENCE COLLECTION"
Log-Line "=================================================================="
Log-Line "Repository Root: $repoRoot"
Log-Line "Node Executable: $nodeExe"
Log-Line "Target Script: $scriptPath"

# 1. Overlapping Run Protection
if (Test-Path $lockFile) {
    $lockTime = (Get-Item $lockFile).LastWriteTime
    if ((Get-Date) - $lockTime -lt (New-TimeSpan -Minutes 30)) {
        Log-Line "WARNING: Overlapping run detected. Lock file exists from $lockTime. Aborting."
        exit 0
    } else {
        Log-Line "Notice: Stale lock file (>30 mins old) removed."
        Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
    }
}

Set-Content -Path $lockFile -Value "$PID"
$startTime = Get-Date
$exitCode = 0

try {
    Set-Location -Path $repoRoot

    if (-not (Test-Path $nodeExe)) {
        throw "Node.js executable not found at: $nodeExe"
    }
    if (-not (Test-Path $scriptPath)) {
        throw "Script not found at: $scriptPath"
    }

    Log-Line "Invoking Node.js Project Intelligence pipeline..."

    # Direct execution capturing all output into log
    & $nodeExe $scriptPath *>&1 | ForEach-Object {
        Write-Host $_
        Add-Content -Path $logFile -Value $_
    }

    $exitCode = $LASTEXITCODE
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Log-Line "Pipeline completed with Exit Code: $exitCode (Duration: $([math]::Round($duration, 2))s)"

    if ($exitCode -eq 0) {
        Log-Line "SUCCESS: Daily Project Intelligence collection and Control Center synchronization completed."
    } else {
        Log-Line "ERROR: Pipeline exited with code $exitCode."
    }

} catch {
    Log-Line "FATAL ERROR during scheduled execution: $_"
    $exitCode = 1
} finally {
    if (Test-Path $lockFile) {
        Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
    }
    Log-Line "SCHEDULED EXECUTION FINISHED"
    Log-Line "=================================================================="
}

exit $exitCode
