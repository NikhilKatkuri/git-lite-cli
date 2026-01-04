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

class glcBranchManager {
    private verbose: boolean = false

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

    private async determineAction(options: branchMap): Promise<branch | void> {
        if (!options) {
            verboseLog(
                'No branch options provided, prompting user for action...',
                this.verbose
            )
            const actionInput = await this.promptToUserForAction()
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
        const optionList = Object.entries(options).filter(
            ([_, value]) => value !== undefined
        )

        if (optionList.length > 1) {
            log.warn(
                'Multiple actions provided. Please provide only one action at a time. First action will be considered.'
            )
            const shouldProceed = await this.confirmationToUser(
                'Do you want to proceed with the first action?'
            )
            if (!shouldProceed) {
                outro('Operation cancelled by the user.')
                return
            }
        }

        const action = optionList.map(([key, _]) => key)[0]
        const value = optionList.map(([_, value]) => value)[0]

        return {
            name: action,
            value: value,
        } as branch
    }

    private async handleAction(action: branch): Promise<void> {
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

    private async list() {
        try {
            verboseLog('Executing git branch command...', this.verbose)
            const { stdout } = await execa('git', ['branch', '-a'])
            console.log('\nBranches:')
            console.log(stdout)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async create(branchName: string) {
        try {
            verboseLog(`Creating branch ${branchName} ....`, this.verbose)
            await execa('git', ['branch', branchName])
            console.log(`Branch '${branchName}' created successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async rename(branchName: string) {
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

    private async delete(branchName: string) {
        try {
            verboseLog(`Deleting branch ${branchName} ....`, this.verbose)
            await execa('git', ['branch', '-d', branchName])
            console.log(`Branch '${branchName}' deleted successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async switch(branchName: string) {
        try {
            verboseLog(`Switching to branch ${branchName} ....`, this.verbose)
            await execa('git', ['checkout', branchName])
            console.log(`Switched to branch '${branchName}' successfully.`)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async promptToUserForAction(): Promise<branchtype> {
        const input = await select({
            message: 'Select an option:',
            options: [
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
