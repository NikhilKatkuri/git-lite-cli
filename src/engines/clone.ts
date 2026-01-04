import { outro, text, confirm, intro } from '@clack/prompts'
import type { cloneOptions, CloneOptionsMap } from '../types/clone.js'
import { execa } from 'execa'
import handleError from '../tools/handleError.js'
import verboseLog from '../tools/verbose.js'

class glcCloneManager {
    private verbose: boolean = false
    public async run(options: cloneOptions) {
        intro('Git Clone Repository')

        try {
            if (options && options.verbose) {
                this.verbose = options.verbose
                verboseLog('Verbose mode enabled.', this.verbose)
            }

            if (options && options.url) {
                await this.performClone(options)
                return
            }

            const finalOptions: CloneOptionsMap = {
                url: '',
                dir: '',
                depth: 1,
                branch: '',
                singleBranch: false,
            }

            finalOptions.url = await this.promptToUser(
                'Enter the repository URL to clone:',
                finalOptions.url || '',
                false
            )

            finalOptions.dir = await this.getPath()

            const depthInput = await this.promptToUser(
                'Enter the clone depth (leave empty for full clone):',
                finalOptions.depth ? finalOptions.depth.toString() : '',
                true
            )

            finalOptions.depth = depthInput
                ? parseInt(depthInput, 10)
                : undefined

            const branchInput = await this.promptToUser(
                'Enter specific branch to clone (leave empty for default):',
                '',
                true
            )

            finalOptions.branch = branchInput || ''

            if (finalOptions.branch) {
                finalOptions.singleBranch = await this.confirmationToUser(
                    'Clone only the specified branch?'
                )
            }

            await this.performClone(finalOptions)
        } catch (error) {
            handleError(error, false)
        }
    }

    private async performClone(options: cloneOptions | CloneOptionsMap) {
        const gitArgs = ['clone']

        if (options.depth && options.depth > 0) {
            gitArgs.push('--depth', options.depth.toString())
            verboseLog(`Cloning with depth: ${options.depth}`, this.verbose)
        }

        if (options.branch && options.branch.trim()) {
            gitArgs.push('--branch', options.branch.trim())
            verboseLog(`Cloning branch: ${options.branch}`, this.verbose)
        }

        if (options.singleBranch) {
            gitArgs.push('--single-branch')
            verboseLog('Cloning single branch only.', this.verbose)
        }

        gitArgs.push(options.url)
        verboseLog(`Cloning URL: ${options.url}`, this.verbose)

        if (
            options.dir &&
            options.dir.trim() &&
            options.dir !== process.cwd()
        ) {
            gitArgs.push(options.dir.trim())
            verboseLog(`Cloning into directory: ${options.dir}`, this.verbose)
        }

        try {
            verboseLog(`Executing cloning ....`, this.verbose)
            const result = await execa('git', gitArgs)
            outro(
                `Repository cloned successfully to: ${options.dir || process.cwd()}`
            )
            return result
        } catch (error) {
            throw new Error(
                `Git clone failed: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    private async getPath(): Promise<string> {
        const p = await this.promptToUser(
            'Enter the directory to clone into (leave empty for default):',
            process.cwd(),
            true
        )
        return p
    }
    private async promptToUser(
        message: string,
        initialValue: string,
        allowEmpty: boolean = true
    ): Promise<string> {
        const input = await text({
            message,
            initialValue,
            validate: (value) => {
                if (value.length === 0 && !allowEmpty) {
                    return 'This field cannot be empty.'
                }

                return undefined
            },
        })

        if (typeof input === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }

        if (input === undefined || input === null || input === '') {
            if (!allowEmpty) {
                outro('No input provided.')
                throw new Error('Required input not provided.')
            }
            return ''
        }

        if (typeof input !== 'string') {
            if (!allowEmpty) {
                outro('Invalid input type.')
                throw new Error('Invalid input provided.')
            }
            return ''
        }

        return input
    }

    private async confirmationToUser(message: string): Promise<boolean> {
        const action = await confirm({ message, initialValue: false })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof action !== 'boolean') {
            outro('No input provided.')
            return false
        }
        return action
    }
}

export default glcCloneManager
