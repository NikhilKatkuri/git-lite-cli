import { execa } from 'execa'
import verboseLog from '../tools/verbose.js'
class glcStatusManager {
    private isVerbose: boolean = true
    constructor(isVerbose: boolean = true) {
        this.isVerbose = isVerbose
        this.status().catch((error) => {
            verboseLog(
                `Status initialization error: ${String(error)}`,
                this.isVerbose
            )
        })
    }
    public async status() {
        try {
            // Get detailed git status information
            const { stdout: status } = await execa('git', [
                'status',
                '--porcelain=v1',
            ])
            const { stdout: branch } = await execa('git', [
                'branch',
                '--show-current',
            ])
            const { stdout: remote } = await execa('git', [
                'status',
                '--branch',
                '--porcelain=v1',
            ])

            // Parse the status to create clean output
            const cleanOutput = this.formatGlcStatus(
                status,
                branch.trim(),
                remote
            )
            verboseLog(cleanOutput, this.isVerbose)
            return true
        } catch (error) {
            verboseLog(String(error), this.isVerbose)
            return false
        }
    }

    /**
     * Format git status output into a clean glc-branded view
     */
    public formatGlcStatus(
        status: string,
        branch: string,
        remoteInfo: string
    ): string {
        const lines = status.split('\n').filter((line) => line.trim())

        // Parse branch info from remote status
        const branchLine = remoteInfo.split('\n')[0]
        if (!branchLine) {
            return `On branch ${branch}\n│  \n│  Working directory clean`
        }

        let branchStatus = `On branch ${branch}`

        if (branchLine.includes('ahead')) {
            const ahead = branchLine.match(/ahead (\d+)/)
            if (ahead)
                branchStatus += `\n│  Your branch is ahead of 'origin/${branch}' by ${ahead[1]} commit${ahead[1] !== '1' ? 's' : ''}.`
        } else if (branchLine.includes('behind')) {
            const behind = branchLine.match(/behind (\d+)/)
            if (behind)
                branchStatus += `\n│  Your branch is behind 'origin/${branch}' by ${behind[1]} commit${behind[1] !== '1' ? 's' : ''}.`
        } else if (
            !branchLine.includes('ahead') &&
            !branchLine.includes('behind')
        ) {
            branchStatus += `\n│  Your branch is up to date with 'origin/${branch}'.`
        }

        if (lines.length === 0) {
            return `${branchStatus}\n│  \n│  Working directory clean`
        }

        const staged = lines.filter(
            (line) =>
                line[0] !== ' ' && line[0] !== '?' && line[0] !== undefined
        )
        const unstaged = lines.filter(
            (line) =>
                line.length >= 2 &&
                line[1] !== ' ' &&
                line[0] !== '?' &&
                line[1] !== undefined
        )
        const untracked = lines.filter((line) => line.startsWith('??'))

        let output = `${branchStatus}\n│  `

        if (staged.length > 0) {
            output += `\n│  Changes staged for commit:\n│    (use "glc undo --soft" to unstage)\n`
            staged.forEach((line) => {
                if (line.length >= 3) {
                    const file = line.substring(3)
                    const status = this.getFileStatus(line[0])
                    output += `│       ${status}:   ${file}\n`
                }
            })
            output += `│  `
        }

        if (unstaged.length > 0) {
            output += `\n│  Changes not staged for commit:\n│    (use "glc save --all" to stage and commit all changes)\n│    (use "glc recover <file>..." to discard changes in working directory)\n`
            unstaged.forEach((line) => {
                if (line.length >= 3) {
                    const file = line.substring(3)
                    const status = this.getFileStatus(line[1])
                    output += `│       ${status}:   ${file}\n`
                }
            })
            output += `│  `
        }

        if (untracked.length > 0) {
            output += `\n│  Untracked files:\n│    (use "glc save --all" to include in what will be committed)\n`
            untracked.forEach((line) => {
                if (line.length >= 3) {
                    const file = line.substring(3)
                    output += `│       ${file}\n`
                }
            })
            output += `│  `
        }

        if (
            staged.length === 0 &&
            (unstaged.length > 0 || untracked.length > 0)
        ) {
            output += `\n│  no changes added to commit (use "glc save --all -m 'message'" to stage and commit all changes)`
        } else if (staged.length > 0) {
            output += `\n│  Ready to commit (use "glc save -m 'message'" to commit staged changes)`
        }

        return output
    }

    public getFileStatus(code: string | undefined): string {
        switch (code) {
            case 'M':
                return 'modified'
            case 'A':
                return 'new file'
            case 'D':
                return 'deleted'
            case 'R':
                return 'renamed'
            case 'C':
                return 'copied'
            case 'U':
                return 'updated but unmerged'
            default:
                return 'modified'
        }
    }
}

export default glcStatusManager
