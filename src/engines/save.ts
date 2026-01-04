import { confirm, intro, log, outro, text } from '@clack/prompts'
import type { SaveOptionMap, SaveOptions } from '../types/save.js'
import verboseLog from '../tools/verbose.js'
import gate from '../tools/gate.js'
import { execa } from 'execa'
import handleError from '../tools/handleError.js'

/**
 * Class to manage saving changes to a git repository.
 */

class glcSaveManager {
    /**
     * Run the save operation with the provided options.
     * @param options - Save options including message, all flag, exclude list, and verbose flag.
     * @returns Promise<void>
     */

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

        // Check git availability
        const gateRes = await gate(isVerbose)
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
        // Initialize repository if needed
        await this.initRepo(toInit, isVerbose)
        verboseLog('Git repository is ready.', isVerbose)
        // Prepare and execute save actions
        await this.prepareActions(args, isVerbose)
        verboseLog('Save operation completed.', isVerbose)

        outro('Changes have been saved to the git repository.')
    }

    /**
     * Prepare and execute the save actions.
     * @param options SaveOptionMap
     * @param isVerbose  boolean
     */

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

    /**
     * Initialize a new git repository if required.
     * @param toInit  boolean
     * @param isVerbose boolean
     * @returns Promise<void>
     */

    private async initRepo(toInit: boolean, isVerbose: boolean): Promise<void> {
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
    /**
     * Stage files to the git repository.
     * @param allFlag boolean
     * @param isVerbose boolean
     * @returns Promise<void>
     */

    private async all(allFlag: boolean, isVerbose: boolean): Promise<void> {
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

    /**
     * Exclude specified files from the staging area.
     * @param resetFiles string[]
     * @param isVerbose boolean
     * @returns Promise<void>
     */

    private async exclude(
        resetFiles: string[],
        isVerbose: boolean
    ): Promise<void> {
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

    /**
     * Commit staged changes to the git repository.
     * @param message string
     * @param isVerbose  boolean
     * @returns Promise<void>
     */
    private async commit(message: string, isVerbose: boolean): Promise<void> {
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

    /**
     * Prompt the user for a commit message.
     * @returns Promise<string>
     */

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
