import { confirm, intro, log, outro, select, text } from '@clack/prompts'
import type {
    branch,
    branchMap,
    branchOption,
    branchtype,
} from '../types/branch.js'
import handleError from '../tools/handleError.js'
import { execa } from 'execa'
import verboseLog from '../tools/verbose.js'

/**
 * Class to manage Git branch operations.
 * Supports creating, renaming, switching, deleting, and listing branches.
 * Utilizes user prompts for interactive operations when needed.
 * Handles errors gracefully and provides verbose logging.
 * 
 * @class glcBranchManager
 * @public run
 * 
 * @method determineAction
 * @method handleAction
 * @method list
 * @method create
 * @method rename
 * @method delete
 * @method switch
 * @method promptToUserForAction
 * @method getBranchNameFromUser
 * @method confirmationToUser

 */

class glcBranchManager {
    private verbose: boolean = false

    /**
     * Run the branch manager with the provided options.
     *
     * @param options branchOption
     * @returns  Promise<void>
     */

    public async run(options: branchOption): Promise<void> {
        intro('Git Branch Management')
        const { verbose = false, list = false, ...args } = options
        this.verbose = verbose

        if (list) {
            verboseLog('Listing branches ....', this.verbose)
            await this.list()
            outro('Branch listing completed.')
            return
        }

        try {
            verboseLog('Processing branch operation ....', this.verbose)
            const action = await this.determineAction(args)
            if (action) {
                verboseLog(`Handling action: ${action.name} ....`, this.verbose)
                await this.handleAction(action)
            }
            outro('Branch operation completed.')
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Determine the branch action to perform based on provided options or user input.
     *
     * @param options branchMap
     * @returns Promise<branch | void>
     */

    private async determineAction(options: branchMap): Promise<branch | void> {
        if (!options || Object.keys(options).length === 0) {
            verboseLog(
                'No branch options provided, prompting user for action...',
                this.verbose
            )

            // Prompt user for action
            const actionInput = await this.promptToUserForAction()
            if (actionInput === 'list') {
                await this.list()
                return
            }

            // Prompt, get branch name
            const branchName = await this.getBranchNameFromUser(
                `Enter the branch name to ${actionInput}:`
            )

            return {
                name: actionInput,
                value: branchName,
            } as branch
        }

        verboseLog(
            'Branch options provided, determining action...',
            this.verbose
        )

        //  Filter out undefined options
        const optionList = Object.entries(options).filter(
            ([_, value]) => value !== undefined
        )

        if (optionList.length > 1) {
            log.warn(
                'Multiple actions provided. Please provide only one action at a time. First action will be considered.'
            )
            // Confirm with user to proceed with first action
            const shouldProceed = await this.confirmationToUser(
                'Do you want to proceed with the first action?'
            )
            // If user declines, exit
            if (!shouldProceed) {
                outro('Operation cancelled by the user.')
                return
            }
        }

        /**
         * Extract action and value from the first option
         */
        const action = optionList.map(([key, _]) => key)[0]
        const value = optionList.map(([_, value]) => value)[0]

        return {
            name: action,
            value: value,
        } as branch
    }

    /**
     * Handle the specified branch action.
     *
     * @param action branch
     * @returns Promise<void>
     *
     */

    private async handleAction(action: branch): Promise<void> {
        // Execute the appropriate method based on action name
        switch (action.name) {
            case 'create':
                await this.create(action.value)
                break
            case 'rename':
                await this.rename(action.value)
                break
            case 'switch':
                await this.switch(action.value)
                break
            case 'delete':
                await this.delete(action.value)
                break
            case 'rebase':
                await this.rebase(action.value)
                break
            default:
                throw new Error('Invalid branch action.')
        }
    }

    /**
     * List all branches in the repository.
     *
     * @returns Promise<void>
     */

    private async list(): Promise<void> {
        try {
            verboseLog('Executing git branch command...', this.verbose)
            const { stdout } = await execa('git', ['branch', '-a'])

            // Parse and format branch list
            const branches = stdout
                .split('\n')
                .filter((branch) => branch.trim())
            const localBranches: string[] = []
            const remoteBranches: string[] = []
            let currentBranch = ''

            branches.forEach((branch) => {
                const trimmedBranch = branch.trim()
                if (trimmedBranch.startsWith('* ')) {
                    currentBranch = trimmedBranch.substring(2)
                    localBranches.push(trimmedBranch)
                } else if (trimmedBranch.startsWith('remotes/')) {
                    remoteBranches.push(trimmedBranch)
                } else if (trimmedBranch) {
                    localBranches.push(`  ${trimmedBranch}`)
                }
            })

            log.info('Branch Overview:')
            console.log()

            if (currentBranch) {
                log.success(`Current Branch: ${currentBranch}`)
                console.log()
            }

            if (localBranches.length > 0) {
                log.info('Local Branches:')
                localBranches.forEach((branch) => {
                    if (branch.startsWith('* ')) {
                        console.log(`   ${branch}`)
                    } else {
                        console.log(`   ${branch}`)
                    }
                })
                console.log()
            }

            if (remoteBranches.length > 0) {
                log.info('Remote Branches:')
                remoteBranches.forEach((branch) => {
                    console.log(`   ${branch.replace('remotes/', '')}`)
                })
            }
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Create a new branch with the specified name.
     *
     * @param branchName string
     * @returns Promise<void>
     */

    private async create(branchName: string): Promise<void> {
        try {
            verboseLog(`Creating branch ${branchName} ....`, this.verbose)
            await execa('git', ['branch', branchName])
            console.log(`Branch '${branchName}' created successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Rename the current branch to the specified name.
     *
     * @param branchName string
     * @returns Promise<void>
     */

    private async rename(branchName: string): Promise<void> {
        try {
            verboseLog(
                `Renaming current branch to ${branchName} ....`,
                this.verbose
            )
            await execa('git', ['branch', '-m', branchName])
            console.log(`Branch renamed to '${branchName}' successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Delete the specified branch.
     *
     * @param branchName string
     * @returns Promise<void>
     */
    private async delete(branchName: string): Promise<void> {
        try {
            verboseLog(`Deleting branch ${branchName} ....`, this.verbose)
            const currentBranch = await this.getCurrentBranchName()

            if (currentBranch === branchName) {
                log.error(
                    `Cannot delete '${branchName}' because you are currently on it.`
                )
                log.info(
                    `Suggestion: Switch to another branch first using "glc switch".`
                )
                return
            }

            await execa('git', ['branch', '-d', branchName])

            log.info(`Branch '${branchName}' deleted successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Rebase current branch onto the specified base branch.
     *
     * @param baseBranch string - The branch to rebase onto
     * @returns Promise<void>
     */
    private async rebase(baseBranch: string): Promise<void> {
        try {
            const currentBranch = await this.getCurrentBranchName()

            if (currentBranch === baseBranch) {
                log.error(`Cannot rebase '${currentBranch}' onto itself.`)
                return
            }

            verboseLog(
                `Rebasing '${currentBranch}' onto '${baseBranch}' ....`,
                this.verbose
            )

            // Check if the base branch exists
            try {
                await execa('git', ['rev-parse', '--verify', baseBranch])
            } catch {
                log.error(`Branch '${baseBranch}' does not exist.`)
                return
            }

            // Check for uncommitted changes
            const { stdout: status } = await execa('git', [
                'status',
                '--porcelain',
            ])
            if (status.trim()) {
                log.warn('You have uncommitted changes.')
                const shouldStash = await this.confirmationToUser(
                    'Would you like to stash your changes before rebasing?'
                )
                if (shouldStash) {
                    await execa('git', [
                        'stash',
                        'push',
                        '-m',
                        `Auto-stash before rebasing onto ${baseBranch}`,
                    ])
                    log.info('Changes stashed successfully.')
                } else {
                    log.error(
                        'Rebase cancelled. Please commit or stash your changes first.'
                    )
                    return
                }
            }

            // Perform the rebase
            await execa('git', ['rebase', baseBranch])
            log.info(
                `Successfully rebased '${currentBranch}' onto '${baseBranch}'.`
            )

            // If we stashed changes, ask if user wants to pop them
            if (status.trim()) {
                const shouldPop = await this.confirmationToUser(
                    'Would you like to restore your stashed changes?'
                )
                if (shouldPop) {
                    try {
                        await execa('git', ['stash', 'pop'])
                        log.info('Stashed changes restored successfully.')
                    } catch {
                        log.warn(
                            'Could not restore stashed changes automatically. You can restore them manually with: git stash pop'
                        )
                    }
                }
            }
        } catch (error) {
            log.error(
                'Rebase failed. You may need to resolve conflicts manually.'
            )
            log.info('Use the following commands to resolve conflicts:')
            log.info('  1. Edit conflicted files')
            log.info('  2. git add <resolved-files>')
            log.info('  3. git rebase --continue')
            log.info('  Or abort the rebase with: git rebase --abort')
            handleError(error, this.verbose)
        }
    }

    private async getCurrentBranchName(): Promise<string> {
        try {
            const { stdout: currentBranch } = await execa('git', [
                'branch',
                '--show-current',
            ])
            return currentBranch.trim()
        } catch (error) {
            handleError(error, this.verbose)
            return ''
        }
    }
    /**
     * Switch to the specified branch.
     *
     * @param branchName string
     * @returns Promise<void>
     */

    private async switch(branchName: string): Promise<void> {
        try {
            const currentBranch = await this.getCurrentBranchName()

            if (currentBranch === branchName) {
                log.error(`your are already on '${branchName}'.`)
                log.info(
                    `Suggestion: Switch to another branch first using "glc switch".`
                )
                return
            }

            verboseLog(`Switching to branch ${branchName} ....`, this.verbose)
            await execa('git', ['checkout', branchName])
            log.info(`Switched to branch '${branchName}' successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    /**
     * Prompt the user to select a branch action.
     *
     * @returns Promise<branchtype>
     */

    private async promptToUserForAction(): Promise<branchtype> {
        const input = await select({
            message: 'Select an option:',
            options: [
                { value: 'list', label: 'List Branches' },
                { value: 'create', label: 'Create Branch' },
                { value: 'rename', label: 'Rename Branch' },
                { value: 'switch', label: 'Switch Branch' },
                { value: 'delete', label: 'Delete Branch' },
                { value: 'rebase', label: 'Rebase Branch' },
            ],
        })

        if (typeof input === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof input !== 'string') {
            throw new Error('Invalid input provided.')
        }
        return input as branchtype
    }

    /**
     * Get branch name from user with a prompt.
     *
     *  @param message string
     * @returns Promise<string>
     */

    private async getBranchNameFromUser(message: string): Promise<string> {
        const input = await text({
            message,
            validate: (value) => {
                if (value.length === 0) {
                    return 'Branch name cannot be empty.'
                }
                return undefined
            },
        })
        if (typeof input === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof input !== 'string' || input.length === 0) {
            throw new Error('Invalid branch name provided.')
        }
        return input
    }

    /**
     * Prompt the user for confirmation.
     *
     * @param message string
     * @returns Promise<boolean>
     */

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

export default glcBranchManager
