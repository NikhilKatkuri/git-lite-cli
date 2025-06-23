import chalk from "chalk";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { createSpinner } from "nanospinner";
import detectFramework from "./helpers/detectFramework.js"
import { flattemplates, getGenerateGitignore } from "./features/git-ignore.js";
import axios from "axios";
import GetGitHubToken from "./git-auth.js";
async function GitPushCmd(repoUrl, rootPath, commitMsg) {
  const spinner = createSpinner("Pushing, please wait ...").start();

  try {
    // Ensure directory exists
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }

    const gitIgnoreFile = path.join(rootPath, ".gitignore");
    if (!fs.existsSync(gitIgnoreFile)) {
      const framework = detectFramework(rootPath);
      const templateToUse = flattemplates[framework];
      await getGenerateGitignore(templateToUse);

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
  } catch (err) {
    if (err.isTtyError) {
      console.error("❌ Terminal doesn't support prompt rendering.");
    } else {
      console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
    }
    process.exit(0);
  }
}

async function CreateGitHubRepo(token, repoName, description = "", isPrivate = false) {
  const url = "https://api.github.com/user/repos";
  try {
    const res = await axios.post(url, {
      name: repoName,
      description: description || `Created with Git-Lite CLI 🚀`,
      private: isPrivate
    }, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    console.log(chalk.green(`✅ Repo created: ${res.data.html_url}`));
    return res.data.clone_url;

  } catch (error) {
    if (error.response?.data?.message === 'Resource not accessible by personal access token') {
      console.log(chalk.red(`❌ Token does not have permission to create repos.`));
      console.log(`👉 Fix: Create PAT with 'repo' permission or enable 'repository creation' scope.`);
      console.log(`🔗 https://github.com/settings/tokens`);
      return null
    }

    console.log(chalk.red(`❌ Failed to create repo: ${error.response?.data?.message || error.message}`));
    return null;
  }
}


async function GitCreateRepo() {
  const token = await GetGitHubToken();
  try {
    if (!token) {
      console.log(chalk.red("❌ GitHub token not found. Please authenticate first."));
      process.exit(1);
    }

    const { repoName, description, isPrivate } = await inquirer.prompt([
      {
        name: "repoName",
        type: "input",
        message: "📝 Enter the repository name:",
        validate: (input) => !!input || "❌ Repo name cannot be empty!",
      },
      {
        name: "description",
        type: "input",
        message: "📄 Enter a short description (optional):",
        default: "",
      },
      {
        name: "isPrivate",
        type: "list",
        message: "🔒 Set repository visibility:",
        choices: [
          { name: "🔓 Public", value: "public" },
          { name: "🔒 Private", value: "private" },
        ],
        default: "public",
      },
    ]);
    const newRepoURL = await CreateGitHubRepo(token, repoName, description, isPrivate);
    if (newRepoURL) {
      const { repopath, commit } = await inquirer.prompt([
        {
          name: "repopath",
          type: "input",
          message: "📂 Enter your local project path to push:",
          default: ".",
        },
        {
          name: "commit",
          type: "input",
          message: "📝 Enter commit message:",
          default: "pushed from git-lite-cli",
        },
      ]);

      await GitPushCmd(newRepoURL, repopath, commit);
    } else {
      console.log(chalk.yellow("⚠️ Skipping push because repo creation failed."));
    }
  }
  catch (err) {
    // Handling Ctrl+C / SIGINT interruption
    if (err.isTtyError) {
      console.error("❌ Terminal doesn't support prompt rendering.");
    } else {
      console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
    }
    process.exit(0);
  }
}

export { GitPush, GitClone, GitCreateRepo };
