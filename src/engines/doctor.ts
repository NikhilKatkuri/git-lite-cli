import { intro, outro, log, spinner, confirm } from '@clack/prompts'
import { execa } from 'execa'
import { readdir, stat, readFile, access, constants } from 'fs/promises'
import { join, resolve } from 'path'
import verboseLog from '../tools/verbose.js'
import handleError from '../tools/handleError.js'
import gate from '../tools/gate.js'

interface DoctorOptions {
    fix?: boolean
    detailed?: boolean
    verbose?: boolean
}

interface HealthIssue {
    type: 'error' | 'warning' | 'info'
    category: string
    title: string
    description: string
    guidance?: string
    fixable?: boolean
    severity: 'high' | 'medium' | 'low'
}

interface HealthReport {
    issues: HealthIssue[]
    score: number
    summary: string
}

/**
 * glcDoctorManager class to handle comprehensive repository health checks
 * Performs diagnostics and provides human-readable guidance
 */

class glcDoctorManager {
    private verbose: boolean = false
    private detailed: boolean = false
    private autoFix: boolean = false
    private rootPath: string = ''

    public async run(options: DoctorOptions = {}): Promise<void> {
        intro('Repository Health Check')

        this.verbose = options.verbose || false
        this.detailed = options.detailed || false
        this.autoFix = options.fix || false

        verboseLog('Starting comprehensive health analysis...', this.verbose)

        try {
            const s = spinner()
            s.start('Analyzing repository health...')

            const report = await this.performHealthCheck()

            s.stop()

            await this.displayReport(report)

            if (this.autoFix) {
                await this.applyFixes(report)
            }

            outro(this.getOutroMessage(report))
        } catch (error) {
            handleError(error, this.verbose)
        }
    }

    private async performHealthCheck(): Promise<HealthReport> {
        const issues: HealthIssue[] = []

        verboseLog('Checking git environment...', this.verbose)
        await this.checkGitEnvironment(issues)

        verboseLog('Checking repository integrity...', this.verbose)
        await this.checkRepositoryIntegrity(issues)

        verboseLog('Checking authentication state...', this.verbose)
        await this.checkAuthenticationState(issues)

        verboseLog('Checking remote connectivity...', this.verbose)
        await this.checkRemoteConnectivity(issues)

        verboseLog('Checking for large files...', this.verbose)
        await this.checkLargeFiles(issues)

        verboseLog('Checking git hooks...', this.verbose)
        await this.checkGitHooks(issues)

        verboseLog('Checking for unused branches...', this.verbose)
        await this.checkUnusedBranches(issues)

        verboseLog('Checking common misconfigurations...', this.verbose)
        await this.checkCommonMisconfigurations(issues)

        verboseLog('Checking binary files...', this.verbose)
        await this.checkBinaryFiles(issues)

        const score = this.calculateHealthScore(issues)
        const summary = this.generateSummary(issues, score)

        return { issues, score, summary }
    }

    private async getRootPath(): Promise<string> {
        if (this.rootPath) {
            return this.rootPath
        }

        try {
            const { stdout } = await execa('git', [
                'rev-parse',
                '--show-toplevel',
            ])
            this.rootPath = stdout.trim()
            return this.rootPath
        } catch (error) {
            throw new Error('Not a git repository')
        }
    }

    private async checkGitEnvironment(issues: HealthIssue[]): Promise<void> {
        try {
            // Check if git is available
            await execa('git', ['--version'])

            // Check if cwd in a git repository
            const isGitRepo = await gate(false)
            if (!isGitRepo) {
                issues.push({
                    type: 'error',
                    category: 'Git Environment',
                    title: 'Not a Git Repository',
                    description: 'Current directory is not a git repository',
                    guidance:
                        'Run "git init" to initialize a new repository or navigate to an existing one',
                    severity: 'high',
                })
                return
            }

            // Check git config
            try {
                await execa('git', ['config', 'user.name'])
                await execa('git', ['config', 'user.email'])
            } catch (error) {
                issues.push({
                    type: 'warning',
                    category: 'Git Environment',
                    title: 'Git User Not Configured',
                    description: 'Git user name or email is not set',
                    guidance:
                        'Configure with: git config --global user.name "Your Name" and git config --global user.email "your@email.com"',
                    fixable: true,
                    severity: 'medium',
                })
            }
        } catch (error) {
            issues.push({
                type: 'error',
                category: 'Git Environment',
                title: 'Git Not Available',
                description: 'Git is not installed or not in PATH',
                guidance: 'Install Git from https://git-scm.com/downloads',
                severity: 'high',
            })
        }
    }

