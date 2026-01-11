# GLC (Git Lite CLI) [![npm version](https://img.shields.io/npm/v/git-lite-cli.svg)](https://www.npmjs.com/package/git-lite-cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

GLC is a high-performance, developer-friendly CLI tool designed to simplify complex Git workflows. Built for developers who want the full power of Git without the complexity of its syntax.

GLC combines Git and GitHub commands into intuitive, easy-to-remember commands that guide you through common development tasks while enforcing best practices and keeping your repository safe and healthy. Use it efficiently as a drop-in replacement for standard Git commands.

## Why Choose GLC?

Traditional Git commands can be cryptic and potentially destructive. GLC provides a comprehensive safety layer with guided workflows, automatic stashing, and built-in diagnostics to ensure your repository remains healthy and your work stays protected.

## Installation

Install globally using pnpm (recommended for optimal memory efficiency):

```bash
pnpm add -g git-lite-cli
```

Alternatively, install using npm:

```bash
npm install -g git-lite-cli
```

Usage:

```bash
glc <command>
```

You can also run without global installation using npx:

```bash
npx git-lite-cli <command>
```

## Commands

### Core Workflow

- `glc clone ...args`: Clone a repository with enhanced security and best practices

- `glc save ...args`: Stage all changes and commit with a descriptive message

- `glc sync ...args`: Safely synchronize changes (automatic stash → pull → push → pop)

- `glc undo ...args`: Safely undo the last commit or revert changes

- `glc status ...args`: Check project health, track divergence, and receive actionable suggestions

### Repository Management

- `glc branch ...args`: Interactive branch management (create, switch, cleanup, and sync)

- `glc size ...args`: Analyze repository size and detect large files

- `glc ignore ...args`: Quickly add patterns to .gitignore

- `glc recover ...args`: Advanced file restoration for recovering lost work

### System & Maintenance

- `glc doctor ...args`: Self-diagnostic tool that detects and fixes common Git issues

- `glc whoami ...args`: Display linked Git and GitHub identities

- `glc auth ...args`: Secure authentication via the GLC backend service

## Development Setup

Clone the repository:

```bash
git clone https://github.com/NikhilKatkuri/git-lite-cli.git
cd git-lite-cli
```

Install dependencies:

```bash
pnpm install
```

Link for development:

```bash
pnpm link --global
```

## Resources

- [GitHub Repository](https://github.com/NikhilKatkuri/git-lite-cli)

- [npm Package](https://www.npmjs.com/package/git-lite-cli)

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Contributing

We welcome contributions! If you encounter issues or have suggestions for improvements, please open an issue on our GitHub repository.
