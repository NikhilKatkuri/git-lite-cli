#!/usr/bin/env node

import chalk from "chalk";
import GetGitHubToken from "./lib/git-auth.js";
import GetGitHubProfile from "./lib/git-profile.js";
import Option from "./lib/git-utils.js";
import { GitClone, GitPush } from "./lib/git-cmds.js";
import generateGitignore from "./lib/features/git-ignore.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const args = process.argv.slice(2);
const command = args[0];

// Handle direct commands first
switch (command) {
    case '--version':
    case '-v':
        console.log(`git-lite-cli version: ${pkg.version}`);
        process.exit(0);

    case '--gitignore':
    case '--gi':
        await generateGitignore();
        process.exit(0);

    case '--help':
    case '-h':
        console.log(`
Usage: git-lite-cli [command] [options]

Commands:
  push                  Git push with prompts
  clone                 Git clone with prompts
  --gitignore, --gi     Generate .gitignore
  --version, -v         Show CLI version
  --help, -h            Show help
        `);
        process.exit(0);

    case 'push':
        await GitPush();
        process.exit(0);

    case 'clone':
        await GitClone();
        process.exit(0);
}

// If no command given → fallback to interactive
const token = await GetGitHubToken();
const bool = await GetGitHubProfile(token);

if (bool) {
    console.log(chalk.blueBright.bold("\n📦 Welcome to Git-Lite CLI\n"));
    const t = await Option();

    switch (t) {
        case 'push':
            await GitPush();
            break;

        case 'clone':
            await GitClone();
            break;

        case 'generate-gitignore':
            await generateGitignore();
            break;

        case "exit":
            console.log(chalk.gray("👋 Exiting Git-Lite CLI."));
            process.exit(0);

        default:
            console.log(chalk.red("❗ Invalid option."));
            process.exit(1);
    }
} else {
    process.exit(1);
}
