import { execa } from 'execa'
import handleError from '../tools/handleError.js'
import type { recoverOptions } from '../types/recover.js'
import { log, select } from '@clack/prompts'

class glcRecoverManager {
    private defaults: recoverOptions = {
        interactive: false,
        all: false,
        dryRun: false,
    }

    public async run(options: recoverOptions): Promise<void> {
        const finalOptions: recoverOptions = { ...this.defaults, ...options }
        try {
            await this.validateOptions(finalOptions)
        } catch (error) {
            handleError(error, false)
        }
    }

    private async validateOptions(options: recoverOptions) {
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

    private async handleAction(
        action: keyof recoverOptions,
        options: recoverOptions
    ) {
        switch (action) {
            case 'interactive':
                await this.recoverInteractive()
                break
            case 'all':
                await this.recoverAll()
                break
            case 'files':
                await this.recoverFiles(options.files || [])
                break
            default:
                throw new Error('Invalid recovery option specified.')
        }
    }

    private async recoverInteractive() {
        try {
            const { stdout } = await execa('git', ['reflog', '-n', '10'])
            if (!stdout) {
                throw new Error('No recent git activity found to recover from.')
            }
            log.info(`Recent activity:\n${stdout}`)
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
        } catch (error) {
            handleError(error, false)
        }
    }

    private async recoverAll() {
        try {
            await execa('git', ['reset', '--hard', 'HEAD@{1}'])
            console.log('Successfully recovered to previous state.')
        } catch (error) {
            handleError(error, true)
        }
    }
    private async recoverFiles(files: string[]) {
        try {
            await execa('git', ['checkout', 'HEAD', '--', ...files])
            console.log(`Recovered files: ${files.join(', ')}`)
        } catch (error) {
            handleError(error, true)
        }
    }
}

export default glcRecoverManager
