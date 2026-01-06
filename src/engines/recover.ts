import { execa } from 'execa'
import handleError from '../tools/handleError.js'
import type { recoverOptions } from '../types/recover.js'
import { log, select } from '@clack/prompts'

/**
 * glcRecoverManager handles the 'glc recover' command operations.
 * Supports dry run mode to preview recovery actions before execution.
 *
 * @public run
 *
 * @method validateOptions
 * @method handleAction
 * @method recoverInteractive - Interactive recovery with reflog selection
 * @method recoverAll - Recover all changes to previous state
 * @method recoverFiles - Recover specific files
 *
 */

class glcRecoverManager {
    private defaults: recoverOptions = {
        interactive: false,
        all: false,
        dryRun: false,
    }

    /**
     *  Run the recover manager with provided options.
     * @param options recoverOptions
     * @returns Promise<void>
     */

    public async run(options: recoverOptions): Promise<void> {
        const finalOptions: recoverOptions = { ...this.defaults, ...options }
        try {
            await this.validateOptions(finalOptions)
        } catch (error) {
            handleError(error, false)
        }
    }

    /**
     *  Validate provided options for recovery.
     * @param options   recoverOptions
     * @returns Promise<void>
     */

    private async validateOptions(options: recoverOptions): Promise<void> {
        const { interactive, all, dryRun, files } = options
        if (!interactive && !all && (!files || files.length === 0)) {
            throw new Error(
                'Error: You must specify at least one of --interactive, --all, or provide specific files to recover.'
            )
        }
        if (interactive) {
            await this.handleAction('interactive', options)
            return
        }
        if (all) {
            await this.handleAction('all', options)
            return
        }
        if (files && files.length > 0) {
            await this.handleAction('files', options)
            return
        }
    }

    /**
     *  Handle specific recovery action based on user input.
     * @param action keyof recoverOptions
     * @param options recoverOptions
     * @returns Promise<void>
     */
    private async handleAction(
        action: keyof recoverOptions,
        options: recoverOptions
    ): Promise<void> {
        switch (action) {
            case 'interactive':
                await this.recoverInteractive(options)
                break
            case 'all':
                await this.recoverAll(options)
                break
            case 'files':
                await this.recoverFiles(options.files || [], options)
                break
            default:
                throw new Error('Invalid recovery option specified.')
        }
    }

    /**
     *  Interactive recovery process.
     *  @param options recoverOptions
     *  @returns Promise<void>
     */

    private async recoverInteractive(options: recoverOptions): Promise<void> {
        try {
            const { stdout } = await execa('git', ['reflog', '-n', '10'])
            if (!stdout) {
                throw new Error('No recent git activity found to recover from.')
            }
            log.info(`Recent activity:\n${stdout}`)

            if (options.dryRun) {
                log.info(
                    'DRY RUN: Would show interactive recovery options based on reflog above.'
                )
                return
            }

            log.info(
                'Please use git commands to recover specific commits based on the reflog above.'
            )

            const choices = stdout.split('\n').map((line) => {
                const hash = line.split(' ')[0]
                const message = line.substring(line.indexOf(':') + 1).trim()
                return {
                    label: `${hash} - ${message}`,
                    value: hash,
                }
            })

            const selectedHash = await select({
                message: 'Select an option to recover:',
                options: choices,
            })
            if (typeof selectedHash === 'symbol') {
                throw new Error('Recovery selection cancelled by user.')
            }
            if (!selectedHash || typeof selectedHash !== 'string') {
                throw new Error('No valid selection made for recovery.')
            }

            const recoveryBranch = `recovery-${selectedHash}`
            await execa('git', ['checkout', '-b', recoveryBranch, selectedHash])
            log.success(
                `Successfully created and switched to recovery branch: ${recoveryBranch}`
            )
        } catch (error) {
            handleError(error, false)
        }
    }

    /**
     *  Recover all changes to the previous state.
     *  @param options recoverOptions
     *  @returns Promise<void>
     */

    private async recoverAll(options: recoverOptions): Promise<void> {
        try {
            if (options.dryRun) {
                const { stdout: currentHead } = await execa('git', [
                    'rev-parse',
                    'HEAD',
                ])
                const { stdout: previousHead } = await execa('git', [
                    'rev-parse',
                    'HEAD@{1}',
                ])
                const { stdout: diff } = await execa('git', [
                    'diff',
                    '--name-only',
                    'HEAD',
                    'HEAD@{1}',
                ])

                log.info('DRY RUN: Would recover all changes to previous state')
                log.info(`Current HEAD: ${currentHead.trim()}`)
                log.info(`Previous HEAD: ${previousHead.trim()}`)

                if (diff.trim()) {
                    log.info('Files that would be affected:')
                    diff.split('\n').forEach((file) => {
                        if (file.trim()) log.info(`  - ${file}`)
                    })
                } else {
                    log.info('No files would be affected')
                }

                log.info(
                    'Command that would be executed: git reset --hard HEAD@{1}'
                )
                return
            }

            await execa('git', ['reset', '--hard', 'HEAD@{1}'])
            log.success('Successfully recovered to previous state.')
        } catch (error) {
            handleError(error, true)
        }
    }

    /**
     *  Recover specific files.
     * @param files string[]
     * @param options recoverOptions
     * @returns Promise<void>
     */
    private async recoverFiles(
        files: string[],
        options: recoverOptions
    ): Promise<void> {
        try {
            if (options.dryRun) {
                log.info('DRY RUN: Would recover the following files:')
                files.forEach((file) => log.info(`  - ${file}`))

                // Check if files exist and show their current status
                try {
                    const { stdout: status } = await execa('git', [
                        'status',
                        '--porcelain',
                        ...files,
                    ])
                    if (status.trim()) {
                        log.info('Current status of files:')
                        status.split('\n').forEach((line) => {
                            if (line.trim()) log.info(`  ${line}`)
                        })
                    }
                } catch (error) {
                    // Some files might not exist or be tracked
                    log.info(
                        'Note: Some files may not be tracked or may not exist'
                    )
                }

                log.info(
                    `Command that would be executed: git checkout HEAD -- ${files.join(' ')}`
                )
                return
            }

            await execa('git', ['checkout', 'HEAD', '--', ...files])
            log.success(`Recovered files: ${files.join(', ')}`)
        } catch (error) {
            handleError(error, true)
        }
    }
}

export default glcRecoverManager
