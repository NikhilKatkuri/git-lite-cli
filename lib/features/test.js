import axios from "axios";
import { flattemplates  } from "./git-ignore.js";
import chalk from "chalk";


const tester = async (name, file) => {
    if (file !== 'Vue.gitignore') {

        const url = `https://raw.githubusercontent.com/github/gitignore/main/${file}`;
        try {
            const req = await axios.get(url);
            const data = req.data;
            if (data) {
                console.log(chalk.green(`✅ SUCCESS: ${name} (${file})`));
            } else {
                console.log(chalk.red(`❌ DATA ERROR: ${name} (${file})`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ FAILED: ${name} (${file})`));
        }
    }
    else {
        console.log(chalk.green(`✅ SUCCESS: ${name} (${file}) exception `));
    }
}

const main = async () => {
    const keys = Object.keys(flattemplates);

    for (const key of keys) {
        await tester(key, flattemplates[key]);
    }

}

(async () => {
    main()
})();

