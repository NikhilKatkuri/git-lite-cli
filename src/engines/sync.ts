import { execa } from 'execa'
import handleError from '../tools/handleError.js'
import type { synchOptions } from '../types/sync.js'
import { log, intro, outro } from '@clack/prompts'
import verboseLog from '../tools/verbose.js'

class glcSyncManager {
    private branch: string = ''
    private isUsedStash: boolean = false
    private verbose: boolean = false
    public async run(options: synchOptions) {
        intro('Git Sync Operation')

        const { verbose = false, ...args } = options
        this.verbose = verbose

        verboseLog('Starting sync operation...', this.verbose)

        try {
            // Get current branch if not provided
            if (!args.branch) {
                const { stdout } = await execa('git', [
                    'branch',
                    '--show-current',
                ])
                args.branch = stdout.trim()
            }

            if (!args.branch) {
                throw new Error(
                    'No branch found. Make sure you are in a git repository.'
                )
            }

            this.branch = args.branch
            log.info(`Using branch: ${this.branch}`)
            verboseLog(`Target branch: ${this.branch}`, this.verbose)

            await this.stash(args.noStash)
            await this.pull(args.noPull)
            await this.push(args.noPush)
            await this.popStash()

            outro('Sync operation completed successfully.')
        } catch (error) {
            outro('Sync operation failed.')
            handleError(error, verbose)
        }
    }

    private async pull(noPull: boolean = false) {
        if (noPull) {
            verboseLog('Skipping pull operation.', this.verbose)
            return
        }

        try {
            verboseLog('Pulling latest changes...', this.verbose)
            await execa('git', ['pull', '--rebase', 'origin', this.branch])
            log.success('Successfully pulled latest changes.')
        } catch (error) {
            log.error('Failed to pull changes.')
            throw error
        }
    }

    private async push(noPush: boolean = false) {
        if (noPush) {
            verboseLog('Skipping push operation.', this.verbose)
            return
        }

        try {
            verboseLog('Pushing changes...', this.verbose)
            await execa('git', ['push', 'origin', this.branch])
            log.success('Successfully pushed changes.')
        } catch (error) {
            log.error('Failed to push changes.')
            throw error
        }
    }

    private async stash(noStash: boolean = false) {
        if (noStash) {
            verboseLog('Skipping stash operation.', this.verbose)
            return
        }

        try {
            verboseLog('Checking for uncommitted changes...', this.verbose)
            const { stdout: status } = await execa('git', [
                'status',
                '--porcelain',
            ])

            if (status.trim().length > 0) {
                verboseLog('Stashing uncommitted changes...', this.verbose)
                await execa('git', [
                    'stash',
                    'push',
                    '-u',
                    '-m',
                    'GLC-auto-stash',
                ])
                this.isUsedStash = true
                log.info('Stashed uncommitted changes.')
            } else {
                verboseLog('No uncommitted changes to stash.', this.verbose)
            }
        } catch (error) {
            log.error('Failed to stash changes.')
            throw error
        }
    }

    private async popStash() {
        if (!this.isUsedStash) {
            verboseLog('No stash to pop.', this.verbose)
            return
        }

        try {
            verboseLog('Restoring stashed changes...', this.verbose)
            await execa('git', ['stash', 'pop'])
            log.success('Restored stashed changes.')
        } catch (error) {
            log.error('Failed to restore stashed changes.')
            throw error
        }
    }
}

export default glcSyncManager
