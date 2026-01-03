import { enableCompileCache } from 'node:module'
enableCompileCache()
import { Command } from 'commander'
import pkgJson from '../package.json' with { type: 'json' }

/**
 * Main Program Setup
 * entry point -- glc
 */

const program = new Command()
    .name(pkgJson.name)
    .description(pkgJson.description)
    .version(pkgJson.version, '-v, --version')

/**
 * Authentication Command
 * auth, whoami
 */

program
    .command('auth')
    .description('Authenticate to the git and github')
    .option('--login, -l', 'Login to your account')
    .option('--logout, -o', 'Logout from your account')
    .option('--show-all, -s', 'Show all account details')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action((options) => {
        console.log('Authenticating to the service...')
        const optionList = Object.keys(options)
        const chosenOptions = optionList[0]
        console.log(`Chosen option: ${chosenOptions}`)
    })

program
    .command('whoami')
    .description('Display the current authenticated user')
    .option('--json, -j', 'Output in JSON format')
    .action(() => {
        console.log('Fetching current user information...')
    })

/**
 * Workflow commands
 * create, save, sync, branch, clone, ignore
 */

program
    .command('create')
    .option('--name [name]', 'Name of the new repository')
    .option('--description [description]', 'Description of the repository')
    .option('--private', 'Create a private repository')
    .option('--gitignore [gitignore]', 'Add a .gitignore file')
    .option('--license [license]', 'Add a license file')
    .action((options) => {
        console.log('Creating a new repository with the following options:')
        console.log(options)
    })

/**
 * Save command with options
 * * defualt behavior is git add .
 * * Options  | orignally from git add and git commit
 * -a, --all  | git add -A && git commit -a && git commit --amend && git add --no-ignore-removal
 * -e, --exclude <files...> | git add --exclude=<files...>
 * -m, --message <message>  | git commit -m <message>
 * * below link for more details on git add from the offical documentation of git
 * * @see {@link https://git-scm.com/docs/git-add} for more details
 */

program
    .command('save')
    .option(
        '-a, --all,',
        'Stage all changes before committing (ammend,all,no-ignore-removal)'
    )
    .option(
        '-e, --exclude <files...>',
        'Files or patterns to exclude from the commit'
    )
    .option('-m, --message <message>', 'Commit message')
    .action((options) => {
        console.log('Saving changes with the following options:')
        console.log(options)
    })

/**
 * Sync command Harmonizes local and remote work.
 * note: By default, all steps are executed unless specified otherwise.
 * Options:
 * --no-stash : Skip stashing local changes.
 * --no-pull  : Skip pulling changes from the remote repository.
 * --no-push  : Skip pushing changes to the remote repository.
 * Parameters:
 * --branch [branch] : Specify the branch to sync with. Defaults to the current branch if not provided.
 * @see default branch is taken by git branch --show-current
 * * Flow:
 * 1. Stash: Temporarily move local changes aside (including untracked files).
 * 2. Pull: Fetch and rebase local commits on top of origin/<branch>.
 * 3. Push: Update the remote with new local commits.
 * 4. Pop: Restore the temporary stash if one was created.
 * * @param {string} branch - The current working branch.
 * below link for more details on git stash from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-stash}
 * below link for more details on git pull from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-pull}
 * below link for more details on git push from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-push}
 * below link for more details on git stash pop from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-stash#_git_stash_pop}
 */

program
    .command('sync')
    .option('-b, --branch [branch]')
    .option('--no-pull', 'Skip pulling changes from the remote repository')
    .option('--no-push', 'Skip pushing changes to the remote repository')
    .option('--no-stash', 'Skip stashing local changes')
    .description('Specify the branch to save changes to')
    .action(() => {})
/**
 * branch command
 * * options:
 * --list, -l : List all branches
 * --delete, -d : Delete a specified branch
 * --rename, -r <new-name> : Rename the current branch to <new-name>
 * --create, -c <branch-name> : Create a new branch with the specified name
 * --switch, -s <branch-name> : Switch to the specified branch
 * below link for more details on git branch from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-branch} for more details
 */
program.command('branch').action(() => {})

/**
 * clone command
 * * options:
 * --url <repository-url> : The URL of the repository to clone
 * --dir [directory] : Optional directory name to clone into
 * --depth <depth> : Create a shallow clone with a history truncated to the specified number of commits
 * --branch <branch> : Clone a specific branch instead of the default branch
 * --single-branch : Clone only the history leading to the tip of a single branch
 * below link for more details on git clone from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-clone} for more details
 */

program
    .command('clone')
    .option('--url <repository-url>')
    .option('--dir [directory]')
    .option('--depth <depth>')
    .option('--branch <branch>')
    .option('--single-branch')
    .action(() => {})

/**
 * ignore command
 * * options:
 * --global, -g : Apply the ignore rules globally across all repositories for the current user
 * --system, -s : Apply the ignore rules system-wide for all users on the system
 * --local, -l : Apply the ignore rules to the current repository only
 * --template <template-name> : Use a predefined template for common ignore patterns (e.g., Node, Python, Java)
 * below link for more details on gitignore from the offical documentation of git
 * @see {@link https://git-scm.com/docs/gitignore} for more details
 */
program.command('ignore').action(() => {})

/**
 * Rollback commands
 * undo, unstage, recover
 */

program.command('undo').action(() => {})
program.command('unstage').action(() => {})
program.command('recover').action(() => {})

/**
 * analysis and health commands
 * status, size, doctor
 */

program.command('status').action(() => {})
program.command('size').action(() => {})
program.command('doctor').action(() => {})

program.parse(process.argv)