    private async checkRepositoryIntegrity(
        issues: HealthIssue[]
    ): Promise<void> {
        try {
            // Check for repository corruption
            await execa('git', ['fsck', '--no-progress'], { stdio: 'pipe' })

            // Check if HEAD is valid
            try {
                await execa('git', ['rev-parse', 'HEAD'])
            } catch (error) {
                issues.push({
                    type: 'warning',
                    category: 'Repository Integrity',
                    title: 'No Commits Found',
                    description: 'Repository has no commits (empty repository)',
                    guidance:
                        'Make your first commit with "glc save -m \'Initial commit\'"',
                    severity: 'medium',
                })
            }
        } catch (error) {
            issues.push({
                type: 'error',
                category: 'Repository Integrity',
                title: 'Repository Corruption Detected',
                description: 'Git repository integrity check failed',
                guidance:
                    'Repository may be corrupted. Consider cloning fresh copy or running "git fsck --full"',
                severity: 'high',
            })
        }
    }

    private async checkAuthenticationState(
        issues: HealthIssue[]
    ): Promise<void> {
        try {
            // Check if remote exists
            const { stdout: remotes } = await execa('git', ['remote'])
            if (!remotes.trim()) {
                issues.push({
                    type: 'info',
                    category: 'Authentication',
                    title: 'No Remote Repository',
                    description: 'Repository has no remote configured',
                    guidance:
                        'Add a remote with "git remote add origin <URL>" to enable collaboration',
                    severity: 'low',
                })
                return
            }

            // Test authentication with remote
            try {
                await execa('git', ['ls-remote', '--heads'], { timeout: 10000 })
            } catch (error) {
                issues.push({
                    type: 'warning',
                    category: 'Authentication',
                    title: 'Remote Authentication Failed',
                    description: 'Cannot authenticate with remote repository',
                    guidance:
                        'Check your credentials or use "glc auth --login" to authenticate',
                    severity: 'medium',
                })
            }
        } catch (error) {
            verboseLog(`Authentication check failed: ${error}`, this.verbose)
        }
    }

    private async checkRemoteConnectivity(
        issues: HealthIssue[]
    ): Promise<void> {
        try {
            const { stdout: remotes } = await execa('git', ['remote', '-v'])
            if (!remotes.trim()) {
                return
            }

            // Check if we can reach the remote
            try {
                await execa('git', ['ls-remote', '--heads'], { timeout: 15000 })
            } catch (error) {
                issues.push({
                    type: 'warning',
                    category: 'Remote Connectivity',
                    title: 'Cannot Reach Remote',
                    description: 'Remote repository is not accessible',
                    guidance:
                        'Check internet connection and remote URL validity',
                    severity: 'medium',
                })
            }
        } catch (error) {
            verboseLog(
                `Remote connectivity check failed: ${error}`,
                this.verbose
            )
        }
    }

    private async checkLargeFiles(issues: HealthIssue[]): Promise<void> {
        try {
            const rootPath = await this.getRootPath()
            const largeFiles = await this.findLargeFiles(
                rootPath,
                50 * 1024 * 1024
            ) // 50MB threshold

            if (largeFiles.length > 0) {
                issues.push({
                    type: 'warning',
                    category: 'Large Files',
                    title: `Found ${largeFiles.length} Large Files`,
                    description: `Files larger than 50MB detected: ${largeFiles.slice(0, 3).join(', ')}${largeFiles.length > 3 ? '...' : ''}`,
                    guidance:
                        "Consider using Git LFS for large files or add them to .gitignore if they're build artifacts",
                    severity: 'medium',
                })
            }
        } catch (error) {
            verboseLog(`Large files check failed: ${error}`, this.verbose)
        }
    }

    private async findLargeFiles(
        dirPath: string,
        threshold: number
    ): Promise<string[]> {
        const largeFiles: string[] = []

        try {
            const entries = await readdir(dirPath)

            for (const entry of entries) {
                if (entry === '.git') continue

                const fullPath = join(dirPath, entry)
                try {
                    const stats = await stat(fullPath)

                    if (stats.isDirectory()) {
                        const subFiles = await this.findLargeFiles(
                            fullPath,
                            threshold
                        )
                        largeFiles.push(...subFiles)
                    } else if (stats.isFile() && stats.size > threshold) {
                        largeFiles.push(
                            fullPath.replace(
                                (await this.getRootPath()) + '/',
                                ''
                            )
                        )
                    }
                } catch (error) {
                    // Skip inaccessible files
                    continue
                }
            }
        } catch (error) {
            // Skip inaccessible directories
        }

        return largeFiles
    }

