#!/usr/bin/env node


import chalk from "chalk";
import GetGitHubToken from "./lib/git-auth.js";
import GetGitHubProfile from "./lib/git-profile.js";
import Option from "./lib/git-utils.js";
import { GitClone, GitPush } from "./lib/git-cmds.js";

import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
    console.log(`git-lite-cli version: ${pkg.version}`);
    process.exit(0);
}


const token = await GetGitHubToken();
const bool = await GetGitHubProfile(token);

(async () => {
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

            case "exit":
                console.log(chalk.gray("👋 Exiting Git-Lite CLI."));
                process.exit(0);

            default:
                console.log(chalk.red("❗ Invalid option."));
                process.exit(1);
        }
    }

    else {
        process.exit(1)
    }

})();
