# Cross-Platform Testing Guide for GLC

This guide provides multiple approaches to test GLC on Linux and macOS.

## 🚀 Quick Start Testing

### Prerequisites

- Node.js 18+
- Git
- pnpm (will be installed automatically)

## 📋 Testing Options

### 1. Automated CI Testing (GitHub Actions)

**Recommended for comprehensive testing**

The CI workflow automatically tests on:

- Ubuntu (Linux)
- macOS
- Windows
- Node.js versions: 18.x, 20.x, 22.x

Just push your code and GitHub Actions will run tests automatically.

### 2. Docker Testing (Local Linux Testing)

Test on multiple Linux distributions locally:

```bash
# Test on Alpine Linux and Ubuntu
npm run test:docker

# Interactive testing environment
npm run test:docker:interactive
```

### 3. Manual Testing Scripts

#### For Linux:

```bash
# Make script executable (on Linux/macOS)
chmod +x scripts/test-linux.sh

# Run the test
./scripts/test-linux.sh
```

#### For macOS:

```bash
# Make script executable
chmod +x scripts/test-macos.sh

# Run the test
./scripts/test-macos.sh
```

### 4. Cloud Testing Services

#### GitHub Codespaces

1. Open your repo in GitHub
2. Click "Code" → "Codespaces" → "Create codespace"
3. Run tests in the Ubuntu environment

#### Replit

1. Import your GitHub repo to Replit
2. Choose Node.js template
3. Run tests in their Linux environment

#### GitPod

1. Go to `gitpod.io/#https://github.com/NikhilKatkuri/git-lite-cli`
2. Wait for environment setup
3. Run tests in Ubuntu environment

### 5. Virtual Machine Testing

#### Using VirtualBox/VMware

1. Download Ubuntu/macOS VMs
2. Install Node.js and Git
3. Clone your repo and run tests

#### Using WSL2 (Windows Subsystem for Linux)

```bash
# In WSL2 Ubuntu
git clone https://github.com/NikhilKatkuri/git-lite-cli.git
cd git-lite-cli
./scripts/test-linux.sh
```

## 🧪 Manual Test Commands

If you prefer to test manually, here are the key commands to verify:

### Basic Installation Test

```bash
# Install globally
npm install -g git-lite-cli

# Verify installation
glc --version
glc --help
```

### Core Functionality Test

```bash
# Create test repository
mkdir glc-test && cd glc-test
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Test core commands
echo "# Test" > README.md
glc save "Initial commit"
glc status
glc branch --list
glc ignore "*.log"
glc size
glc doctor
```

### Advanced Features Test

```bash
# Test branch operations
glc branch --create feature-test
glc branch --switch main
glc branch --rebase feature-test

# Test sync operations
glc sync

# Test recovery
echo "test" > test.txt
rm test.txt
glc recover test.txt
```

## 🔍 Platform-Specific Considerations

### Linux

- Test with different distributions (Ubuntu, CentOS, Alpine)
- Check file permission handling
- Test with different shells (bash, zsh, fish)

### macOS

- Test on both Intel and Apple Silicon Macs
- Check case-insensitive filesystem behavior
- Test with Homebrew-installed vs system Git

### Common Issues to Watch For

- Path separator differences (`/` vs `\\`)
- Line ending differences (LF vs CRLF)
- Case sensitivity variations
- Permission handling differences
- Shell environment differences

## 📊 Test Results Documentation

After testing, document results like:

```
✅ Ubuntu 22.04 - All tests passed
✅ macOS 14.0 (ARM64) - All tests passed
✅ Alpine Linux - All tests passed
❌ CentOS 7 - Failed: Node.js version too old
```

## 🚨 Troubleshooting

### Permission Errors

```bash
# Fix npm permission issues
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Node.js Version Issues

```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Git Configuration Issues

```bash
# Set up git if not configured
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🔄 Automated Testing Pipeline

For continuous testing, the GitHub Actions workflow will:

1. Test on multiple OS and Node.js versions
2. Build and package the CLI
3. Install globally and run functionality tests
4. Report results for each platform combination

This ensures GLC works consistently across all supported platforms.
