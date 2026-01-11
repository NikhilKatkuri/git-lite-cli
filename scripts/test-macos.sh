#!/bin/bash
# test-macos.sh - Test script specifically for macOS

set -e

echo "🍎 Testing GLC on macOS"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Check for Homebrew (common on macOS)
if command -v brew >/dev/null 2>&1; then
    echo "🍺 Homebrew detected"
    # Ensure git is installed via Homebrew if needed
    if ! command -v git >/dev/null 2>&1; then
        echo "📦 Installing git via Homebrew..."
        brew install git
    fi
fi

# Check prerequisites
command -v node >/dev/null 2>&1 || { 
    echo "❌ Node.js is required. Install via:"
    echo "   brew install node"
    echo "   or download from https://nodejs.org"
    exit 1
}

# Install pnpm if not present
if ! command -v pnpm >/dev/null 2>&1; then
    echo "📦 Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
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
git config user.name "GLC Test User (macOS)"
git config user.email "test-macos@example.com"

# Test basic commands
echo "✅ Testing basic commands on macOS..."

cat > README.md << EOF
# GLC Test Repository (macOS)

Testing GLC compatibility on macOS $(sw_vers -productVersion)
Architecture: $(uname -m)
EOF

echo "📝 Testing glc save..."
glc save "Initial macOS test commit"

echo "📊 Testing glc status..."
glc status

echo "🌿 Testing glc branch..."
glc branch --list

# Test with some macOS-specific scenarios
echo "🍎 Testing macOS-specific scenarios..."

# Create a file with extended attributes (common on macOS)
echo "test" > test-file.txt
xattr -w com.example.test "test-value" test-file.txt 2>/dev/null || true

glc save "Test file with extended attributes"

# Test with case sensitivity (macOS defaults to case-insensitive)
echo "Case sensitivity test" > CaseTest.txt
echo "case sensitivity test" > casetest.txt 2>/dev/null || echo "Expected: case insensitive filesystem"

# Test branch operations
echo "🌿 Testing branch operations..."
glc branch --create feature-macos
glc branch --switch main
glc branch --list

# Test doctor on macOS
echo "🩺 Testing glc doctor on macOS..."
glc doctor

# Cleanup
echo "🧹 Cleaning up..."
cd /tmp
rm -rf "$TEST_DIR"

echo "✅ All tests passed on macOS!"
echo ""
echo "🎉 GLC is working correctly on your macOS system!"
echo "macOS Version: $(sw_vers -productVersion)"
echo "Architecture: $(uname -m)"
echo ""
echo "To uninstall: npm uninstall -g git-lite-cli"