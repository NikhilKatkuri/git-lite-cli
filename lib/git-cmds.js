import chalk from "chalk";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import fs, { readFileSync } from "fs";
import path from "path";
import { createSpinner } from "nanospinner";
const GitIgnore = `# Node.js dependencies
node_modules/

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
*.pfx
`;
let GitTrace = "";
/**
 * Pushes a repo to GitHub.
 * @param {string} repoName - The name of the GitHub repository.
 * @param {string} path - The local path to the project folder.
 * @param {string} commit - The commit message.
 * @param {string} username - GitHub username.
 */

export async function GitPushCmd(repoName, rootpath, commit, username) {
    const spinner = createSpinner("pushing please wait ...").start();
    const file = path.join(rootpath, ".gitignore");
    const trace = path.join(rootpath, ".gitTrace");
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, GitIgnore);
    }

    const fileTrace = fs.readFileSync(trace).toString();
    GitTrace = fileTrace;
    if (!GitTrace.includes(`remote = ${repoName}`)) {
        GitTrace = `remote = ${repoName}`;
    }
    fs.writeFileSync(trace, GitTrace);

    const git = simpleGit(rootpath);
    try {
        await git.init();
        await git.add(".");
        await git.commit(commit);
        await git.branch(["-M", "main"]);
        if (!GitTrace.includes('remote')) {
            await git.addRemote("origin", repoName);
        }
        await git.push("origin", "main", ["--force"]);
        spinner.success();
        console.log(chalk.green(`✅ Successfully pushed to GitHub: ${repoName}`));
    } catch (error) {
        spinner.error("error");
        console.log(chalk.red(`❌ Git Push Failed: ${error.message}`));
    }
}

async function GitPush() {
    // repo name
    // add default . terminal dir
    const { repoName, repopath, commit } = await inquirer.prompt([
        {
            name: "repoName",
            type: "input",
            message: "enter an correct repourl (https://github.com/****/*.git or if already y)  : ",
        },
        {
            name: "repopath",
            type: "input",
            message: "enter an correct dir or path : ",
            default: ".",
        },
        {
            name: "commit",
            type: "input",
            message: "enter an commit : ",
            default: "pushed from git-lite-cli",
        },
    ]);
    // console.log(repoName, path, commit);
    if (repoName === "y") {
        const trace = path.join(repopath, ".gitTrace");
        const file = readFileSync(trace).toString();
        let index = file.split('=');
        index = index[index.indexOf('remote') + 1]
        console.log("your remote is " + chalk.green(index));
        await GitPushCmd(index, repopath, commit);
        return;
    }
    await GitPushCmd(repoName, repopath, commit);

}

export { GitPush };
