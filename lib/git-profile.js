import axios from "axios";
import { createSpinner } from "nanospinner";
import fs from 'fs';
import path from "path";
const url = 'https://api.github.com/user';

const dir = path.join('C://git-lite-cli//config//');
const jsonFile = path.join(dir, '.json');
const env = path.join(dir, '.env');
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const GetGitHubProfile = async (token) => {
    const spinner = createSpinner('Fetching GitHub user profile...').start();
    try {
        if (!fs.existsSync(jsonFile)) {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `token ${token}`,
                }
            });
            const { login } = res.data;
            let data = res.data;
            data = { ...data, timeStamped: new Date().toISOString() };
            fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
            if (fs.existsSync(env)) {
                const file = fs.readFileSync(env, 'utf-8');
                const updated = file + `\nusername=${login}`;
                fs.writeFileSync(env, updated);
            }

            spinner.success({ text: `🎉 Welcome ${login}!` });
            return true;
        }
        else {

            await delay(500);
            const fileContent = fs.readFileSync(jsonFile, 'utf-8');
            let file = JSON.parse(fileContent);
            file = { ...file, timeStamped: new Date().toISOString() }
            fs.writeFileSync(jsonFile, JSON.stringify(file, null, 2));
            const { login } = file;
            spinner.success({ text: `🎉 Welcomeback ${login}!` });
            return true;
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        spinner.error({ text: `Failed to fetch profile: ${errMsg}` });
    }
    return false;
};

export default GetGitHubProfile;
