# Git Lite CLI [![npm version](https://img.shields.io/npm/v/git-lite-cli.svg)](https://www.npmjs.com/package/git-lite-cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A [Stratify Minds](https://github.com/NikhilKatkuri) Project**

Git Lite CLI is a simple command line tool that makes Git easier to use. Developed as part of the Stratify Minds ecosystem, this tool transforms complex Git workflows into simple, clear commands that do what you expect.

This tool helps you work with Git repositories without accidentally breaking things. It includes safety features and helpful guidance to keep your code safe while making common Git tasks much simpler.

## Why Use Git Lite CLI?

Regular Git commands can be confusing and sometimes dangerous if you make a mistake. Git Lite CLI gives you simple commands that are hard to mess up. It automatically protects your work and gives you helpful suggestions when something goes wrong.

## About Stratify Minds

Git Lite CLI is proudly developed under the **Stratify Minds** umbrella. Stratify Minds is focused on creating developer tools that simplify complex workflows and enhance productivity. Our mission is to build thoughtful, well-designed tools that make developers' lives easier.

### Other Stratify Minds Projects

This project is part of a growing ecosystem of developer tools. Stay tuned for more utilities and frameworks that share the same philosophy of simplicity, safety, and developer experience.

**Connect with Stratify Minds:**

- GitHub: [@NikhilKatkuri](https://github.com/NikhilKatkuri)
- Email: gitlitecli07@gmail.com

## Installation

Install Git Lite CLI on your computer using npm:

```bash
npm install -g git-lite-cli
```

Or if you prefer pnpm:

```bash
pnpm add -g git-lite-cli
```

After installation, you can use it with either command format:

```bash
glc <command>
# or
git-lite-cli <command>
```

You can also run it without installing globally using npx:

```bash
npx git-lite-cli <command>
```

## Getting Started

### First Time Setup

Before using Git Lite CLI with GitHub repositories, you need to set up authentication. This lets the tool access your GitHub repositories safely.

1. Read the [Authentication Guide](AUTHENTICATION.md) to set up your GitHub token
2. Run `glc auth` (or `git-lite-cli auth`) and follow the prompts
3. Verify it works by running `glc whoami` (or `git-lite-cli whoami`)

### Basic Usage

Git Lite CLI uses simple commands that do exactly what their name suggests:

**Save your work:**

```bash
glc save -m "describe what you changed"
# or
git-lite-cli save -m "describe what you changed"
```

This stages all your changes and creates a commit with your message.

**Get latest changes:**

```bash
glc sync
# or
git-lite-cli sync
```

This safely gets the latest changes from GitHub and merges them with your work.

**Check what's happening:**

```bash
glc status
# or
git-lite-cli status
```

This shows you what files have changed and gives you helpful suggestions.

**Download a repository:**

```bash
glc clone https://github.com/username/repository-name
# or
git-lite-cli clone https://github.com/username/repository-name
```

This downloads a GitHub repository to your computer.

## Available Commands

### Working With Your Code

**glc save [message]** or **git-lite-cli save [message]**
Save your changes with a description of what you did.

```bash
glc save -m "fixed the login bug"
# or
git-lite-cli save -m "fixed the login bug"
```

**glc sync** or **git-lite-cli sync**
Get the latest changes from GitHub and upload your changes.

```bash
glc sync
# or
git-lite-cli sync
```

**glc status** or **git-lite-cli status**
Check what files have changed and get helpful advice.

```bash
glc status
# or
git-lite-cli status
```

**glc undo** or **git-lite-cli undo**
Undo your last commit or revert changes to files.

```bash
glc undo
# or
git-lite-cli undo
```

### Working With Repositories

**glc clone [url]** or **git-lite-cli clone [url]**
Download a repository from GitHub to your computer.

```bash
glc clone --url https://github.com/username/repo-name
# or
git-lite-cli clone --url https://github.com/username/repo-name
```

**glc branch [name]** or **git-lite-cli branch [name]**
Create, switch, or manage branches in your repository.

```bash
glc branch              # see all branches
glc branch -c new-feature  # create and switch to new branch
# or
git-lite-cli branch
git-lite-cli branch -c new-feature
```

### Repository Maintenance

**glc size** or **git-lite-cli size**
Check how much space your repository is using and find large files.

```bash
glc size
# or
git-lite-cli size
```

**glc ignore [pattern]** or **git-lite-cli ignore [pattern]**
Add files or patterns to .gitignore so Git ignores them.

```bash
glc ignore "*.log"      # ignore all log files
glc ignore node_modules # ignore node_modules folder
# or
git-lite-cli ignore "*.log"
git-lite-cli ignore node_modules
```

**glc recover** or **git-lite-cli recover**
Try to recover deleted or lost files.

```bash
glc recover filename.txt
# or
git-lite-cli recover filename.txt
```

**glc doctor** or **git-lite-cli doctor**
Check your repository for problems and fix common issues.

```bash
glc doctor
# or
git-lite-cli doctor
```

### Identity and Authentication

**glc whoami** or **git-lite-cli whoami**
See what GitHub account you're connected to.

```bash
glc whoami
# or
git-lite-cli whoami
```

**glc auth** or **git-lite-cli auth**
Set up your GitHub authentication token.

```bash
glc auth
# or
git-lite-cli auth
```

## Common Workflows

### Daily Development Workflow

1. Start working on something new:

```bash
glc branch feature-name
# or
git-lite-cli branch feature-name
```

2. Make changes to your code, then save them:

```bash
glc save -m "added new feature"
# or
git-lite-cli save -m "added new feature"
```

3. Get latest changes and upload yours:

```bash
glc sync
# or
git-lite-cli sync
```

4. Check everything is okay:

```bash
glc status
# or
git-lite-cli status
```

### Starting a New Project

1. Download an existing project:

```bash
glc clone https://github.com/username/project-name
cd project-name
# or
git-lite-cli clone https://github.com/username/project-name
cd project-name
```

2. Check your identity is set up:

```bash
glc whoami
# or
git-lite-cli whoami
```

3. Make sure everything is working:

```bash
glc doctor
# or
git-lite-cli doctor
```

### Fixing Problems

If something goes wrong, Git Lite CLI will give you helpful suggestions. You can also:

- Run `glc doctor` (or `git-lite-cli doctor`) to check for and fix common problems
- Run `glc status` (or `git-lite-cli status`) to understand what's happening
- Run `glc recover filename` (or `git-lite-cli recover filename`) if you accidentally deleted a file

## Getting Help

If you need help with a specific command, add `--help` after any command:

```bash
glc save --help
glc sync --help
glc status --help
# or
git-lite-cli save --help
git-lite-cli sync --help
git-lite-cli status --help
```

For problems or questions:

- Check the [Authentication Guide](AUTHENTICATION.md) if you have login issues
- Look at the GitHub repository for more information
- Open an issue if you find a bug or need help

## For Developers

If you want to work on Git Lite CLI itself:

**Download the source code:**

```bash
git clone https://github.com/NikhilKatkuri/git-lite-cli.git
cd git-lite-cli
```

**Install dependencies:**

```bash
pnpm install
```

**Test your changes:**

```bash
pnpm link --global
```

## Links

- [GitHub Repository](https://github.com/NikhilKatkuri/git-lite-cli)
- [npm Package](https://www.npmjs.com/package/git-lite-cli)
- [Authentication Setup Guide](AUTHENTICATION.md)

## License

This project uses the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

We welcome help from other developers! Git Lite CLI is a Stratify Minds project, and we believe in building great tools through community collaboration. If you find bugs or have ideas for improvements, please:

- Create an issue on the [GitHub repository](https://github.com/NikhilKatkuri/git-lite-cli)
- Submit a pull request with your improvements
- Read our [Contributing Guidelines](CONTRIBUTING.md) for more details

For questions or suggestions about the broader Stratify Minds ecosystem, feel free to reach out directly.