    private async checkGitHooks(issues: HealthIssue[]): Promise<void> {
        try {
            const rootPath = await this.getRootPath()
            const hooksPath = join(rootPath, '.git', 'hooks')

            try {
                const hookFiles = await readdir(hooksPath)
                const activeHooks = hookFiles.filter(
                    (file) => !file.endsWith('.sample')
                )

                if (activeHooks.length > 0) {
                    issues.push({
                        type: 'info',
                        category: 'Git Hooks',
                        title: `${activeHooks.length} Active Git Hooks`,
                        description: `Active hooks: ${activeHooks.join(', ')}`,
                        guidance:
                            'Ensure hooks are properly configured and necessary for your workflow',
                        severity: 'low',
                    })
                }
            } catch (error) {
                // No hooks directory or can't read it
            }
        } catch (error) {
            verboseLog(`Git hooks check failed: ${error}`, this.verbose)
        }
    }

    private async checkUnusedBranches(issues: HealthIssue[]): Promise<void> {
        try {
            const { stdout: branches } = await execa('git', ['branch', '-r'])
            const remoteBranches = branches
                .split('\n')
                .filter((b) => b.trim() && !b.includes('HEAD'))

            if (remoteBranches.length > 10) {
                issues.push({
                    type: 'info',
                    category: 'Branch Management',
                    title: 'Many Remote Branches',
                    description: `Found ${remoteBranches.length} remote branches`,
                    guidance:
                        'Consider cleaning up old or merged branches to keep repository organized',
                    severity: 'low',
                })
            }

            // Check for local branches that are ahead/behind
            try {
                const { stdout: status } = await execa('git', [
                    'status',
                    '-b',
                    '--porcelain',
                ])
                if (status.includes('ahead') || status.includes('behind')) {
                    issues.push({
                        type: 'info',
                        category: 'Branch Management',
                        title: 'Branch Out of Sync',
                        description:
                            'Current branch is ahead of or behind remote',
                        guidance: 'Use "glc sync" to synchronize with remote',
                        severity: 'low',
                    })
                }
            } catch (error) {
                // Status check failed
            }
        } catch (error) {
            verboseLog(`Branch check failed: ${error}`, this.verbose)
        }
    }

    private async checkCommonMisconfigurations(
        issues: HealthIssue[]
    ): Promise<void> {
        try {
            const rootPath = await this.getRootPath()

            // Check for .gitignore
            try {
                await access(join(rootPath, '.gitignore'), constants.F_OK)
            } catch (error) {
                issues.push({
                    type: 'warning',
                    category: 'Configuration',
                    title: 'No .gitignore File',
                    description: 'Repository lacks a .gitignore file',
                    guidance:
                        'Create a .gitignore file to exclude unwanted files. Use "glc ignore" command',
                    fixable: true,
                    severity: 'medium',
                })
            }

            // Check for common files that shouldn't be tracked
            const unwantedPatterns = [
                'node_modules',
                'dist',
                'build',
                '.env',
                '.DS_Store',
            ]
            for (const pattern of unwantedPatterns) {
                try {
                    const { stdout } = await execa('git', ['ls-files'], {
                        cwd: rootPath,
                    })
                    if (stdout.includes(pattern)) {
                        issues.push({
                            type: 'warning',
                            category: 'Configuration',
                            title: `Tracking ${pattern}`,
                            description: `${pattern} files/directories are being tracked`,
                            guidance: `Add ${pattern} to .gitignore and remove from tracking`,
                            fixable: true,
                            severity: 'medium',
                        })
                    }
                } catch (error) {
                    // Skip if can't check
                }
            }
        } catch (error) {
            verboseLog(`Configuration check failed: ${error}`, this.verbose)
        }
    }

    private async checkBinaryFiles(issues: HealthIssue[]): Promise<void> {
        try {
            // Check for large binary files in git
            const { stdout } = await execa('git', ['ls-files'])
            const files = stdout.split('\n').filter((f) => f.trim())

            let binaryCount = 0
            for (const file of files.slice(0, 100)) {
                // Limit check to first 100 files
                try {
                    const content = await readFile(file, 'utf8')
                    if (content.includes('\0')) {
                        // Null byte indicates binary
                        binaryCount++
                    }
                } catch (error) {
                    // File might be binary if it can't be read as text
                    binaryCount++
                }
            }

            if (binaryCount > 10) {
                issues.push({
                    type: 'warning',
                    category: 'Binary Files',
                    title: 'Many Binary Files Tracked',
                    description: `Approximately ${binaryCount} binary files are being tracked`,
                    guidance:
                        'Consider using Git LFS for binary files to reduce repository size',
                    severity: 'medium',
                })
            }
        } catch (error) {
            verboseLog(`Binary files check failed: ${error}`, this.verbose)
        }
    }

