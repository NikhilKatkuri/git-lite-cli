import { confirm, intro, log, outro, text } from '@clack/prompts'
import type {
    SaveOptionKey,
    SaveOptionMap,
    SaveOptions,
} from '../types/save.js'
import verboseLog from './verbose.js'
import gate from './gate.js'
import { execa } from 'execa'
import handleError from './handleError.js'

class glcSaveManager {
    constructor() {}
    public async run(options: SaveOptions) {
        intro('Starting save operation...')
        let toInit = false

        const defaultOptions: SaveOptions = {
            message: '',
            all: false,
            exclude: [],
            verbose: false,
        }

        options = { ...defaultOptions, ...options }

        const { verbose, ...args } = options
        const isVerbose = verbose
        verboseLog('verbose mode is enabled.', isVerbose)
        verboseLog('Preparing to save changes...', isVerbose)

        const gateRes = await gate()
        if (typeof gateRes !== 'boolean') {
            outro('Operation cancelled.')
            return
        }

        if (gateRes === false) {
            log.message('git is not installed or not found in PATH')

            const agree = await confirm({
                message: 'Do you want to initialize a new git repository?',
                initialValue: true,
            })

            if (typeof agree !== 'boolean' || !agree) {
                outro('Operation cancelled.')
                return
            }
            toInit = agree
        }
        await this.initRepo(toInit, isVerbose)
        verboseLog('Git repository is ready.', isVerbose)

        await this.prepareActions(args, isVerbose)
        verboseLog('Save operation completed.', isVerbose)

        outro('Changes have been saved to the git repository.')
    }

    private async prepareActions(
        options: SaveOptionMap,
        isVerbose: boolean
    ): Promise<void> {
        if (!options.message) {
            options.message = await this.getPromptedMessage()
        }
        verboseLog(`Using commit message: "${options.message}"`, isVerbose)
        await this.all(options.all, isVerbose)
        await this.exclude(options.exclude, isVerbose)
        await this.commit(options.message, isVerbose)
    }

    private async initRepo(toInit: boolean, isVerbose: boolean) {
        if (!toInit) {
            return
        }
        verboseLog('Initializing new git repository...', isVerbose)
        try {
            await execa('git', ['init'])
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    private async all(allFlag: boolean, isVerbose: boolean) {
        verboseLog(
            `Adding files to staging area with all flag set to ${allFlag}`,
            isVerbose
        )
        try {
            await execa('git', ['add', allFlag ? '--all' : '.'])
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    private async exclude(resetFiles: string[], isVerbose: boolean) {
        verboseLog(
            `Excluding files from staging area: ${resetFiles.join(', ')}`,
            isVerbose
        )
        if (!resetFiles || resetFiles.length === 0) return
        try {
            await execa('git', ['reset', ...resetFiles])
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    private async commit(message: string, isVerbose: boolean) {
        verboseLog(`Committing changes with message: "${message}"`, isVerbose)
        if (!message || message.trim() === '') {
            throw new Error('Commit message cannot be empty')
        }
        try {
            await execa('git', ['commit', '-m', message])
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    private async getPromptedMessage(): Promise<string> {
        const prompt = await text({
            message: 'Enter commit message:',
            placeholder: 'Commit message',
            validate: (value) => {
                if (value.trim() === '') {
                    return 'Commit message cannot be empty'
                }
                return undefined
            },
        })
        if (typeof prompt === 'symbol') {
            throw new Error('Commit message cannot be empty')
        }
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Commit message cannot be empty')
        }
        return prompt
    }
}
export default glcSaveManager
