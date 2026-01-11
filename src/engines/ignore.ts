import type { ignoreOptions } from '../types/ignore.js'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { log, select } from '@clack/prompts'
import handleError from '../tools/handleError.js'
import path from 'path'
import { request } from 'undici'
import verboseLog from '../tools/verbose.js'

/**
 * glcIgnoreManager class to handle the 'glc ignore' command.
 * Generates a .gitignore file based on selected templates.
 * @class glcIgnoreManager
 *
 * @public run
 *
 * @method run - Main method to execute the ignore file generation.
 *
 * @param options - Options for the ignore command, including template and verbosity.
 * @method getTemplateName - Prompts the user to select a template if not provided.
 * @method fetchTemplate - Fetches the .gitignore template from GitHub.
 * @method getTemplateContent - Provides local fallback templates.
 * @method applyTemplate - Writes the .gitignore file to the current directory.
 *
 */

class glcIgnoreManager {
    private verbose: boolean = false
    private TEMPLATES = {
        'Node.js': 'Node',
        React: 'Node',
        'Next.js': 'Node',
        'Vue.js': 'Node',
        Angular: 'Node',
        TypeScript: 'Node',
        Python: 'Python',
        Java: 'Java',
        Go: 'Go',
        Rust: 'Rust',
        'C++': 'C++',
        'C#': 'VisualStudio',
        Swift: 'Swift',
        Kotlin: 'Kotlin',
        Ruby: 'Ruby',
        PHP: 'PHP',
        Dart: 'Dart',
        Flutter: 'Dart',
        Unity: 'Unity',
        Android: 'Android',
        iOS: 'Swift',
        WordPress: 'WordPress',
        Laravel: 'Laravel',
        Django: 'Python',
        Rails: 'Rails',
    }

    /**
     *  Run the ignore manager with provided options.
     * @param options  - ignoreOptions
     */
    public async run(options: ignoreOptions) {
        this.verbose = options.verbose ?? false

        try {
            // If a pattern is provided, add it to .gitignore
            if (options.pattern) {
                await this.addPatternToGitignore(options.pattern)
                return
            }

            // Otherwise, handle template selection and application
            const template = options.template ?? (await this.getTemplateName())
            let templateContent = await this.fetchTemplate(template)

            // Fallback to local template if GitHub fetch failed
            if (!templateContent) {
                templateContent = this.getTemplateContent(template)
                verboseLog(`Using local template for ${template}`, this.verbose)
            }

            await this.applyTemplate(template, templateContent)
        } catch (error) {
            handleError(error, this.verbose)
        }
    }
    /**
     * Prompt user to select a template if not provided.
     * @returns promise<string>
     */

    private async getTemplateName(): Promise<string> {
        const template = await select({
            message: 'Choose one Template according to projects:',
            options: Object.keys(this.TEMPLATES).map((key) => ({
                value: key,
                label: key,
            })),
        })
        if (
            !template ||
            typeof template != 'string' ||
            typeof template === 'symbol'
        ) {
            throw new Error('No template selected.')
        }

        return template
    }

    /**
     * Add a specific pattern to .gitignore file
     * @param pattern - The pattern to add to .gitignore
     */
    private async addPatternToGitignore(pattern: string): Promise<void> {
        const gitignorePath = path.join(process.cwd(), '.gitignore')
        let gitignoreContent = ''

        // Read existing .gitignore if it exists
        if (existsSync(gitignorePath)) {
            gitignoreContent = readFileSync(gitignorePath, 'utf-8')

            // Check if pattern already exists
            if (gitignoreContent.includes(pattern)) {
                log.message(`Pattern '${pattern}' already exists in .gitignore`)
                return
            }
        }

        // Add the pattern with proper formatting
        const newContent = gitignoreContent
            ? `${gitignoreContent}\n\n# Added by glc ignore\n${pattern}\n`
            : `# Added by glc ignore\n${pattern}\n`

        writeFileSync(gitignorePath, newContent, 'utf-8')
        log.success(`Added '${pattern}' to .gitignore`)
        verboseLog(
            `Pattern '${pattern}' added to ${gitignorePath}`,
            this.verbose
        )
    }

    /**
     * Fetch .gitignore template from GitHub.
     * @param name string
     * @returns promise<string | null>
     */
    private async fetchTemplate(name: string): Promise<string | null> {
        const githubTemplateName =
            this.TEMPLATES[name as keyof typeof this.TEMPLATES] || name
        const url = `https://raw.githubusercontent.com/github/gitignore/main/${githubTemplateName}.gitignore`

        try {
            verboseLog(`Fetching template from: ${url}`, this.verbose)
            const response = await request(url, {
                headers: {
                    'User-Agent': 'GLC-NodeJS-Undici-Client',
                },
            })

            if (response.statusCode === 200) {
                const templateContent = await response.body.text()
                if (this.verbose) {
                    log.success(
                        `Successfully fetched ${name} template from GitHub`
                    )
                }
                return templateContent
            } else {
                verboseLog(
                    `Template not found on GitHub (${response.statusCode}), using local template`,
                    this.verbose
                )
                return null
            }
        } catch (error) {
            handleError(error, this.verbose)
            return null
        }
    }