    private calculateHealthScore(issues: HealthIssue[]): number {
        let score = 100

        for (const issue of issues) {
            switch (issue.severity) {
                case 'high':
                    score -= issue.type === 'error' ? 25 : 15
                    break
                case 'medium':
                    score -= issue.type === 'error' ? 15 : 10
                    break
                case 'low':
                    score -= 5
                    break
            }
        }

        return Math.max(0, score)
    }

    private generateSummary(issues: HealthIssue[], score: number): string {
        const errors = issues.filter((i) => i.type === 'error').length
        const warnings = issues.filter((i) => i.type === 'warning').length
        const infos = issues.filter((i) => i.type === 'info').length

        if (score >= 90) {
            return `Excellent health! ${errors + warnings + infos} minor items to review.`
        } else if (score >= 75) {
            return `Good health with ${warnings} warnings and ${errors} errors to address.`
        } else if (score >= 50) {
            return `Moderate health issues detected. ${errors} errors and ${warnings} warnings need attention.`
        } else {
            return `Poor repository health. Immediate attention required for ${errors} critical errors.`
        }
    }

    private async displayReport(report: HealthReport): Promise<void> {
        log.info(`\nHealth Score: ${report.score}/100`)
        log.info(`Summary: ${report.summary}\n`)

        if (report.issues.length === 0) {
            log.success('No issues found! Repository is in excellent health.')
            return
        }

        const errors = report.issues.filter((i) => i.type === 'error')
        const warnings = report.issues.filter((i) => i.type === 'warning')
        const infos = report.issues.filter((i) => i.type === 'info')

        if (errors.length > 0) {
            log.error(`\nErrors (${errors.length}):`)
            errors.forEach((issue) => this.displayIssue(issue))
        }

        if (warnings.length > 0) {
            log.warn(`\nWarnings (${warnings.length}):`)
            warnings.forEach((issue) => this.displayIssue(issue))
        }

        if (infos.length > 0 && this.detailed) {
            log.info(`\nInformation (${infos.length}):`)
            infos.forEach((issue) => this.displayIssue(issue))
        }
    }

    private displayIssue(issue: HealthIssue): void {
        log.info(`  ${issue.title}`)
        log.info(`    Category: ${issue.category}`)
        log.info(`    ${issue.description}`)
        if (issue.guidance) {
            log.info(`    Guidance: ${issue.guidance}`)
        }
        if (issue.fixable && this.autoFix) {
            log.info('    [Will attempt to fix automatically]')
        }
        log.info('')
    }

    private async applyFixes(report: HealthReport): Promise<void> {
        const fixableIssues = report.issues.filter((i) => i.fixable)

        if (fixableIssues.length === 0) {
            log.info('No automatically fixable issues found.')
            return
        }

        const shouldFix = await confirm({
            message: `Attempt to fix ${fixableIssues.length} issues automatically?`,
        })

        if (typeof shouldFix === 'symbol' || !shouldFix) {
            return
        }

        for (const issue of fixableIssues) {
            try {
                await this.applyFix(issue)
                log.success(`Fixed: ${issue.title}`)
            } catch (error) {
                log.error(`Failed to fix: ${issue.title}`)
                verboseLog(`Fix error: ${error}`, this.verbose)
            }
        }
    }

    private async applyFix(issue: HealthIssue): Promise<void> {
        switch (issue.title) {
            case 'Git User Not Configured':
                log.info(
                    'Please configure git user manually with git config commands'
                )
                break
            case 'No .gitignore File':
                await execa('touch', ['.gitignore'])
                break
            default:
                throw new Error('No automatic fix available')
        }
    }

    private getOutroMessage(report: HealthReport): string {
        if (report.score >= 90) {
            return 'Repository health check completed! Your repository is in excellent condition.'
        } else if (report.score >= 75) {
            return 'Repository health check completed. Address the warnings for optimal health.'
        } else if (report.score >= 50) {
            return 'Repository health check completed. Several issues need attention.'
        } else {
            return 'Repository health check completed. Critical issues detected - immediate action recommended.'
        }
    }
}

export default glcDoctorManager
