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
            console.log('\nBranches:')
            console.log(stdout)
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
            await execa('git', ['branch', '-d', branchName])
            console.log(`Branch '${branchName}' deleted successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
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
            verboseLog(`Switching to branch ${branchName} ....`, this.verbose)
            await execa('git', ['checkout', branchName])
            console.log(`Switched to branch '${branchName}' successfully.`)
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
