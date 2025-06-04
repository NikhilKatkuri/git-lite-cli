import axios from "axios";
import fs from "fs";
import path from "path";

import { getConfigDir } from "../dir/git-path.js";
import { tokenName } from "../lib/git-auth.js";
import simpleGit from "simple-git";
import { createSpinner } from "nanospinner";

async function GitConfigMailUsernameUpdate(token) {
    const url = `https://api.github.com/user/emails`;

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github+json"
            }
        });

        // Filter primary & verified email
        const primaryEmail = res.data.find(email => email.primary && email.verified);

        if (!primaryEmail) {
            console.error("❌ No verified primary email available.");
            return null;
        }

        return primaryEmail.email;
    } catch (error) {
        console.error("❌ Error fetching email:", error.message);
    }
}


const dir = getConfigDir();
const env = path.join(dir, '.env');




const ConfigUpdate = async () => {

    const fileContent = fs.readFileSync(env, 'utf-8');
    const matchConfig = fileContent.match(new RegExp(`configSet=([^\\n]+)`));
    const bool = matchConfig ? matchConfig[1] : false;
    
    if (bool === "false") {
        const matchuserName = fileContent.match(new RegExp(`username=([^\\n]+)`));
        const userName = matchuserName ? matchuserName[1] : "";
        
        const match = fileContent.match(new RegExp(`${tokenName}=([^\\n]+)`));
        const token = match ? match[1] : null;
        const email = await GitConfigMailUsernameUpdate(token);
        let envContent = fileContent;

        if (envContent.includes('email=')) {
            envContent = envContent.replace(/email=.*/g, `email=${email}`);
        } else {
            envContent += '\n' + `email=${email}`;
        }

        envContent = envContent.replace(/configSet=.*/g, `configSet=true`);

        const spinner = createSpinner('add config to github').start();
        const git = simpleGit();
        await git.addConfig('user.email', email, false, 'global');
        await git.addConfig('user.name', userName, false, 'global');
        spinner.success("added config email , name");
        fs.writeFileSync(env, envContent);
        return;
    }
    return;
}

export default ConfigUpdate;