    /**
     *  Get local template content as fallback.
     * @param templateName  string
     * @returns string
     */

    private getTemplateContent(templateName: string): string {
        const templates = {
            'Node.js': this.getNodeTemplate(),
            React: this.getNodeTemplate(),
            'Next.js': this.getNodeTemplate(),
            'Vue.js': this.getNodeTemplate(),
            Angular: this.getNodeTemplate(),
            TypeScript: this.getTypescriptTemplate(),
            Python: this.getPythonTemplate(),
            Java: this.getJavaTemplate(),
            Go: this.getGoTemplate(),
            Rust: this.getRustTemplate(),
            'C++': this.getCppTemplate(),
            'C#': this.getCSharpTemplate(),
            Swift: this.getSwiftTemplate(),
            Ruby: this.getRubyTemplate(),
            PHP: this.getPhpTemplate(),
            Dart: this.getDartTemplate(),
            Flutter: this.getDartTemplate(),
            node: this.getNodeTemplate(),
            python: this.getPythonTemplate(),
            typescript: this.getTypescriptTemplate(),
            generic: this.getGenericTemplate(),
        }

        const template = templates[templateName as keyof typeof templates]
        return template || this.getGenericTemplate()
    }

    /**   fallbacks  **/

    private getNodeTemplate(): string {
        return `# Dependencies
node_modules/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
    }

    private getPythonTemplate(): string {
        return `# Python
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Virtual environments
venv/
env/
ENV/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
    }

    private getTypescriptTemplate(): string {
        return `# Dependencies
node_modules/

# Compiled output
/dist/
/build/
*.js
*.js.map
*.d.ts

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
    }

    private getJavaTemplate(): string {
        return `# Java
*.class
*.log
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Package Files
target/
build/

# IDE
.idea/
*.iws
*.iml
*.ipr
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getGoTemplate(): string {
        return `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work

# Dependency directories
vendor/

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getRustTemplate(): string {
        return `# Rust
/target/
**/*.rs.bk
Cargo.lock

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getCppTemplate(): string {
        return `# C++
*.o
*.obj
*.exe
*.dll
*.so
*.dylib
*.a
*.lib

# Build directories
build/
debug/
release/

# IDE
.vs/
.vscode/
*.vcxproj.user

# OS
.DS_Store
Thumbs.db`
    }

    private getCSharpTemplate(): string {
        return `# C#
bin/
obj/
*.exe
*.dll
*.pdb
*.cache
*.suo
*.user
*.userosscache
*.sln.docstates

# IDE
.vs/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getSwiftTemplate(): string {
        return `# Swift
.DS_Store
build/
DerivedData/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata/
*.moved-aside
*.xccheckout
*.xcscmblueprint

# IDE
.vscode/

# OS
Thumbs.db`
    }

    private getRubyTemplate(): string {
        return `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/

# Bundler
vendor/bundle/

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getPhpTemplate(): string {
        return `# PHP
/vendor/
node_modules/
npm-debug.log
yarn-error.log

# Laravel specific
/bootstrap/compiled.php
/app/storage/
.env

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getDartTemplate(): string {
        return `# Dart/Flutter
.dart_tool/
.packages
build/
.pub-cache/
.pub/

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
    }

    private getGenericTemplate(): string {
        return `# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
*.log

# Environment variables
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
    }
    private async applyTemplate(
        templateName: string,
        templateContent?: string
    ) {
        try {
            const gitignoreContent = templateContent
            const gitignorePath = path.join(process.cwd(), '.gitignore')

            if (existsSync(gitignorePath)) {
                log.warn(
                    '.gitignore file already exists. Backing up the existing file...'
                )
                const backupPath = `${gitignorePath}.backup.${Date.now()}`
                const existingContent = readFileSync(gitignorePath, 'utf-8')
                writeFileSync(backupPath, existingContent)
                log.info(`Backup created: ${backupPath}`)
            }

            if (!gitignoreContent) {
                throw new Error(
                    `No content available for the ${templateName} template.`
                )
            }

            writeFileSync(gitignorePath, gitignoreContent)

            if (this.verbose) {
                log.success(
                    `Generated .gitignore file with ${templateName} template`
                )
            }
        } catch (error) {
            handleError(error, this.verbose)
        }
    }
}

export default glcIgnoreManager
