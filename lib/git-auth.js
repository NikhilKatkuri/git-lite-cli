import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import path from "path";

const dir = path.join('C://git-lite-cli//config//');
const env = path.join(dir, '.env');
const tokenName = "GIT_HUB_TOKEN";


async function tokenPromt() {
    const { token } = await inquirer.prompt({
        name: "token",
        type: "password",
        message: "🔑 Enter your Git-hub token : ",
        mask: "#",
    });
    return token;
}

export function SearchAsArray(string, find, spliter = "=") {
    let array = string.split(spliter);
    let index = array.indexOf(find);
    return array[index + 1];
}

const GetGitHubToken = async () => {
    try {
        if (!fs.existsSync(env) || !fs.readFileSync(env).toString().includes(tokenName)) {
            const token = await tokenPromt();
            const spinner = createSpinner('validating...').start();
            if (token.length >= 30 && (token.includes("github_pat_"))) {

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                fs.writeFileSync(env, `${tokenName}=${token}`);
                spinner.success("😉 token saved sucessfully in local device.")
                return token;
            }
            else {
                spinner.error("re-enter the token");
                return GetGitHubToken();
            }

        }
        else {
            const file = fs.readFileSync(env).toString();
            const token = SearchAsArray(file, tokenName);
            return token;
        }

    } catch (error) {
        console.log(chalk.red(error));
    }
};


export default GetGitHubToken;
