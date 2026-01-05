import type { recoverOptions } from '../types/recover.js'

class glcRecoverManager {
    private defaults: recoverOptions = {
        interactive: false,
        all: false,
        dryRun: false,
    }
    public run(options: recoverOptions): void {
        const finalOptions: recoverOptions = { ...this.defaults, ...options }
        this.validateOptions(finalOptions)
    }
    private validateOptions(options: recoverOptions) {
        const { interactive, all, dryRun, files } = options
        if (!interactive && !all && (!files || files.length === 0)) {
            throw new Error(
                'Error: You must specify at least one of --interactive, --all, or provide specific files to recover.'
            )
        }
    }

    private determineAction(options: keyof recoverOptions) {}
}

export default glcRecoverManager
