import axios from "axios";
import { createSpinner } from "nanospinner";
import fs from 'fs';
import path from "path";
import { getConfigDir } from "./dir/git-path.js";
import ConfigUpdate from "./auto_config/git-user-email.js";

const url = 'https://api.github.com/user';
const dir = getConfigDir();
const jsonFile = path.join(dir, 'config.json');
const env = path.join(dir, '.env');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const GetGitHubProfile = async (token) => {

    const spinner = createSpinner('Fetching GitHub user profile...').start();

    try {
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(jsonFile) || !fs.readFileSync(jsonFile).includes("username")) {
            const res = await axios.get(url, {
                headers: { Authorization: `token ${token}` }
            });

            const { login } = res.data;
            let data = { ...res.data, timeStamped: new Date().toISOString() };
            fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));

            let envContent = fs.readFileSync(env);
            if (fs.existsSync(env)) {
                if (!envContent.includes('username=')) {
                    envContent += `\nusername=${login}`;
                } else {
                    envContent = envContent.replace(/username=.*/g, `username=${login}`);
                }
                fs.writeFileSync(env, envContent);
            }

            spinner.success({ text: `🎉 Welcome ${login}!` });
            await ConfigUpdate();
            return true;
        }

        else {
            await delay(500);
            const fileContent = fs.readFileSync(jsonFile, 'utf-8');
            let file = JSON.parse(fileContent);
            file.timeStamped = new Date().toISOString();
            fs.writeFileSync(jsonFile, JSON.stringify(file, null, 2));
            const { login } = file;
            spinner.success({ text: `🎉 Welcome back ${login}!` });
            return true;
        }

    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        spinner.error({ text: `Failed to fetch profile: ${errMsg}` });
    }

    return false;
};

export default GetGitHubProfile;
