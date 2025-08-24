# git-lite CLI, Simplifying GitHub from Your Terminal

[![npm version](https://img.shields.io/npm/v/git-lite-cli.svg)](https://www.npmjs.com/package/git-lite-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Hi, I'm Nikhil, Creator of git-lite CLI

🌟 GitLite CLI is a lightweight command-line automation tool built to simplify common Git and GitHub workflows. It removes repetitive steps by offering a clean, interactive interface for creating repositories, pushing code, and managing branches — all from your terminal.

- No complex Git commands
- No setup headaches
- Just a clean, intuitive experience, perfect for beginners and experts alike.

> Built with Node.js, this tool is made for developers who want to learn Git in a straightforward way.

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

# Installation & Usage

### Run Locally

```bash
npx git-lite-cli
```

### Or install globally:

```bash
npm install -g git-lite-cli
```

Then run:

```bash
git-lite-cli
```

### First-Time Setup

- You'll be prompted to enter a GitHub Personal Access Token.
  Generate your token here: [https://github.com/settings/tokens](https://github.com/settings/tokens)
- Your token and GitHub profile will be safely saved.

# Sample Workflow

```bash
Welcome to Git-Lite CLI

✔ Welcome NikhilKatkuri!
✔ Choose what you want to do: Create a new Git repository
✔ Enter repository name: my-awesome-project
✔ Visibility: Public
✅ Repo created: https://github.com/NikhilKatkuri/my-awesome-project

✔ Choose what you want to do: Push code to the repository
✔ Enter the local project path: .
✔ Enter commit message: Initial commit from git-lite-cli

✅ Successfully pushed to GitHub: https://github.com/NikhilKatkuri/my-awesome-project.git
```

# Available Commands

| Feature            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Create Repository  | Initialize new Git repositories locally and on GitHub |
| Push Code          | Push local project to GitHub                          |
| Pull Updates       | Fetch and merge changes from remote repository        |
| Clone Repository   | Clone a GitHub repo interactively                     |
| Manage Commits     | Handle commit operations                              |
| Manage Branches    | Create, switch, and manage Git branches               |
| Generate Gitignore | Generate `.gitignore` for your project                |
| Manage Profile     | Configure and manage your GitHub profile              |

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
