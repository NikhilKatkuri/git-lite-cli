#! /usr/bin/env node

// Enable Node.js module compile cache for improved performance
import { enableCompileCache } from 'node:module'
enableCompileCache()

// imports for commander and pkgjson
import { Command } from 'commander'
import pkgJson from '../package.json' with { type: 'json' }

// Engine Managers
import AuthenticationManager from './engines/auth.js'
import glcSaveManager from './engines/save.js'
import glcCreateManager from './engines/create.js'
import glcCloneManager from './engines/clone.js'
import glcBranchManager from './engines/branch.js'
import glcSyncManager from './engines/sync.js'
import unStageManager from './engines/unStage.js'
import glcUndoManager from './engines/undo.js'
import glcIgnoreManager from './engines/ignore.js'
import glcRecoverManager from './engines/recover.js'
import glcStatusManager from './engines/status.js'
import glcSizeManager from './engines/size.js'
import glcDoctorManager from './engines/doctor.js'
import trackCommand from './boom/queue.js'
import glcPilot from './engines/pilot.js'

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

/**
 * auth command
 * options:
 * --login, -l : Login to your account
 * --logout, -o : Logout from your account
 * --show-all, -s : Show all account details
 * --verbose, -V : Output detailed authentication information
 *  @see  @link -- should be added -- @see
 */

program
    .command('auth')
    .description('Authenticate to the git and github')
    .option('--login, -l', 'Login to your account')
    .option('--logout, -o', 'Logout from your account')
    .option('--show-all, -s', 'Show all account details')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('auth', () =>
            new AuthenticationManager().run(options)
        )
    })

/**
 * whoami command
 * options:
 * --json, -j : Output in JSON format
 * @see  @link -- should be added -- @see
 */

program
    .command('whoami')
    .description('Display the current authenticated user')
    .option('--json, -j', 'Output in JSON format')
    .action(async (options) => {
        await trackCommand('whoami', () => {
            new AuthenticationManager().whoAmI(options.json ? 'json' : 'text')
        })
    })

/**
 * Workflow commands
 * create, save, sync, branch, clone, ignore
 */

/**
 * create command
 * * options:
 * --name [name] : Name of the new repository
 * --description [description] : Description of the repository
 * --private : Create a private repository
 * --gitignore [gitignore] : Add a .gitignore file
 * --license [license] : Add a license file
 * below link for more details on git init from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-init} for more details
 * @see @link -- should be added -- @see for {name, description,private,gitignore,license}
 */

program
    .command('create')
    .option('--name [name]', 'Name of the new repository')
    .option(
        '--description [description]',
        'Description of the repository, with max length of 100 characters'
    )
    .option('--private', 'Create a private repository')
    .option('--gitignore [gitignore]', 'Add a .gitignore file')
    .option('--license [license]', 'Add a license file')
    .option(
        '--skip',
        'Skip the private , gitignore and license prompts for user'
    )
    .option('--clone', 'Skip the clone process after repository creation')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('create', () => new glcCreateManager().run(options))
    })

/**
 * Save command
 *
 * Default behavior:
 * - Stages changes using `git add .`
 * - Creates a commit if a message is provided
 *
 * Options:
 * -a, --all
 *   Stages all changes (new, modified, deleted files),
 *   equivalent to `git add -A`.
 *
 * -e, --exclude <files...>
 *   Excludes specific files or patterns from being staged.
 *   (Handled internally by the tool, not a native git-add flag.)
 *
 * -m, --message <message>
 *   Commit message, equivalent to `git commit -m <message>`.
 *
 * --verbose
 *   Enables detailed output.
 *
 * below link for more details on git add from the offical documentation of git
 * @see https://git-scm.com/docs/git-add
 */

program
    .command('save')
    .option('-a, --all', 'Stages all changes (new, modified, deleted files),')
    .option(
        '-e, --exclude <files...>',
        'Files or patterns to exclude from the commit'
    )
    .option('-m, --message <message>', 'Commit message')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('save', () => new glcSaveManager().run(options))
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
    .option('--verbose, -V', 'Output detailed authentication information')
    .description('Specify the branch to save changes to')
    .action(async (options) => {
        await trackCommand('sync', () => new glcSyncManager().run(options))
    })

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

program
    .command('branch')
    .option('-l, --list', 'List all branches')
    .option('-d, --delete <branch-name>', 'Delete a specified branch')
    .option(
        '-r, --rename <new-name>',
        'Rename the current branch to <new-name>'
    )
    .option(
        '-c, --create <branch-name>',
        'Create a new branch with the specified name'
    )
    .option('-s, --switch <branch-name>', 'Switch to the specified branch')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('branch', () => new glcBranchManager().run(options))
    })

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
    .option('--no-skip', 'Skip prompts and use provided options directly')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('clone', () => new glcCloneManager().run(options))
    })

