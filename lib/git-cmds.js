import chalk from "chalk";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { createSpinner } from "nanospinner"; 

const GitIgnore = `# Node.js dependencies
node_modules/
# workflow
giticonfig/

# Build output
dist/
build/
lib/
out/

# TypeScript
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# dotenv environment variables
.env
.env.*.local

# OS
.DS_Store
Thumbs.db

# Editors / IDEs
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln

# Coverage reports
coverage/

# Optional npm cache directory
.npm/

# ESLint cache
.eslintcache

# Parcel / Next.js
.next/
.cache/

# Testing
test-output/
jest-output/

# Others
*.tgz
*.zip
*.bak
*.tmp
*.swp

# Git CLI specific
config/
*.token
*.key
*.crt
*.pem
*.pfx`;

async function GitPushCmd(repoUrl, rootPath, commitMsg) {
  const spinner = createSpinner("Pushing, please wait ...").start();

  try {
    // Ensure directory exists
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }

    const gitIgnoreFile = path.join(rootPath, ".gitignore");
    if (!fs.existsSync(gitIgnoreFile)) {
      fs.writeFileSync(gitIgnoreFile, GitIgnore);
    }

    const git = simpleGit(rootPath);

    await git.init();
    await git.add(".");
    await git.commit(commitMsg);
    await git.branch(["-M", "main"]);

    // Check if remote 'origin' exists
    const remotes = await git.getRemotes(true);
    const originRemote = remotes.find((r) => r.name === "origin");

    if (originRemote) {
      // If existing remote URL differs, update it
      if (originRemote.refs.fetch !== repoUrl) {
        await git.removeRemote("origin");
        await git.addRemote("origin", repoUrl);
      }
    } else {
      await git.addRemote("origin", repoUrl);
    }

    await git.push("origin", "main", ["--force"]);

    spinner.success();
    console.log(chalk.green(`✅ Successfully pushed to GitHub: ${repoUrl}`));
  } catch (error) {
    spinner.error();
    console.log(chalk.red(`❌ Git Push Failed: ${error.message}`));
  }
}

async function GitPush() {
  try {
    const { repoName, repopath, commit } = await inquirer.prompt([
      {
        name: "repoName",
        type: "input",
        message:
          "Enter a correct repo URL (https://github.com/****/*.git) or 'y' to use stored remote:",
        default: "y",
        validate: (input) =>
          input === "y" || /^https?:\/\/.+\.git$/.test(input) || "Enter a valid git repo URL or 'y'",
      },
      {
        name: "repopath",
        type: "input",
        message: "Enter the local directory path:",
        default: ".",
      },
      {
        name: "commit",
        type: "input",
        message: "Enter the commit message:",
        default: "pushed from git-lite-cli",
      },
    ]);

    const tracePath = path.join(repopath, ".gitTrace");

    if (repoName === "y") {
      if (!fs.existsSync(tracePath)) {
        console.log(
          chalk.red("❌ No stored remote found. Please enter the repo URL.")
        );
        return;
      }
      const readTrace = fs.readFileSync(tracePath, "utf-8").trim();
      const remoteUrl = readTrace.startsWith("remote=") ? readTrace.split("=")[1] : null;
      if (!remoteUrl) {
        console.log(chalk.red("❌ Could not find remote URL in .gitTrace."));
        return;
      }
      console.log(chalk.green(`Using stored remote: ${remoteUrl}`));
      await GitPushCmd(remoteUrl, repopath, commit);
    } else {
      // Store or update the remote URL in .gitTrace
      fs.writeFileSync(tracePath, `remote=${repoName}`);
      await GitPushCmd(repoName, repopath, commit);
    }
  } catch (err) {
    if (err.isTtyError) {
      console.error("❌ Terminal doesn't support prompt rendering.");
    } else {
      console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
    }
    process.exit(0);
  }
}

async function GitCloneCmd(reponame, repopath, spinner) {
  try {
    const git = simpleGit();
    // pass repo link and local path
    await git.clone(reponame, repopath);
    spinner.success("cloned successfully");
  } catch (error) {
    console.log(chalk.red(`❌ Clone failed: ${error.message}`));
    spinner.error("error");
  }
}

async function GitClone() {
  try {
    const { reponame, repopath } = await inquirer.prompt([
      {
        name: "reponame",
        type: "input",
        message: "Enter the repo link to clone : ",
        validate: (input) => !!input || "Repo link cannot be empty",
      },
      {
        name: "repopath",
        type: "input",
        message: "Enter the local directory path: ",
        default: ".",
      },
    ]);
    const spinner = createSpinner(`cloning ${reponame} into ${repopath} `).start();
    await GitCloneCmd(reponame, repopath, spinner);
    // No need to call spinner.stop() here; success/error handles it
  } catch (err) {
    if (err.isTtyError) {
      console.error("❌ Terminal doesn't support prompt rendering.");
    } else {
      console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
    }
    process.exit(0);
  }
}

export { GitPush, GitClone };
