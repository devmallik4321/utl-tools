@echo off
REM ==============================================================================
REM UTL.tools — Scheduled Project Intelligence Daily Runner (.CMD Entrypoint)
REM ==============================================================================
REM Invokes PowerShell wrapper with ExecutionPolicy Bypass for Task Scheduler.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\mallik\Documents\AAEP\03-Projects\UTILITY-OS\scripts\run_project_intelligence_scheduled.ps1"
