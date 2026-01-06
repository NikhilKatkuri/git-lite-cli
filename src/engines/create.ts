import configStore from '../store.js'
import type { tokenData } from '../types/auth.js'
import { confirm, intro, log, outro, text } from '@clack/prompts'
import type { createOptionMap, createOptions } from '../types/create.js'
import { basename } from 'path'
import handleError from '../tools/handleError.js'
import { request } from 'undici'
import { endPoints, verifyGhToken } from '../utils/gh-valid.js'
import glcCloneManager from './clone.js'

/**
 * Class to manage GitHub repository creation.
 * Supports creating repositories with various options.
 * Utilizes user prompts for interactive operations when needed.
 * Handles errors gracefully and provides verbose logging.
 *
 * @class glcCreateManager
 *
 * @public run
 *
 * @method setState
 * @method promptToUser
 * @method confirmationToUser
 * @method cloud
 * @method getBodyData
 */

class glcCreateManager {
    // Name of the token in the config store
    private tokenName: string = 'github_token'
    private token: string = ''
    private finalOptions: createOptionMap = {
        name: '',
        description: '',
        private: undefined,
        gitignore: undefined,
        license: undefined,
        clone: false,
    }
    private skip = false

    // Common GitHub gitignore templates (exact GitHub API names)
    private readonly commonTemplates = [
        'Node',
        'Python',
        'Java',
        'C++',
        'C',
        'CSharp',
        'Go',
        'Rust',
        'PHP',
        'Ruby',
        'Rails',
        'Swift',
        'Kotlin',
        'Scala',
        'TypeScript',
        'VisualStudio',
        'Unity',
        'Android',
        'Xcode',
        'React',
        'Vue',
        'Angular',
        'Laravel',
        'Django',
        'Flask',
        'WordPress',
    ]

    // Common GitHub license templates (exact names as used by GitHub API)
    private readonly commonLicenses = [
        'mit',
        'apache-2.0',
        'gpl-3.0',
        'gpl-2.0',
        'lgpl-3.0',
        'lgpl-2.1',
        'bsd-2-clause',
        'bsd-3-clause',
        'isc',
        'unlicense',
        'cc0-1.0',
        'mpl-2.0',
        'agpl-3.0',
        'ms-pl',
        'artistic-2.0',
    ]

    /**
     * Run the create manager with the provided options.
     *
     * @param options createOptions
     * @returns Promise<void>
     */

