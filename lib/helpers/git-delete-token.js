import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getConfigDir } from "../../dir/git-path.js";

const dir = getConfigDir();
const envPath = path.join(dir, ".env");
const configPath = path.join(dir, "config.json");

async function GitDeleteToken() {
    try {
        // delete .env
        if (fs.existsSync(envPath)) {
            fs.unlinkSync(envPath);
            console.log(chalk.green("✅ .env (GitHub token) deleted successfully."));
        } else {
            console.log(chalk.yellow("⚠️ No .env token file found."));
        }

        // delete config.json
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
            console.log(chalk.green("✅ config.json deleted successfully."));
        } else {
            console.log(chalk.yellow("⚠️ No config.json file found."));
        }

    } catch (err) {
        console.error(chalk.red("❌ Failed to delete token or config:"), err.message);
    }
}

export { GitDeleteToken };
