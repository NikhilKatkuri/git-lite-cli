import inquirer from "inquirer";
import chalk from "chalk";

async function Option() {
    const { option } = await inquirer.prompt({
        name: "option",
        type: "list",
        message: chalk.whiteBright("👉 Choose what you want to do:"),
        choices: [
            { name: "🚀 Push a repository", value: "push" },
            { name: "📥 Clone a repository", value: "clone" },
            { name: "❌ Exit", value: "exit" },
        ],
    });

    return option;
}

export default Option;
