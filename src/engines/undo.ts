import { confirm, intro, log, select, outro } from '@clack/prompts'
import type { undoOptions, undoOptionsMap } from '../types/undo.js'
import handleError from '../tools/handleError.js'
import { execa } from 'execa'
import verboseLog from '../tools/verbose.js'

class glcUndoManager {
    private verbose: boolean = false
    public async run(options: undoOptions): Promise<void> {
        intro('Git Undo Manager')
        const {
            verbose = false,
            ...args
        }: { verbose?: boolean } & undoOptionsMap = options
        this.verbose = verbose
        try {
            if (Object.keys(args).length === 0 || !args) {
                await this.promptToUser()
                return
            }

            await this.determineAction(args)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async determineAction(
        options: Partial<undoOptionsMap>
    ): Promise<void> {
        const action = Object.entries(options)
        if (!action || !action.length) {
            throw new Error('No undo option provided.')
        }
        const actionFiltered = action[0]
        if (!actionFiltered) {
            throw new Error('No valid undo option provided.')
        }
        if (action.length > 1) {
            log.warn(
                'Multiple undo options provided. Please provide only one option at a time.'
            )
            const actionConfirm = await this.confirmationToUser(
                'Do you want to proceed with the first option?'
            )
            if (!actionConfirm) {
                throw new Error('Operation cancelled by the user.')
            }
        }
        await this.handleAction(actionFiltered[0])
    }
    private async handleAction(action: string): Promise<void> {
        switch (action) {
            case 'hard':
                await this.hardUndo()
                break
            case 'soft':
                await this.softUndo()
                break
            case 'ammend':
            case 'amend':
                await this.ammendUndo()
                break
            default:
                throw new Error('Invalid action for undo operation.')
        }
        log.success(`${action} undo operation completed successfully.`)
        outro('Undo operation completed.')
    }
    private async hardUndo(): Promise<void> {
        try {
            verboseLog(
                'Performing hard undo (reset --hard HEAD~1)...',
                this.verbose
            )
            const { stdout } = await execa('git', ['reset', '--hard', 'HEAD~1'])
            verboseLog(`Hard undo executed: ${stdout}`, this.verbose)
        } catch (error) {
            log.error('Failed to perform hard undo.')
            throw error
        }
    }
    private async softUndo(): Promise<void> {
        try {
            verboseLog(
                'Performing soft undo (reset --soft HEAD~1)...',
                this.verbose
            )
            const { stdout } = await execa('git', ['reset', '--soft', 'HEAD~1'])
            verboseLog(`Soft undo executed: ${stdout}`, this.verbose)
        } catch (error) {
            log.error('Failed to perform soft undo.')
            throw error
        }
    }
    private async ammendUndo(): Promise<void> {
        try {
            verboseLog(
                'Performing amend undo (reset --soft HEAD~1)...',
                this.verbose
            )
            const { stdout } = await execa('git', ['reset', '--soft', 'HEAD~1'])
            verboseLog(`Amend undo executed: ${stdout}`, this.verbose)
        } catch (error) {
            log.error('Failed to perform amend undo.')
            throw error
        }
    }

    private async promptToUser(): Promise<void> {
        const action = await select({
            message: 'Select an undo action to perform:',
            options: [
                { label: 'Hard Undo', value: 'hard' },
                { label: 'Soft Undo', value: 'soft' },
                { label: 'Amend Undo', value: 'amend' },
            ],
        })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof action !== 'string') {
            throw new Error('Invalid action selected.')
        }
        await this.handleAction(action)
    }

    private async confirmationToUser(message: string): Promise<boolean> {
        const action = await confirm({ message, initialValue: false })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof action !== 'boolean') {
            throw new Error('Invalid confirmation response.')
        }

        return action
    }
}
export default glcUndoManager
