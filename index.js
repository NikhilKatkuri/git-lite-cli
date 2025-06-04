#!/usr/bin/env node


import chalk from "chalk";
import GetGitHubToken from "./lib/git-auth.js";
import GetGitHubProfile from "./lib/git-profile.js";
import Option from "./lib/git-utils.js";
import { GitPush } from "./lib/git-cmds.js";

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
                console.log(chalk.yellow("🚧 Clone feature not implemented yet."));
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