/**
 * ignore command [gitignore management]
 * below link for more details on gitignore from the offical documentation of git
 * @see {@link https://git-scm.com/docs/gitignore} for more details
 */

program
    .command('ignore [template]')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (template, options) => {
        await trackCommand('ignore', () =>
            new glcIgnoreManager().run({ template, ...options })
        )
    })

/**
 * autopilot command
 * commit and push changes automatically to current branch only
 */
program
    .command('autopilot')
    .description('Auto commit and push changes')
    .option('--verbose, -V', 'Output detailed operation information')
    .option('--dry-run, -n', 'Preview what would be done without executing')
    .action(async (options) => {
        if (options.dryRun) {
            await trackCommand('autopilot', () => glcPilot.dryRun(options))
        } else {
            await trackCommand('autopilot', () => glcPilot.quickRun(options))
        }
    })

/**
 * Rollback commands
 * undo, unstage, recover
 */

/**
 * undo command Revert the most recent commit while keeping the changes staged.
 * This allows you to make additional modifications before recommitting.
 * below link for more details on git reset --soft from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-reset#_soft} for more details
 * options:
 * --soft : Revert the last commit but keep changes staged
 * --hard : Revert the last commit and discard all changes
 * -ammend : Revert the last commit and prepare to amend it
 */

program
    .command('undo')
    .option('--soft', 'Revert the last commit but keep changes staged')
    .option('--hard', 'Revert the last commit and discard all changes')
    .option('--amend', 'Revert the last commit and prepare to amend it')
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('undo', () => new glcUndoManager().run(options))
    })
/**
 * unstage command Unstage files that have been staged for commit.
 * This command moves files from the staging area back to the working directory,
 * allowing you to modify them further before committing.
 * below link for more details on git reset from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-reset} for more details
 * options:
 * --all : Unstage all staged files
 * --file <file> : Unstage a specific file
 * --staged : Unstage only files that are currently staged
 * --interactive, -i : Interactively select hunks of files to unstage
 */

program
    .command('unstage')
    .option('--all', 'Unstage all staged files')
    .option('--file <file>', 'Unstage a specific file')
    .option('--staged', 'Unstage only files that are currently staged')
    .option(
        '-i, --interactive',
        'Interactively select hunks of files to unstage'
    )
    .option('--verbose, -V', 'Output detailed authentication information')
    .action(async (options) => {
        await trackCommand('unstage', () => new unStageManager().run(options))
    })

/**
 * recover command Restore deleted or modified files to their last committed state.
 * This command is useful for discarding unwanted changes and recovering lost work.
 * below link for more details on git checkout -- <file> from the offical documentation of git
 * @see {@link https://git-scm.com/docs/git-checkout#_} for more details
 * options:
 * --interactive, -i : Interactively select files to recover
 * --all : Recover all files in the repository
 * --dry-run, -n : Show which files would be recovered without making any changes
 */

program
    .command('recover [files...]')
    .option('-i, --interactive', 'Interactively select files to recover')
    .option('--all', 'Recover all ignored files (requires confirmation)')
    .option('-n, --dry-run', 'Preview files that would be recovered')
    .action(async (files, options) => {
        await trackCommand('recover', () =>
            new glcRecoverManager().run({ files, ...options })
        )
    })

/**
 * analysis and health commands
 * status, size, doctor
 */

/**
 * status command
 * this command displays the current status of the repository,
 * including staged, unstaged, and untracked files.
 * It provides a clean, glc-branded summary of changes and helps users understand
 * what actions need to be taken before committing.
 * Enhanced with glc-specific terminology and cleaner output formatting.
 */

program.command('status').action(async () => {
    await trackCommand('status', () => new glcStatusManager().run())
})

/**
 * size command
 * this command analyzes the repository size,
 * including the size of individual files and directories.
 * It helps users identify large files that may need to be optimized or removed
 * to reduce the overall repository size.
 * --built by glc
 */

program.command('size').action(async () => {
    await trackCommand('size', () => new glcSizeManager().run())
})

/**
 * doctor command
 * this command checks the health of the repository,
 * identifying common issues and suggesting fixes.
 * diagnostics should performed by doctor command:
 * - git binary files check
 * - glc auth state
 * - repository integrity
 * - remote repository connectivity
 * - common misconfigurations
 * - hooks status
 * - large files detection
 * - unused branches
 */

program.command('doctor').action(async () => {
    await trackCommand('doctor', () => new glcDoctorManager().run())
})

program.parse(process.argv)
