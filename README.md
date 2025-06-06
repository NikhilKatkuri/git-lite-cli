# 🚀 Git-Lite CLI – Simplifying GitHub from Your Terminal

# 👋 Hi, I'm Nikhil – Creator of Git-Lite CLI
Git-Lite CLI is a beginner-friendly, interactive command-line tool designed to simplify GitHub workflows like pushing and cloning repositories.
- ✅ No complex Git commands
- ✅ No setup headaches
- ✅ Just a clean, intuitive experience — perfect for beginners and pros alike.\

> Built using Node.js, and made with ❤️ for developers who want to learn Git the clean way.
# ⚙️ Features
- 🔐 GitHub token-based authentication (stored securely on your device)
- 👤 GitHub user profile validation
- 🚀 Push any local project to GitHub in seconds
- 📥 Clone repositories via interactive UI
- 🧾 Auto-generates .gitignore and .gitTrace files
- 🧠 Modular structure, easy to extend
- 💬 Clean, colorful CLI with loaders and prompts

# 💻 Installation & Usage
Run Locally
```bash
npx git-lite-cli@latest
```
Or install globally:

```bash
npm install -g git-lite-cli@latest
```
Then run:

```bash
git-lite
```

First-Time Setup
- You'll be prompted to enter a GitHub Personal Access Token
 👉 Generate your token here[https://github.com/settings/tokens]
- Token and GitHub profile will be securely saved locally


# 📸 Sample Workflow

```bash
📦 Welcome to Git-Lite CLI

✔ 🎉 Welcome NikhilKatkuri!
✔ 👉 Choose what you want to do: 🚀 Push a repository
✔ Enter the GitHub repo URL: https://github.com/NikhilKatkuri/git-lite-cli.git
✔ Enter the local path to push: .
✔ Enter a commit message: pushed from git-lite-cli

✅ Successfully pushed to GitHub: git-lite-cli
```

# 💡 Available Commands
| Feature | Description                       |
| ------- | --------------------------------- |
| Push    | Push local project to GitHub      |
| Clone   | Clone a GitHub repo interactively |
| Exit    | Exit the CLI tool                 |

# 🧩 Tech Stack
- Node.js
- chalk – CLI coloring
- inquirer – Interactive prompts
- simple-git – Git wrapper
- axios – API requests
- nanospinner – Loading spinners
- fs, path – Core Node.js modules

# 🤝 Contributions Welcome!

Git-Lite CLI is open-source and beginner-friendly. Contributions are welcome — whether it’s:

- Adding new features
- Improving UX
- Fixing bugs
- Suggesting ideas

📬 Let's make Git easier and friendlier for everyone!
