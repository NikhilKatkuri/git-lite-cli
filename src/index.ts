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

program.command('create')
program.command('save')
program.command('sync')
program.command('branch')
program.command('clone')
program.command('ignore')

/**
 * Rollback commands
 * undo, unstage, recover
 */

program.command('undo')
program.command('unstage')
program.command('recover')

/**
 * analysis and health commands
 * status, size, doctor
 */

program.command('status')
program.command('size')
program.command('doctor')

program.parse(process.argv)
