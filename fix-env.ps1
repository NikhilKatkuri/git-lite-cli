# Fix Development Environment Script
Write-Host "Fixing development environment..." -ForegroundColor Green

# Fix PATH for current session
$env:PATH = [Environment]::GetEnvironmentVariable("PATH", "User") + ";" + [Environment]::GetEnvironmentVariable("PATH", "Machine")

# Verify tools
Write-Host "Checking development tools:" -ForegroundColor Yellow
try { git --version; Write-Host "✅ Git: Working" -ForegroundColor Green } catch { Write-Host "❌ Git: Not working" -ForegroundColor Red }
try { node --version; Write-Host "✅ Node.js: Working" -ForegroundColor Green } catch { Write-Host "❌ Node.js: Not working" -ForegroundColor Red }
try { python --version; Write-Host "✅ Python: Working" -ForegroundColor Green } catch { Write-Host "❌ Python: Not working" -ForegroundColor Red }
try { java --version; Write-Host "✅ Java: Working" -ForegroundColor Green } catch { Write-Host "❌ Java: Not working" -ForegroundColor Red }

Write-Host "Environment fix complete!" -ForegroundColor Green
Write-Host "Run this script anytime you have PATH issues: .\fix-env.ps1" -ForegroundColor Cyan