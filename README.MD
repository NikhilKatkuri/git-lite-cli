# Git Lite CLI [![npm version](https://img.shields.io/npm/v/git-lite-cli.svg)](https://www.npmjs.com/package/git-lite-cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<div align="center"> <table> <tr> <td width="50%"> <div> <img src="brand/Stratify minds.svg" alt="Stratify Minds Logo" width="124"> <p><strong>Stratify Minds</strong></p> </div> </td> <td width="50%"> <div> <img src="brand/git-lite-cli.svg" alt="Git Lite CLI Logo" width="124"> <p><strong>Git Lite CLI</strong></p> </div> </td> </tr> </table> </div>

**A [Stratify Minds](https://github.com/NikhilKatkuri) Project**

Git Lite CLI is a command line tool that aims to make Git easier to use. Developed as part of the Stratify Minds ecosystem, this tool provides simplified commands for common Git workflows.

This tool includes features designed to help with Git repository management and aims to make common Git tasks more accessible.

## Why Use Git Lite CLI?

Regular Git commands can be complex and intimidating for new users. Git Lite CLI provides simplified commands with clear naming conventions. It aims to provide a more approachable interface to common Git operations.

## About Stratify Minds

Git Lite CLI is developed by Nikhil Katkuri under the Stratify Minds name.

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

Git Lite CLI uses simplified commands with clear naming:

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

This fetches the latest changes from the remote repository and attempts to merge them with your work.

**Check what's happening:**

```bash
glc status
# or
git-lite-cli status
```

This shows you what files have changed in your repository.

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
glc clone  https://github.com/username/repo-name
# or
git-lite-cli clone https://github.com/username/repo-name
```

**glc branch [name]** or **git-lite-cli branch [name]**
Create, switch, or manage branches in your repository.

```bash
glc branch                    # see all branches
glc branch -c new-feature     # create new branch
glc branch -s new-feature     # switch to branch
# or
git-lite-cli branch
git-lite-cli branch -c new-feature
git-lite-cli branch -s new-feature
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
Add files or patterns to .gitignore or use predefined templates.

```bash
glc ignore "*.log"              # ignore all log files
glc ignore node_modules         # ignore node_modules folder
glc ignore -t Node.js           # use Node.js template
# or
git-lite-cli ignore "*.log"
git-lite-cli ignore node_modules
git-lite-cli ignore -t Node.js
```

**glc recover [files...]** or **git-lite-cli recover [files...]**
Try to recover deleted or lost files.

```bash
glc recover filename.txt        # recover specific file
glc recover --all              # recover all files
glc recover -i                 # interactive recovery
# or
git-lite-cli recover filename.txt
git-lite-cli recover --all
git-lite-cli recover -i
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
glc branch -c feature-name
# or
git-lite-cli branch -c feature-name
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

If you encounter issues, you can try:

- Run `glc doctor` (or `git-lite-cli doctor`) to check for common problems
- Run `glc status` (or `git-lite-cli status`) to see the current repository state
- Run `glc recover filename` (or `git-lite-cli recover filename`) to attempt file recovery

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
