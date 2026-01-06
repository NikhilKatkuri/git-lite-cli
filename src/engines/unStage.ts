import { confirm, log, outro, select, text, intro } from '@clack/prompts'
import type { unStageOption } from '../types/unStage.js'
import handleError from '../tools/handleError.js'
import { execa } from 'execa'
import verboseLog from '../tools/verbose.js'

/**
 * unStageManager handles the 'glc unstage' command operations.
 * Supports various unstage options including all files, specific files, interactive mode, and staged files only.
 *
 * @public run
 *
 * @method unStageAll - Unstages all files
 * @method unStageFile - Unstages a specific file
 * @method unStageInteractive - Interactive unstage mode
 * @method unStageOnlyStagedFiles - Unstages only staged files
 * @method promptToUser - Prompts user for unstage options
 * @method getFileName - Gets file name input from user
 * @method confirmationToUser - Gets confirmation from user
 */

class unStageManager {
    private verbose: boolean = false

    /**
     * Run the unstage manager with provided options.
     * @param options unStageOption
     * @returns Promise<void>
     */

    public async run(options: unStageOption): Promise<void> {
        intro('Git Unstage Manager')

        const { verbose = false, ...args } = options
        this.verbose = verbose

        verboseLog('Starting unstage operation...', this.verbose)

        if (!args || !Object.keys(args).length) {
            await this.promptToUser()
            return
        }

        const arg = Object.entries(args).find(([, value]) => value)
        if (!arg) {
            await this.promptToUser()
            return
        }

        if (Object.keys(args).length > 1) {
            log.warn(
                'Multiple unstage options provided. Please provide only one option at a time.'
            )
            const action = await this.confirmationToUser(
                `Do you want to proceed with the first option? ${arg[0]}`
            )
            if (!action) {
                outro('Operation cancelled by the user.')
                return
            }
        }

        await this.boom(
            arg as [keyof Omit<unStageOption, 'verbose'>, string | boolean]
        )
    }

    /**
     *  Handle the unstage action based on user input.
     * @param arg [keyof Omit<unStageOption, 'verbose'>, string | boolean]
     * @returns Promise<void>
     */

    private async boom(
        arg: [keyof Omit<unStageOption, 'verbose'>, string | boolean]
    ): Promise<void> {
        try {
            await this.handleAction(arg)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     *  Handle specific unstage action based on user input.
     * @param action [keyof Omit<unStageOption, 'verbose'>, string | boolean]
     * @returns Promise<void>
     */

    private async handleAction(
        action: [keyof Omit<unStageOption, 'verbose'>, string | boolean]
    ): Promise<void> {
        try {
            switch (action[0]) {
                case 'all':
                    await this.unStageAll()
                    break
                case 'file':
                    await this.unStageFile(action[1] as string)
                    break
                case 'interactive':
                    await this.unStageInteractive()
                    break
                case 'staged':
                    await this.unStageOnlyStagedFiles()
                    break
                default:
                    throw new Error('Invalid unstage option provided.')
            }
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     *  Unstage all files in the git repository.
     * @returns Promise<void>
     */

    private async unStageAll(): Promise<void> {
        try {
            verboseLog('Checking for staged files...', this.verbose)
            const { stdout } = await execa('git', [
                'diff',
                '--cached',
                '--name-only',
            ])
            const files = stdout
                .split('\n')
                .filter((file) => file.trim() !== '')

            if (files.length === 0) {
                log.info('No files to unstage.')
                return
            }

            verboseLog(`Unstaging ${files.length} files...`, this.verbose)
            await execa('git', ['reset', 'HEAD', '--', ...files])
            log.success('All files have been unstaged.')
        } catch (error) {
            log.error('Failed to unstage files.')
            throw error
        }
    }

    /**
     *  Unstage a specific file.
     * @param file string
     * @returns Promise<void>
     */

    private async unStageFile(file: string): Promise<void> {
        try {
            verboseLog(`Unstaging file: ${file}...`, this.verbose)
            await execa('git', ['reset', 'HEAD', '--', file])
            log.success(`File '${file}' has been unstaged.`)
        } catch (error) {
            log.error(`Failed to unstage file: ${file}`)
            throw error
        }
    }

    /**
     *  Interactive unstage mode.
     *  @returns Promise<void>
     */

    private async unStageInteractive(): Promise<void> {
        try {
            verboseLog('Starting interactive unstage...', this.verbose)
            await execa('git', ['reset', '-p'])
            log.success('Interactive unstage completed.')
        } catch (error) {
            log.error('Interactive unstage failed.')
            throw error
        }
    }

    /**
     *  Unstage only staged files.
     * @returns Promise<void>
     */
    private async unStageOnlyStagedFiles(): Promise<void> {
        try {
            verboseLog('Checking for staged files...', this.verbose)
            const { stdout } = await execa('git', [
                'diff',
                '--cached',
                '--name-only',
            ])
            const files = stdout
                .split('\n')
                .filter((file) => file.trim() !== '')
            if (files.length === 0) {
                log.info('No staged files to unstage.')
                return
            }

            verboseLog(
                `Unstaging ${files.length} staged files...`,
                this.verbose
            )
            await execa('git', ['reset', 'HEAD', '--', ...files])
            log.success('Staged files have been unstaged.')
        } catch (error) {
            log.error('Failed to unstage staged files.')
            throw error
        }
    }

    /**
     *  Prompt user for unstage options.
     * @returns Promise<string>
     */

    private async promptToUser(): Promise<string> {
        const action = await select({
            message: 'Select an unstage option:',
            options: [
                { label: 'Unstage All Files', value: 'all' },
                { label: 'Unstage Specific File', value: 'file' },
                { label: 'Unstage Only Staged Files', value: 'staged' },
                { label: 'Interactive Unstage', value: 'interactive' },
            ],
        })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }

        if (!action) {
            throw new Error('Invalid input provided.')
        }
        let fileName: string = ''
        if (action === 'file') {
            fileName = await this.getFileName()
        }
        await this.boom([
            action as keyof Omit<unStageOption, 'verbose'>,
            fileName,
        ])
        outro('Unstage operation completed.')
        return action
    }

    /**
     *  Get file name input from user.
     * @param action string
     * @returns Promise<string>
     */

    private async getFileName(): Promise<string> {
        const fileName = await text({
            message: 'Enter the file name to unstage:',
            validate: (value) => {
                if (value.length === 0) {
                    return 'File name cannot be empty.'
                }
                return undefined
            },
        })
        if (typeof fileName === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof fileName !== 'string' || fileName.length === 0) {
            throw new Error('Invalid file name provided.')
        }
        return fileName
    }

    /**
     * Get confirmation from user.
     * @param message  string
     * @returns Promise<boolean>
     */

    private async confirmationToUser(message: string): Promise<boolean> {
        const action = await confirm({ message, initialValue: false })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof action !== 'boolean') {
            throw new Error('Invalid input provided.')
        }
        return action
    }
}

export default unStageManager
