# git-lite CLI, Simplifying GitHub from Your Terminal

# Hi, I'm Nikhil, Creator of git-lite CLI

Git-Lite CLI is an easy-to-use, interactive command-line tool that makes GitHub workflows simpler. It helps with tasks like pushing and cloning repositories.

* ✅ No complex Git commands
* ✅ No setup headaches
* ✅ Just a clean, intuitive experience, perfect for beginners and experts alike.

> Built with Node.js, this tool is made for developers who want to learn Git in a straightforward way.

# ⚙️ Features

* 🔐 GitHub token-based authentication, stored securely on your device
* 👤 GitHub user profile validation
* 🚀 **Push any local project to GitHub in seconds**
* 📥 **Clone repositories using an interactive UI**
* 📦 **Create GitHub repository (public/private) directly from the CLI**
* 🧹 **Delete saved GitHub token from local configuration**
* 🧾 Auto-generates `.gitignore` and `.gitTrace` files
* 🧠 **Framework Detection** with smart `.gitignore` support
* 💬 Clean, colorful CLI with loaders and prompts
* 🧩 Modular structure, easy to extend

# ✨ New in v1.2.0 -- stable

* 📦 **Create GitHub Repository** (public/private)
* 🔑 **Delete saved GitHub Token**
* 🧠 **Improved Framework Detection** (Node.js, React, Python, Java...)
* 🚀 Auto `.gitignore` fallback for unknown projects

# 💻 Installation & Usage

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
git-lite
```

### First-Time Setup

* You'll be prompted to enter a GitHub Personal Access Token.
  👉 Generate your token here: [https://github.com/settings/tokens](https://github.com/settings/tokens)
* Your token and GitHub profile will be safely saved.

# 📸 Sample Workflow

```bash
📦 Welcome to Git-Lite CLI

✔ 🎉 Welcome NikhilKatkuri!
✔ 👉 Choose what you want to do: 📦 Create Repo
✔ 📝 Enter repository name: quiz_app
✔ 🔒 Visibility: Public
✅ Repo created: https://github.com/NikhilKatkuri/quiz_app

✔ 👉 Choose what you want to do: 🚀 Push Repo
✔ Enter the local project path: .
✔ Enter commit message: pushed from git-lite-cli

✅ Successfully pushed to GitHub: https://github.com/NikhilKatkuri/quiz_app.git
```

# 💡 Available Commands

| Feature      | Description                            |
| ------------ | -------------------------------------- |
| Push         | Push local project to GitHub           |
| Clone        | Clone a GitHub repo interactively      |
| Create Repo  | Create a GitHub repository from the CLI      |
| Gitignore    | Generate `.gitignore` for your project |
| Delete Token | Delete saved GitHub token              |
| Exit         | Exit the CLI tool                      |

# 🧩 Tech Stack

* Node.js
* chalk, CLI coloring
* inquirer, Interactive prompts
* simple-git, Git wrapper
* axios, API requests
* nanospinner, Loading spinners
* fs, path, Core Node.js modules

# 🤝 Contributions Welcome!

Git-Lite CLI is open-source and beginner-friendly. Contributions are welcome, whether it’s:

* Adding new features
* Improving user experience
* Fixing bugs
* Suggesting ideas

📬 Let's make Git easier and friendlier for everyone!

---

**Links**  
👉 [GitHub Repo](https://github.com/yourusername/git-lite-cli)  
👉 [npm Git-Lite CLI package](https://www.npmjs.com/package/git-lite-cli)  
👉 [GitHub Automation CLI Tool - Demo Video](#)  