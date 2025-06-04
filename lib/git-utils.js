import inquirer from "inquirer";
import chalk from "chalk";

async function Option() {
    try {
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

    catch (err) {
        // Handling Ctrl+C / SIGINT interruption
        if (err.isTtyError) {
            console.error("❌ Terminal doesn't support prompt rendering.");
        } else {
            console.log(chalk.redBright("\n⛔ Prompt cancelled. Exiting..."));
        }
        process.exit(0);
    }
}

export default Option;
