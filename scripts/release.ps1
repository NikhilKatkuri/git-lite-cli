#!/usr/bin/env pwsh
# Release script for Git Lite CLI - cross-platform PowerShell support

param(
    [string]$Version = "",
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$DryRun = $false
)

Write-Host "Git Lite CLI Release Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Get current version
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version: $currentVersion" -ForegroundColor Yellow

# Update version if specified (cross-platform npm version)
if ($Version) {
    Write-Host "Updating version to: $Version" -ForegroundColor Yellow
    & npm version $Version --no-git-tag-version
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to update version" -ForegroundColor Red
        exit 1
    }
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $currentVersion = $packageJson.version
}

# Build the project
if (!$SkipBuild) {
    Write-Host "Building project..." -ForegroundColor Blue
    & pnpm run build:clean
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "Build successful" -ForegroundColor Green
}

# Run tests
if (!$SkipTests) {
    Write-Host "Running tests..." -ForegroundColor Blue
    & pnpm run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Type check failed" -ForegroundColor Red
        exit 1
    }
    & pnpm run format:check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Format check failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "All checks passed" -ForegroundColor Green
}

# Publish to npm
if ($DryRun) {
    Write-Host "Dry run mode - would publish to npm" -ForegroundColor Yellow
    & npm publish --dry-run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dry run validation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Publishing to npm..." -ForegroundColor Blue
    & npm publish
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Published to npm successfully!" -ForegroundColor Green
        Write-Host "Install commands:" -ForegroundColor Cyan
        Write-Host "   npm install -g git-lite-cli" -ForegroundColor Cyan
        Write-Host "   yarn global add git-lite-cli" -ForegroundColor Cyan
        Write-Host "   pnpm add -g git-lite-cli" -ForegroundColor Cyan
    } else {
        Write-Host "npm publish failed" -ForegroundColor Red
        exit 1
    }
}

# Commit and tag if version was updated
if ($Version -and !$DryRun) {
    Write-Host "Committing version update..." -ForegroundColor Blue
    git add package.json
    git commit -m "chore: bump version to $currentVersion"
    git tag "v$currentVersion"
    git push origin main --tags
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push failed - check permissions" -ForegroundColor Yellow
    } else {
        Write-Host "Version committed and tagged" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Release completed! Version: $currentVersion" -ForegroundColor Green
