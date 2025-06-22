//  lib\features\git-ignore.js

import chalk from "chalk"
import inquirer from "inquirer"
import fs from 'fs'
import axios from "axios"
import path from "path"


const templates = {
    "Web_Frontend": {
        "React": "Node.gitignore",
        "Vue.js": "Vue.gitignore",
        "Angular": "Angular.gitignore",
        "Svelte": "Node.gitignore",
        "Lit": "Node.gitignore",
        "Alpine.js": "Node.gitignore",
        "jQuery": "Node.gitignore",
        "Preact": "Node.gitignore",
        "Solid.js": "Node.gitignore",
        "Mithril.js": "Node.gitignore"
    },
    "Web_Fullstack": {
        "Next.js": "Nextjs.gitignore",
        "Nuxt.js": "Vue.gitignore",
        "Gatsby": "Node.gitignore",
        "Remix": "Node.gitignore",
        "Astro": "Node.gitignore"
    },
    "Backend_Frameworks": {
        "nodejs": "Node.gitignore",
        "Express.js": "Node.gitignore",
        "NestJS": "Node.gitignore",
        "Fastify": "Node.gitignore",
        "Koa.js": "Node.gitignore",
        "Hapi.js": "Node.gitignore",
        "Django (Python)": "Python.gitignore",
        "Laravel (PHP)": "Laravel.gitignore",
        "Spring Framework (Java)": "Java.gitignore"
    },
    "Mobile_Cross_Platform": {
        "React Native": "Node.gitignore",
        "Flutter (Dart)": "Flutter.gitignore",
        "Ionic": "Node.gitignore",
        "Xamarin (.NET/C#)": "VisualStudio.gitignore",
        "NativeScript": "Node.gitignore"
    },
    "Build_Tools": {
        "vite": "Node.gitignore",
        "webpack": "Node.gitignore",
        "esbuild": "Node.gitignore",
        "Rollup": "Node.gitignore",
        "Parcel": "Node.gitignore",
        "Bun": "Node.gitignore",
        "SWC": "Node.gitignore",
        "Gulp.js": "Node.gitignore",
        "Turbopack": "Node.gitignore",
        "Turborepo": "Node.gitignore"
    },
    "Desktop_Cross_Platform": {
        "Electron (JavaScript)": "Node.gitignore",
        "Tauri (Rust/Web)": "Rust.gitignore"
    }
};

// Auto-generate flat version:
export const flattemplates = Object.keys(templates).reduce((acc, category) => {
    Object.entries(templates[category]).forEach(([name, file]) => {
        acc[name] = file;
    });
    return acc;
}, {});


// templates key to choose by user
const mainKeys = Object.keys(templates).map(value => {
    return {
        name: value,
        value: value
    }
})

// reusbale component
export async function getGenerateGitignore(params) {
    const url = `https://raw.githubusercontent.com/github/gitignore/main/${params}`;
    const filepath = path.join(process.cwd(), '.gitignore');

    try {
        console.log(chalk.cyan('🚫 Generating .gitignore...'));

        // handle exception for Vue.gitignore (manual content)
        if (params === 'Vue.gitignore') {
            const vueGitIgnoreContent = `
# Vue.js
node_modules/
dist/
npm-debug.log
yarn-error.log
package-lock.json
.idea
*.iml
.nuxt
.vscode
.output

public/manifest*.json
public/sw.js
public/workbox-sw*.js*

.data
`;
            if (fs.existsSync(filepath)) {
                console.log(chalk.yellow('⚠️  .gitignore already exists — overwriting...'));
            }
            fs.writeFileSync(filepath, vueGitIgnoreContent.trim());
            console.log(`✅ .gitignore (Vue.js) written manually at ${filepath}`);
            return;
        }

        // else normal download
        const res = await axios.get(url);
        const data = res.data;

        if (fs.existsSync(filepath)) {
            console.log(chalk.yellow('⚠️  .gitignore already exists — overwriting...'));
        }
        fs.writeFileSync(filepath, data);
        console.log(`✅ .gitignore generated successfully! at ${filepath}`);

    } catch (error) {
        console.error('❌ Failed to download .gitignore:', error.message);
    }
}

// command interface
async function generateGitignore() {

    try {
        const { option } = await inquirer.prompt({
            name: "option",
            type: 'list',
            message: chalk.whiteBright('👉 Choose tech to genarate'),
            choices: [
                ...mainKeys
            ]
        })

        let ignoreGetter = Object.keys(templates[option]).map(value => {
            return {
                name: value,
                value: value
            }
        })

        const { gitignore } = await inquirer.prompt({
            name: "gitignore",
            type: 'list',
            message: chalk.whiteBright('👉 tech/framework'),
            choices: [
                ...ignoreGetter
            ]
        })
        const final = templates[option][gitignore];
        await getGenerateGitignore(final)
        process.exit(0);
        
    } catch (err) {
        // Handling Ctrl+C / SIGINT interruption
        if (err.isTtyError) {
            console.error("❌ Terminal doesn't support prompt rendering.");
        } else {
            console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
        }
        process.exit(0);
    }


}

export default generateGitignore
