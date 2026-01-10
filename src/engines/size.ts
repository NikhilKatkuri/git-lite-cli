import { intro, outro, log, spinner } from '@clack/prompts'
import { execa } from 'execa'
import { readdir, stat } from 'fs/promises'
import { join, relative, sep } from 'path'
import verboseLog from '../tools/verbose.js'
import handleError from '../tools/handleError.js'

interface FileInfo {
    path: string
    size: number
    type: 'file' | 'directory'
    relativePath: string
}

interface SizeOptions {
    details?: boolean
    large?: string | boolean
    top?: string | boolean
    verbose?: boolean
}

interface SizeStats {
    totalSize: number
    totalFiles: number
    totalDirectories: number
    largeFiles: FileInfo[]
    topFiles: FileInfo[]
    gitSize: number
    workingTreeSize: number
}

class glcSizeManager {
    private rootPath: string = ''
    private ignorePatterns: string[] = []
    private verbose: boolean = false

    public async run(options: SizeOptions = {}): Promise<void> {
        intro('Repository Size Analysis')

        this.verbose = options.verbose || false
        const largeThreshold = this.parseSizeThreshold(options.large, 10) // Default 10MB
        const topCount = this.parseTopCount(options.top, 10) // Default top 10

        verboseLog('Starting repository size analysis...', this.verbose)

        try {
            const s = spinner()
            s.start('Analyzing repository...')

            // Get repository information
            const rootPath = await this.getRootPath()
            const gitSize = await this.getGitSize()

            verboseLog(`Repository root: ${rootPath}`, this.verbose)
            verboseLog(
                `Git directory size: ${this.formatSize(gitSize)}`,
                this.verbose
            )

            s.message('Scanning files...')
            const stats = await this.analyzeRepository(
                rootPath,
                largeThreshold,
                topCount
            )

            s.stop()

            await this.displaySummary(stats)

            if (options.details) {
                await this.displayDetails(stats)
            }

            if (stats.largeFiles.length > 0) {
                await this.displayLargeFiles(stats.largeFiles, largeThreshold)
            }

            await this.displayTopFiles(stats.topFiles)
            await this.displayRecommendations(stats, largeThreshold)

            outro('Size analysis completed!')
        } catch (error) {
            handleError(error, this.verbose)
        }
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
            throw new Error('Not a git repository or git not available')
        }
    }

    private async getGitSize(): Promise<number> {
        try {
            const gitPath = join(this.rootPath, '.git')
            return await this.getDirectorySize(gitPath)
        } catch (error) {
            verboseLog(`Could not calculate .git size: ${error}`, this.verbose)
            return 0
        }
    }

    private async analyzeRepository(
        rootPath: string,
        largeThreshold: number,
        topCount: number
    ): Promise<SizeStats> {
        const stats: SizeStats = {
            totalSize: 0,
            totalFiles: 0,
            totalDirectories: 0,
            largeFiles: [],
            topFiles: [],
            gitSize: await this.getGitSize(),
            workingTreeSize: 0,
        }

        // Get ignored patterns
        await this.loadIgnorePatterns()

        const allFiles: FileInfo[] = []

        await this.scanDirectory(rootPath, rootPath, allFiles, stats)

        // Calculate working tree size (excluding .git)
        stats.workingTreeSize = stats.totalSize

        // Sort files by size for analysis
        allFiles.sort((a, b) => b.size - a.size)

        // Identify large files
        stats.largeFiles = allFiles.filter(
            (file) =>
                file.type === 'file' && file.size > largeThreshold * 1024 * 1024
        )

        // Get top largest files
        stats.topFiles = allFiles
            .filter((file) => file.type === 'file')
            .slice(0, topCount)

        return stats
    }

    private async scanDirectory(
        dirPath: string,
        rootPath: string,
        allFiles: FileInfo[],
        stats: SizeStats
    ): Promise<void> {
        try {
            const entries = await readdir(dirPath)

            for (const entry of entries) {
                const fullPath = join(dirPath, entry)
                const relativePath = relative(rootPath, fullPath)

                if (entry === '.git' && dirPath === rootPath) {
                    continue
                }

                if (this.shouldIgnore(relativePath)) {
                    verboseLog(`Ignoring: ${relativePath}`, this.verbose)
                    continue
                }

                try {
                    const statInfo = await stat(fullPath)

                    if (statInfo.isDirectory()) {
                        stats.totalDirectories++

                        const fileInfo: FileInfo = {
                            path: fullPath,
                            size: 0,
                            type: 'directory',
                            relativePath,
                        }

                        // Recursively scan subdirectory
                        await this.scanDirectory(
                            fullPath,
                            rootPath,
                            allFiles,
                            stats
                        )

                        // Calculate directory size
                        fileInfo.size = await this.getDirectorySize(fullPath)
                        allFiles.push(fileInfo)
                    } else if (statInfo.isFile()) {
                        stats.totalFiles++
                        stats.totalSize += statInfo.size

                        const fileInfo: FileInfo = {
                            path: fullPath,
                            size: statInfo.size,
                            type: 'file',
                            relativePath,
                        }

                        allFiles.push(fileInfo)
                    }
                } catch (error) {
                    verboseLog(
                        `Error accessing ${relativePath}: ${error}`,
                        this.verbose
                    )
                }
            }
        } catch (error) {
            verboseLog(
                `Error reading directory ${dirPath}: ${error}`,
                this.verbose
            )
        }
    }

    private async loadIgnorePatterns(): Promise<void> {
        try {
            // Get git ignored files
            const { stdout } = await execa('git', [
                'ls-files',
                '--others',
                '--ignored',
                '--exclude-standard',
                '--directory',
            ])
            this.ignorePatterns = stdout
                .split('\n')
                .filter((line) => line.trim() !== '')
            verboseLog(
                `Loaded ${this.ignorePatterns.length} ignore patterns`,
                this.verbose
            )
        } catch (error) {
            verboseLog(`Could not load ignore patterns: ${error}`, this.verbose)
            this.ignorePatterns = []
        }
    }

    private shouldIgnore(relativePath: string): boolean {
        // Basic ignore patterns
        const basicIgnores = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'coverage',
            '.nyc_output',
        ]

        for (const ignore of basicIgnores) {
            if (relativePath.includes(ignore)) {
                return true
            }
        }

        // Check against git ignore patterns
        return this.ignorePatterns.some((pattern) =>
            relativePath.includes(pattern.replace(/\/$/, ''))
        )
    }

    private async getDirectorySize(dirPath: string): Promise<number> {
        try {
            let totalSize = 0
            const entries = await readdir(dirPath)

            for (const entry of entries) {
                const fullPath = join(dirPath, entry)
                try {
                    const statInfo = await stat(fullPath)

                    if (statInfo.isDirectory()) {
                        totalSize += await this.getDirectorySize(fullPath)
                    } else {
                        totalSize += statInfo.size
                    }
                } catch (error) {
                    // Skip files if not accessed
                    continue
                }
            }

            return totalSize
        } catch (error) {
            return 0
        }
    }

    private async displaySummary(stats: SizeStats): Promise<void> {
        log.info('Repository Summary')
        log.info(`   Total Files: ${stats.totalFiles.toLocaleString()}`)
        log.info(
            `   Total Directories: ${stats.totalDirectories.toLocaleString()}`
        )
        log.info(
            `   Working Tree Size: ${this.formatSize(stats.workingTreeSize)}`
        )
        log.info(`   Git Directory Size: ${this.formatSize(stats.gitSize)}`)
        log.info(
            `   Total Repository Size: ${this.formatSize(stats.workingTreeSize + stats.gitSize)}`
        )
    }

    private async displayDetails(stats: SizeStats): Promise<void> {
        log.info('\nDetailed Breakdown')

        const ratio =
            stats.gitSize > 0
                ? (stats.workingTreeSize / stats.gitSize).toFixed(2)
                : 'N/A'
        log.info(`   Working Tree to Git Ratio: ${ratio}:1`)

        if (stats.totalFiles > 0) {
            const avgFileSize = stats.workingTreeSize / stats.totalFiles
            log.info(`   Average File Size: ${this.formatSize(avgFileSize)}`)
        }
    }

    private async displayLargeFiles(
        largeFiles: FileInfo[],
        threshold: number
    ): Promise<void> {
        log.warn(`\nLarge Files (>${threshold}MB)`)

        if (largeFiles.length === 0) {
            log.success('   No large files found')
            return
        }

        largeFiles.slice(0, 20).forEach((file) => {
            const sizeStr = this.formatSize(file.size)
            const relativePath = file.relativePath
            log.warn(`   ${sizeStr.padEnd(12)} ${relativePath}`)
        })

        if (largeFiles.length > 20) {
            log.info(`   ... and ${largeFiles.length - 20} more large files`)
        }
    }

    private async displayTopFiles(topFiles: FileInfo[]): Promise<void> {
        log.info(`\nTop ${topFiles.length} Largest Files`)

        topFiles.forEach((file, index) => {
            const sizeStr = this.formatSize(file.size)
            const relativePath = file.relativePath
            const rank = `${index + 1}.`.padEnd(3)
            log.info(`   ${rank} ${sizeStr.padEnd(12)} ${relativePath}`)
        })
    }

    private async displayRecommendations(
        stats: SizeStats,
        largeThreshold: number
    ): Promise<void> {
        log.info('\nRecommendations')

        if (stats.largeFiles.length > 0) {
            log.warn(
                `   - Consider reviewing ${stats.largeFiles.length} large files (>${largeThreshold}MB)`
            )
            log.info('   - Use Git LFS for large binary files')
            log.info('   - Consider compressing or optimizing large files')
        }

        if (stats.gitSize > stats.workingTreeSize * 2) {
            log.warn('   - Git history is quite large relative to working tree')
            log.info('   - Consider git gc --aggressive to optimize')
        }

        if (stats.totalFiles > 10000) {
            log.warn('   - Repository has many files')
            log.info('   - Consider .gitignore optimization')
        }

        if (
            stats.largeFiles.length === 0 &&
            stats.gitSize < stats.workingTreeSize
        ) {
            log.success('   • Repository size looks healthy!')
        }
    }

    private parseSizeThreshold(
        value: string | boolean | undefined,
        defaultValue: number
    ): number {
        if (typeof value === 'string') {
            const parsed = parseFloat(value)
            return isNaN(parsed) ? defaultValue : parsed
        }
        return defaultValue
    }

    private parseTopCount(
        value: string | boolean | undefined,
        defaultValue: number
    ): number {
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10)
            return isNaN(parsed) ? defaultValue : parsed
        }
        return defaultValue
    }

    private formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        let size = bytes
        let unitIndex = 0

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }

        return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`
    }
}

export default glcSizeManager
