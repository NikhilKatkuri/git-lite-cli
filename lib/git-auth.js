import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import path from "path";
import { getConfigDir } from "./dir/git-path.js";

const dir = getConfigDir();
const env = path.join(dir, '.env');
const tokenName = "GIT_HUB_TOKEN";

async function tokenPrompt() {
    const { token } = await inquirer.prompt({
        name: "token",
        type: "password",
        message: "🔑 Enter your GitHub token:",
        mask: "#",
    });
    return token;
}

// Replaces or appends a key=value line in a .env style file
export function upsertEnvVariable(content, key, value) {
    const lines = content.split('\n');
    let found = false;
    const updatedLines = lines.map(line => {
        if (line.startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
        }
        return line;
    });

    if (!found) {
        updatedLines.push(`${key}=${value}`);
    }

    return updatedLines.join('\n');
}

const GetGitHubToken = async () => {
    try {
        
        // Ensure the directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let token;

        if (!fs.existsSync(env) || !fs.readFileSync(env, 'utf-8').includes(tokenName)) {
            token = await tokenPrompt();
            const spinner = createSpinner('🔍 Validating token...').start();

            // Simple GitHub PAT validation
            if (token.length >= 30 && token.includes("github_pat_")) {
                let envContent = "";
                if (fs.existsSync(env)) {
                    envContent = fs.readFileSync(env, 'utf-8');
                }
                envContent = upsertEnvVariable(envContent, tokenName, token);
                fs.writeFileSync(env, envContent);

                spinner.success({ text: "✅ Token saved successfully to local config." });
                return token;
            } else {
                spinner.error({ text: "❌ Invalid token. Please try again." });
                return GetGitHubToken();
            }

        } else {
            const fileContent = fs.readFileSync(env, 'utf-8');
            const match = fileContent.match(new RegExp(`${tokenName}=([^\\n]+)`));
            token = match ? match[1] : null;

            if (!token) {
                console.log(chalk.yellow("⚠️ Token not found in .env, retrying..."));
                return GetGitHubToken();
            }

            return token;
        }

    } catch (error) {
        if (error.isTtyError) {
            console.error("❌ Terminal doesn't support prompt rendering.");
        } else {
            console.error(chalk.red("❌ Unexpected Error:\n"), error.message || error);
        }
        process.exit(1);
    }
};

export default GetGitHubToken;
