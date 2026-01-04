import configStore from '../store.js'
import type { tokenData } from './auth.js'
import { confirm, intro, log, outro, text } from '@clack/prompts'
import type { createOptionMap, createOptions } from '../types/create.js'
import { basename } from 'path'
import handleError from '../tools/handleError.js'
import { request } from 'undici'
import { endPoints, verifyGhToken } from '../utils/gh-valid.js'

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
    }
    private skip = false

    private loadToken(): boolean {
        const tokenData = configStore.get(this.tokenName) as tokenData
        if (!tokenData || !tokenData.token) {
            outro('No authentication token found. Please authenticate first.')
            return false
        }
        this.token = tokenData.token
        return true
    }

    public async run(options: createOptions) {
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
            await this.cloud(isVerbose)
            outro('Repository creation process completed.')
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

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
                this.finalOptions.gitignore = await this.promptToUser(
                    'Enter a .gitignore template (or leave blank for none):',
                    '',
                    true
                )
            }

            if (this.finalOptions.license === undefined) {
                this.finalOptions.license = await this.promptToUser(
                    'Enter a license template (or leave blank for none):',
                    '',
                    true
                )
            }
        }
    }

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

        // Handle empty or undefined input
        if (input === undefined || input === null || input === '') {
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

        return input
    }

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
    private async cloud(isVerbose: boolean) {
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
                throw new Error(
                    `GitHub API request failed with status: ${response.statusCode}`
                )
            }

            log.success(
                `Repository '${this.finalOptions.name}' created successfully!`
            )
        } catch (error) {
            handleError(error, isVerbose)
        }
    }

    private getBodyData() {
        const bodyData: any = {
            name: this.finalOptions.name,
            private: this.finalOptions.private ?? false,
        }

        // Only include description if it's not empty
        if (
            this.finalOptions.description &&
            this.finalOptions.description.trim()
        ) {
            bodyData.description = this.finalOptions.description
        }

        // Only include templates if they exist and skip is false
        if (!this.skip) {
            if (
                this.finalOptions.gitignore &&
                this.finalOptions.gitignore.trim()
            ) {
                bodyData.gitignore_template = this.finalOptions.gitignore
            }
            if (this.finalOptions.license && this.finalOptions.license.trim()) {
                bodyData.license_template = this.finalOptions.license
            }
        }

        return JSON.stringify(bodyData)
    }
}
export default glcCreateManager