    public async run(options: createOptions): Promise<void> {
        intro("Let's create a new GitHub repository!")
        if (!this.loadToken()) {
            return
        }
        const { skip, verbose, ...args } = options
        this.skip = skip
        const isVerbose = verbose ?? false
        this.finalOptions = { ...this.finalOptions, ...args }
        try {
            await this.setState(this.skip)
            const url = await this.cloud(isVerbose)
            if (url) {
                log.info(`Repository URL: ${url}`)
            }
            if (this.finalOptions.clone && url) {
                const cloneManager = new glcCloneManager()
                await cloneManager.run({
                    url,
                    verbose: isVerbose,
                    dir: process.cwd(),
                })
                log.success('Repository creation process completed.')
                return
            }
            outro('Repository creation process completed.')
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    /**
     * Load the GitHub token from the config store.
     *
     * @returns  boolean
     */

    private loadToken(): boolean {
        const tokenData = configStore.get(this.tokenName) as tokenData
        if (!tokenData || !tokenData.token) {
            outro('No authentication token found. Please authenticate first.')
            return false
        }
        this.token = tokenData.token
        return true
    }

    /**
     * Set the state of the final options by prompting the user if necessary.
     *
     * @param skipFlow boolean
     */

    private async setState(skipFlow: boolean) {
        if (!this.finalOptions.name) {
            const defaultName = basename(process.cwd())
            this.finalOptions.name = await this.promptToUser(
                'Enter the repository name:',
                defaultName,
                false
            )
        }

        if (!this.finalOptions.description) {
            this.finalOptions.description = await this.promptToUser(
                'Enter the repository description (max 100 characters):',
                '',
                true
            )
        }

        if (!skipFlow) {
            if (this.finalOptions.private === undefined) {
                this.finalOptions.private = await this.confirmationToUser(
                    'Should the repository be private?'
                )
            }

            if (this.finalOptions.gitignore === undefined) {
                const gitignoreInput = await this.promptToUser(
                    'Enter a .gitignore template name (e.g., Node, Python, Java, C++, Rails) or leave blank for none:',
                    '',
                    true
                )
                this.finalOptions.gitignore =
                    this.normalizeGitignoreTemplate(gitignoreInput)
            }

            if (this.finalOptions.license === undefined) {
                const licenseInput = await this.promptToUser(
                    'Enter a license template (e.g., MIT, Apache-2.0, GPL-3.0, BSD-3-Clause) or leave blank for none:',
                    '',
                    true
                )
                this.finalOptions.license =
                    this.normalizeLicenseTemplate(licenseInput)
            }
        }
    }

    /**
     * Prompt the user for input with validation.
     *
     * @param message string
     * @param initialValue string
     * @param allowEmpty boolean
     *
     * @returns Promise<string>
     */

    private async promptToUser(
        message: string,
        initialValue: string,
        allowEmpty: boolean = true
    ): Promise<string> {
        const input = await text({
            message,
            initialValue,
            validate: (value) => {
                if (value.length === 0 && !allowEmpty) {
                    return 'This field cannot be empty.'
                }
                if (value.length > 100) {
                    return 'Input exceeds maximum length of 100 characters.'
                }
                return undefined
            },
        })

        if (typeof input === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }

        if (
            input === undefined ||
            input === null ||
            input === '' ||
            input === 'undefined'
        ) {
            if (!allowEmpty) {
                outro('No input provided.')
                throw new Error('Required input not provided.')
            }
            return ''
        }

        if (typeof input !== 'string') {
            if (!allowEmpty) {
                outro('Invalid input type.')
                throw new Error('Invalid input provided.')
            }
            return ''
        }

        // Ensure we don't return the string 'undefined'
        if (input === 'undefined') {
            return ''
        }

        return input
    }

    /**
     * Normalize license template name to match GitHub's expected format.
     *
     * @param template string
     * @returns string
     */

    private normalizeLicenseTemplate(template: string): string {
        if (!template || !template.trim()) {
            return ''
        }

        const normalizedInput = template.trim().toLowerCase()

        // Find exact match in common licenses
        const exactMatch = this.commonLicenses.find(
            (license) => license === normalizedInput
        )

        if (exactMatch) {
            return exactMatch
        }

        // Handle common variations and user-friendly names
        const licenseVariations: Record<string, string> = {
            mit: 'mit',
            apache: 'apache-2.0',
            apache2: 'apache-2.0',
            'apache 2.0': 'apache-2.0',
            'apache-2': 'apache-2.0',
            gpl: 'gpl-3.0',
            gpl3: 'gpl-3.0',
            'gpl-3': 'gpl-3.0',
            'gpl 3.0': 'gpl-3.0',
            gpl2: 'gpl-2.0',
            'gpl-2': 'gpl-2.0',
            'gpl 2.0': 'gpl-2.0',
            lgpl: 'lgpl-3.0',
            lgpl3: 'lgpl-3.0',
            'lgpl-3': 'lgpl-3.0',
            'lgpl 3.0': 'lgpl-3.0',
            bsd: 'bsd-3-clause',
            bsd3: 'bsd-3-clause',
            'bsd-3': 'bsd-3-clause',
            'bsd 3': 'bsd-3-clause',
            bsd2: 'bsd-2-clause',
            'bsd-2': 'bsd-2-clause',
            'bsd 2': 'bsd-2-clause',
            isc: 'isc',
            unlicense: 'unlicense',
            'public domain': 'unlicense',
            cc0: 'cc0-1.0',
            'creative commons': 'cc0-1.0',
            mozilla: 'mpl-2.0',
            mpl: 'mpl-2.0',
            mpl2: 'mpl-2.0',
            agpl: 'agpl-3.0',
            agpl3: 'agpl-3.0',
            microsoft: 'ms-pl',
            artistic: 'artistic-2.0',
        }

        const variation = licenseVariations[normalizedInput]
        if (variation) {
            return variation
        }

        // If no match found, return the original input in lowercase
        // GitHub API expects lowercase license identifiers
        return normalizedInput.replace(/\s+/g, '-')
    }

    /**
     * Normalize gitignore template name to match GitHub's expected format.
     *
     * @param template string
     * @returns string
     */

    private normalizeGitignoreTemplate(template: string): string {
        if (!template || !template.trim()) {
            return ''
        }

        const normalizedInput = template.trim()

        // Find exact match (case-insensitive)
        const exactMatch = this.commonTemplates.find(
            (t) => t.toLowerCase() === normalizedInput.toLowerCase()
        )

        if (exactMatch) {
            return exactMatch
        }

        // Handle common variations
        const variations: Record<string, string> = {
            nodejs: 'Node',
            'node.js': 'Node',
            javascript: 'Node',
            js: 'Node',
            typescript: 'TypeScript',
            ts: 'TypeScript',
            'c++': 'C++',
            cpp: 'C++',
            'c#': 'CSharp',
            csharp: 'CSharp',
            dotnet: 'VisualStudio',
            '.net': 'VisualStudio',
            golang: 'Go',
            rubyonrails: 'Rails',
            ror: 'Rails',
            reactjs: 'React',
            'react.js': 'React',
            vuejs: 'Vue',
            'vue.js': 'Vue',
            angularjs: 'Angular',
            ios: 'Xcode',
        }

        const variation = variations[normalizedInput.toLowerCase()]
        if (variation) {
            return variation
        }

        // Return the original input with proper capitalization
        return (
            normalizedInput.charAt(0).toUpperCase() +
            normalizedInput.slice(1).toLowerCase()
        )
    }

    /**
     * Prompt the user for confirmation.
     *
     * @param message string
     * @returns  Promise<boolean>
     */

    private async confirmationToUser(message: string): Promise<boolean> {
        const action = await confirm({ message, initialValue: false })
        if (typeof action === 'symbol') {
            throw new Error('Operation cancelled by the user.')
        }
        if (typeof action !== 'boolean') {
            outro('No input provided.')
            return false
        }
        return action
    }

    /**
     * Create the repository on GitHub using the API.
     *
     * @param isVerbose boolean
     * @returns Promise<void>
     */

    private async cloud(isVerbose: boolean): Promise<string | void> {
        try {
            const isVerified = await verifyGhToken(this.token)
            if (!isVerified || !isVerified.login) {
                outro(
                    'GitHub token verification failed. Please check your token.'
                )
                return
            }
            const response = await request(endPoints.getRepoCreate(), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'GLC-NodeJS-Undici-Client',
                },
                body: this.getBodyData(),
            })

            if (!response.statusCode || response.statusCode >= 400) {
                let errorMessage = `GitHub API request failed with status: ${response.statusCode}`
                try {
                    const errorBody = (await response.body.json()) as any
                    if (errorBody.message) {
                        errorMessage += ` - ${errorBody.message}`
                    }
                    if (errorBody.errors && Array.isArray(errorBody.errors)) {
                        const errors = errorBody.errors
                            .map((e: any) => e.message || e.code || e)
                            .join(', ')
                        errorMessage += ` (${errors})`
                    }
                } catch {
                    // If we can't parse the error body, use the original message
                }
                throw new Error(errorMessage)
            }

            const responseBody = (await response.body.json()) as any
            log.success(
                `Repository '${this.finalOptions.name}' created successfully!`
            )
            return responseBody.html_url
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    /**
     * Prepare the request body data for repository creation.
     *
     * @returns object
     */

    private getBodyData() {
        const bodyData: any = {
            name: this.finalOptions.name,
            private: this.finalOptions.private ?? false,
        }

        // Only include description if it's not empty
        if (
            this.finalOptions.description &&
            this.finalOptions.description.trim() &&
            this.finalOptions.description !== 'undefined'
        ) {
            bodyData.description = this.finalOptions.description
        }

        // Only include templates if they exist and skip is false
        if (!this.skip) {
            if (
                this.finalOptions.gitignore &&
                this.finalOptions.gitignore.trim() &&
                this.finalOptions.gitignore !== 'undefined'
            ) {
                bodyData.gitignore_template = this.finalOptions.gitignore
            }
            if (
                this.finalOptions.license &&
                this.finalOptions.license.trim() &&
                this.finalOptions.license !== 'undefined'
            ) {
                bodyData.license_template = this.finalOptions.license
            }
        }

        return JSON.stringify(bodyData)
    }
}
export default glcCreateManager
