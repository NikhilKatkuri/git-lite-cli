#!/bin/bash
# test-linux.sh - Test script for Linux/macOS

set -e

echo "🚀 Testing GLC on $(uname -s)"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git is required"; exit 1; }

# Install pnpm if not present
if ! command -v pnpm >/dev/null 2>&1; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.0.0
fi

# Build the project
echo "🔨 Building GLC..."
pnpm install
pnpm run build

# Package and install globally
echo "📦 Packaging and installing globally..."
npm pack
PACKAGE=$(ls git-lite-cli-*.tgz | head -n 1)
npm install -g "$PACKAGE"

# Create test environment
TEST_DIR="/tmp/glc-test-$(date +%s)"
echo "🧪 Creating test environment: $TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize git repo
git init
git config user.name "GLC Test User"
git config user.email "test@example.com"

# Test basic commands
echo "✅ Testing basic commands..."

echo "# GLC Test Repository" > README.md
echo "This is a test for GLC cross-platform compatibility." >> README.md

echo "📝 Testing glc save..."
glc save "Initial test commit"

echo "📊 Testing glc status..."
glc status

echo "🌿 Testing glc branch..."
glc branch --list

echo "📄 Testing glc ignore..."
echo "node_modules/" > .gitignore
glc ignore "*.log"

echo "💾 Testing glc save again..."
glc save "Add gitignore"

echo "🔍 Testing glc size..."
glc size

echo "🩺 Testing glc doctor..."
glc doctor

# Test branch operations
echo "🌿 Testing branch operations..."
glc branch --create feature-test
glc branch --switch main
glc branch --list

# Cleanup
echo "🧹 Cleaning up..."
cd /tmp
rm -rf "$TEST_DIR"
echo "✅ All tests passed on $(uname -s)!"

echo ""
echo "🎉 GLC is working correctly on your system!"
echo "To uninstall: npm uninstall -g git-lite-cli"