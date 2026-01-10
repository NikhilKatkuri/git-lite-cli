import { intro, outro, log, confirm, select, spinner } from '@clack/prompts'
import gate from '../tools/gate.js'
import glcSaveManager from './save.js'
import glcSyncManager from './sync.js'
import verboseLog from '../tools/verbose.js'
import handleError from '../tools/handleError.js'

/**
 * Git Lite CLI Pilot - Automated workflow manager
 * Orchestrates save and sync operations with user verification and feedback
 */
class glcPilot {
    private verbose: boolean = false

    constructor(verbose: boolean = false) {
        this.verbose = verbose
    }

    /**
     * Main pilot workflow - guides user through save and sync process
     * @param options - Optional configuration for the pilot workflow
     * @returns Promise<void>
     */
    public static async run(options?: {
        verbose?: boolean
        autoConfirm?: boolean
        skipSave?: boolean
        skipSync?: boolean
    }): Promise<void> {
        const pilot = new glcPilot(options?.verbose || false)

        intro('Git Lite CLI Pilot - Automated Workflow')

        try {
            await pilot.executeWorkflow(options)
            outro('Pilot workflow completed successfully!')
        } catch (error) {
            handleError(error, pilot.verbose)
        }
    }

    /**
     * Execute the complete workflow with user verification
     * @param options - Workflow configuration options
     * @returns Promise<void>
     */
    private async executeWorkflow(options?: {
        autoConfirm?: boolean
        skipSave?: boolean
        skipSync?: boolean
    }): Promise<void> {
        verboseLog('Starting pilot workflow execution...', this.verbose)

        // Step 1: Verify git environment
        const isGitReady = await this.verifyGitEnvironment()
        if (!isGitReady) {
            outro(
                'Git environment verification failed. Please check your git setup.'
            )
            return
        }

        // Step 2: Plan workflow
        const workflowPlan = await this.planWorkflow(options)
        if (!workflowPlan) {
            outro('Workflow cancelled by user.')
            return
        }

        // Step 3: Execute save operation
        if (workflowPlan.includeSave) {
            const saveSuccess = await this.executeSaveOperation()
            if (!saveSuccess) {
                log.error('Save operation failed. Stopping workflow.')
                return
            }
        }

        // Step 4: Execute sync operation
        if (workflowPlan.includeSync) {
            const syncSuccess = await this.executeSyncOperation()
            if (!syncSuccess) {
                log.error('Sync operation failed.')
                return
            }
        }

        log.success('All operations completed successfully!')
    }

    /**
     * Verify git environment and repository status
     * @returns Promise<boolean> - True if environment is ready
     */
    private async verifyGitEnvironment(): Promise<boolean> {
        verboseLog('Verifying git environment...', this.verbose)

        const s = spinner()
        s.start('Checking git environment...')

        try {
            const gateResult = await gate(this.verbose)
            s.stop()

            if (typeof gateResult !== 'boolean') {
                log.error('Git not available or repository not initialized')
                return false
            }

            if (gateResult) {
                verboseLog('Repository is ready for operations', this.verbose)
                return true
            } else {
                log.warn('Git repository issues detected')
                return false
            }
        } catch (error) {
            s.stop()
            verboseLog(`Git environment check failed: ${error}`, this.verbose)
            return false
        }
    }

