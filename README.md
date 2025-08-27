# git-lite CLI - Git Made Simple 🚀

[![npm version](https://img.shields.io/npm/v/git-lite-cli.svg)](https://www.npmjs.com/package/git-lite-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is git-lite-cli?

**A friendly, interactive CLI that makes Git and GitHub accessible to everyone** - no more memorizing complex commands!

### ⚡ Try it now:

```bash
npx git-lite-cli
```

### 🎯 What it's used for:

- **Create GitHub repositories** in seconds (public/private)
- **Push your code** without remembering Git commands
- **Clone repositories** with interactive selection
- **Manage branches** visually and safely
- **Pull updates** with guided merge strategies

## 📚 Documentation

- **[What is it used for?](docs/WHAT_IS_IT_USED_FOR.md)** - Complete explanation and benefits
- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 3 steps
- **[Use Cases & Examples](docs/USE_CASES.md)** - Real-world scenarios
- **[FAQ](docs/FAQ.md)** - Common questions answered
- **[Ctrl+C Handling](docs/CTRL_C_HANDLING.md)** - Technical implementation details

## 🌟 Perfect for:

- 👶 **Beginners** learning Git
- 🚀 **Experienced developers** wanting faster workflows
- 👨‍🏫 **Educators** teaching Git concepts
- 🏢 **Teams** standardizing Git workflows

---

# Hi, I'm Nikhil, Creator of git-lite CLI

🌟 Built with Node.js and TypeScript, this tool transforms Git from a scary command-line interface into a friendly, interactive assistant.

- ✅ No complex Git commands to memorize
- ✅ No setup headaches
- ✅ Clean, intuitive experience for beginners and experts
- ✅ Focus on coding, not Git syntax

# Features

- GitHub token-based authentication, stored securely on your device
- GitHub user profile validation
- **Push any local project to GitHub in seconds**
- **Clone repositories using an interactive UI**
- **Create GitHub repository (public/private) directly from the CLI**
- **Branch management** - Create, switch, and manage Git branches
- **Commit management** - Handle commits with ease
- **Pull updates** - Fetch and merge the latest changes from remote repositories
- Auto-generates `.gitignore` files
- **Framework Detection** with smart `.gitignore` support
- Clean, colorful CLI with loaders and prompts
- Modular structure, easy to extend

# New in v2.0.0 -- Latest

- **Enhanced Repository Creation** (public/private)
- **Improved Framework Detection** (Node.js, React, Python, Java...)
- Auto `.gitignore` fallback for unknown projects
- **Better Branch Management**
- **Enhanced CLI Experience** with @clack/prompts

# 🚀 Installation & Usage

## Fastest Way to Try

```bash
npx git-lite-cli
```

## Install Globally

```bash
npm install -g git-lite-cli
git-lite-cli
```

## Command Line Options

```bash
git-lite-cli                # Interactive CLI (main feature)
git-lite-cli --version      # Show version
git-lite-cli --help         # Show help
```

**First time?** Check out our **[Quick Start Guide](docs/QUICK_START.md)** →

# ✨ Sample Workflow

**See how easy it is:**

```bash
npx git-lite-cli

✔ Welcome NikhilKatkuri!
✔ Choose what you want to do: Create a new Git repository
✔ Enter repository name: my-awesome-project
✔ Visibility: Public
✅ Repo created: https://github.com/NikhilKatkuri/my-awesome-project

✔ Choose what you want to do: Push code to the repository
✔ Enter commit message: Initial commit from git-lite-cli

✅ Successfully pushed to GitHub!
```

**Want more examples?** See **[Use Cases & Examples](docs/USE_CASES.md)** →

# 🎯 Available Commands

| Feature                | Description                           | Use Case                                 |
| ---------------------- | ------------------------------------- | ---------------------------------------- |
| **Create Repository**  | Initialize new repos locally + GitHub | Share your project with the world        |
| **Push Code**          | Upload local changes to GitHub        | Save your progress, enable collaboration |
| **Pull Updates**       | Fetch changes from remote repository  | Get teammate's latest code               |
| **Clone Repository**   | Download repos interactively          | Work on existing projects                |
| **Manage Commits**     | Handle commit operations easily       | Organize your code history               |
| **Manage Branches**    | Create, switch, manage Git branches   | Develop features safely                  |
| **Generate Gitignore** | Auto-create `.gitignore` files        | Keep unwanted files out of Git           |
| **Manage Profile**     | Configure GitHub profile settings     | Set up your developer identity           |

**Curious about when to use each?** Check **[Use Cases & Examples](docs/USE_CASES.md)** →

# Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **@clack/prompts** - Beautiful command-line prompts
- **ESLint** - Code linting
- **Prettier** - Code formatting

# Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- GitHub account

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/NikhilKatkuri/git-lite-cli.git
   cd git-lite-cli
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

4. **Run in development mode:**
   ```bash
   npm run cli
   ```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm start` - Run the compiled CLI
- `npm run cli` - Run the CLI in development mode
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Lint code with ESLint

## Project Structure

```
src/
├── index.ts              # Main entry point
├── auth/                 # Authentication modules
│   ├── isAuth.ts         # Authentication checker
│   └── profile.ts        # User profile management
├── dir/                  # Directory configuration
│   ├── config_dir.ts     # Directory configuration
│   └── config_root.ts    # Root configuration
├── services/             # Core services
│   ├── branch.ts         # Branch operations
│   ├── cli.ts            # CLI interface
│   ├── create.ts         # Repository creation
│   ├── gitIgnoreGen.ts   # .gitignore generation
│   └── push.ts           # Push operations
├── tasks/                # Task handlers
│   ├── branchTask.ts     # Branch task handler
│   ├── clone.ts          # Clone task handler
│   ├── commit.ts         # Commit task handler
│   ├── profileTask.ts    # Profile task handler
│   └── pull.ts           # Pull task handler
├── types/                # TypeScript type definitions
│   ├── RepoConfig.ts     # Repository configuration types
│   └── userProfile.ts    # User profile types
└── utils/                # Utility functions
    ├── avatar.ts         # Avatar utilities
    ├── crog.ts           # Logging utilities
    ├── excuter.ts        # Command execution
    ├── fetchUser.ts      # User fetching
    ├── gcp.ts            # Git command processor
    ├── greetings.ts      # User greetings
    ├── ICN.ts            # Internet connectivity
    ├── isGit.ts          # Git repository checker
    └── repo.ts           # Repository utilities
```

# Contributions Welcome!

Git-Lite CLI is open-source and beginner-friendly. Contributions are welcome, whether it's:

- Adding new features
- Improving user experience
- Fixing bugs
- Suggesting ideas

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Let's make Git easier and friendlier for everyone!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**NIKHIL KATKURI**

- GitHub: [@NikhilKatkuri](https://github.com/NikhilKatkuri)

## Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/NikhilKatkuri/git-lite-cli/issues) on GitHub.

---

**Links**  
[GitHub Repo](https://github.com/NikhilKatkuri/git-lite-cli)  
[npm Git-Lite CLI package](https://www.npmjs.com/package/git-lite-cli)  
[Demo Video - Coming Soon](#)

---

If you find this project helpful, please consider giving it a star on GitHub!