    /**
     * Plan the workflow based on user input or options
     * @param options - Configuration options
     * @returns Promise<WorkflowPlan | null>
     */
    private async planWorkflow(options?: {
        autoConfirm?: boolean
        skipSave?: boolean
        skipSync?: boolean
    }): Promise<{ includeSave: boolean; includeSync: boolean } | null> {
        verboseLog('Planning workflow operations...', this.verbose)

        if (options?.autoConfirm) {
            verboseLog('Auto-confirm mode enabled', this.verbose)
            return {
                includeSave: !options.skipSave,
                includeSync: !options.skipSync,
            }
        }

        const operation = await select({
            message: 'What would you like to do?',
            options: [
                {
                    value: 'both',
                    label: 'Save changes AND sync with remote',
                },
                { value: 'save', label: 'Save changes only' },
                { value: 'sync', label: 'Sync with remote only' },
                { value: 'custom', label: 'Custom workflow' },
            ],
        })

        if (typeof operation === 'symbol') {
            return null
        }

        switch (operation) {
            case 'both':
                return { includeSave: true, includeSync: true }
            case 'save':
                return { includeSave: true, includeSync: false }
            case 'sync':
                return { includeSave: false, includeSync: true }
            case 'custom':
                return await this.planCustomWorkflow()
            default:
                return null
        }
    }

    /**
     * Plan a custom workflow with granular control
     * @returns Promise<WorkflowPlan | null>
     */
    private async planCustomWorkflow(): Promise<{
        includeSave: boolean
        includeSync: boolean
    } | null> {
        const includeSave = await confirm({
            message: 'Include save operation (commit changes)?',
            initialValue: true,
        })

        if (typeof includeSave === 'symbol') {
            return null
        }

        const includeSync = await confirm({
            message: 'Include sync operation (push/pull with remote)?',
            initialValue: true,
        })

        if (typeof includeSync === 'symbol') {
            return null
        }

        return { includeSave, includeSync }
    }

    /**
     * Execute save operation with verification
     * @returns Promise<boolean> - Success status
     */
    private async executeSaveOperation(): Promise<boolean> {
        verboseLog('Executing save operation...', this.verbose)

        try {
            const saveManager = new glcSaveManager()
            await saveManager.pilot(this.verbose)

            verboseLog('Changes have been committed successfully', this.verbose)
            return true
        } catch (error) {
            log.error('Save operation failed')
            verboseLog(`Save error details: ${error}`, this.verbose)
            return false
        }
    }

    /**
     * Execute sync operation with verification
     * @returns Promise<boolean> - Success status
     */
    private async executeSyncOperation(): Promise<boolean> {
        verboseLog('Executing sync operation...', this.verbose)

        try {
            const syncManager = new glcSyncManager()
            await syncManager.pilot()

            verboseLog('Repository synchronized with remote', this.verbose)
            return true
        } catch (error) {
            log.error('Sync operation failed')
            verboseLog(`Sync error details: ${error}`, this.verbose)
            return false
        }
    }

    /**
     * Quick pilot mode - minimal prompts for experienced users
     * @param options - Configuration options
     * @returns Promise<void>
     */
    public static async quickRun(options?: {
        verbose?: boolean
        message?: string
    }): Promise<void> {
        const pilot = new glcPilot(options?.verbose || false)

        intro('Git Lite CLI Quick Pilot')

        try {
            verboseLog('Running in quick mode...', pilot.verbose)

            await pilot.executeWorkflow({ autoConfirm: true })
            outro('Quick pilot completed!')
        } catch (error) {
            handleError(error, pilot.verbose)
        }
    }

    /**
     * Dry run mode - shows what would be done without executing
     * @param options - Configuration options
     * @returns Promise<void>
     */
    public static async dryRun(options?: { verbose?: boolean }): Promise<void> {
        const pilot = new glcPilot(options?.verbose || false)

        intro('Git Lite CLI Pilot - Dry Run Mode')

        try {
            log.info('Analyzing repository state...')

            const isGitReady = await pilot.verifyGitEnvironment()
            if (!isGitReady) {
                log.warn('Git environment issues detected')
            }

            log.info('Workflow preview:')
            log.info('  1. Verify git environment')
            log.info('  2. Save operation (commit changes)')
            log.info('  3. Sync operation (push/pull)')

            verboseLog(
                'This was a dry run - no changes were made',
                pilot.verbose
            )
            outro('Dry run completed - use regular pilot to execute')
        } catch (error) {
            handleError(error, pilot.verbose)
        }
    }
}

export default glcPilot
