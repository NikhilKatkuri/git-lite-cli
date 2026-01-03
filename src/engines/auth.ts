import { confirm, intro, log, outro, password, select } from '@clack/prompts'
import {
    ghValidate,
    verifyGhToken,
    type userBucket,
} from '../utils/gh-valid.js'
import configStore from '../store.js'

type options = 'showAll' | 'logout' | 'login'
type optionsRecord = Partial<Record<options | 'verbose', boolean>>

interface tokenData {
    token: string
    gh: Array<userBucket>
    created_at: string
}

class AuthenticationManager {
    private tokenName: string = 'github_token'

    public async run(options?: optionsRecord) {
        try {
            console.log('\n')
            intro('Welcome to the GitHub Authentication Login!')

            const action = await this.determineAction(options)
            if (!action) {
                outro('No Action selected')
                return
            }

            const isVerbose = options?.verbose === true
            if (isVerbose) {
                log.info('Verbose mode Enabled.')
            }
            await this.executeAction(action, isVerbose)
        } catch (error) {
            this.handleError(error, options?.verbose === true)
        }
    }

    private async determineAction(options?: optionsRecord): Promise<options> {
        if (!options || Object.keys(options).length === 0) {
            return await this.promptForAction()
        }
        const action = Object.entries(options)
            .filter(([key, value]) => key !== 'verbose' && value === true)
            .map(([key]) => key)
        if (action.length === 0) {
            return await this.promptForAction()
        }

        if (action.length > 1) {
            log.warn('Multiple actions specified. Using the First one.')
        }
        return action[0] as options
    }

    private async promptForAction(): Promise<options> {
        const action = await select({
            message: 'Select an authentication action:',
            options: [
                { value: 'login', label: 'Login to GitHub' },
                { value: 'logout', label: 'Logout from GitHub' },
                {
                    value: 'showAll',
                    label: 'Show Stored Authentication Data',
                },
            ],
        })

        if (typeof action != 'string') {
            throw new Error('Invalid action Selected')
        }
        log.info(`selected: ${action}`)
        return action
    }

    private async executeAction(action: options, isVerbose: boolean = false) {
        switch (action) {
            case 'login':
                await this.login(isVerbose)
                break
            case 'logout':
                await this.logout(isVerbose)
                break
            case 'showAll':
                await this.showAccounts(isVerbose)
                break
            default:
                throw new Error(`Unkown actions : ${action}`)
        }
    }

    private async login(isVerbose: boolean) {
        this.verboseLog('Starting login process...', isVerbose)
        if (await this.isLoggedIn()) {
            const shouldUpdate = await confirm({
                message:
                    'You are already logged in. Do you want to update your token?',
            })

            if (!shouldUpdate) {
                outro('Login cancelled.')
                return
            }
        }

        try {
            const tokenInput = await password({
                message: 'Enter your GitHub Personal Access Token (PAT):',
                validate: (value) => {
                    if (!value || typeof value != 'string')
                        return 'Token cannot be empty.'
                    if (!ghValidate(value)) return 'Invalid GitHub PAT format.'
                    return undefined
                },
            })

            if (typeof tokenInput != 'string') {
                throw new Error('Invalid Input')
            }
            this.verboseLog('GitHub PAT received from user.', isVerbose)
            this.verboseLog('Verifying GitHub token...', isVerbose)
            const token = tokenInput.trim()
            const userInfo = await this.verifyToken(token)
            this.verboseLog('GitHub token verified successfully.', isVerbose)
            this.verboseLog('Storing token data...', isVerbose)
            this.setToken(token, userInfo)
            outro('Login successful! Your token has been stored securely.')
        } catch (error) {
            this.verboseLog(
                'An error occurred during the login process.',
                isVerbose
            )
            if (
                error instanceof Error &&
                error.message.includes('verification')
            ) {
                outro(
                    'Authentication failed: Invalid token or insufficient permissions.'
                )
            } else if (
                error instanceof Error &&
                error.message.includes('network')
            ) {
                outro(
                    'Authentication failed: Network error. Please check your connection.'
                )
            } else {
                outro('Authentication failed. Please try again.')
            }
        }
    }
    private isLoggedIn(): boolean {
        return !!configStore.get(this.tokenName)
    }

    private setToken(token: string, data: userBucket): void {
        configStore.set(this.tokenName, {
            token: token,
            gh: [data],
            created_at: new Date().toISOString(),
        })
    }

    private async logout(isVerbose: boolean) {
        this.verboseLog('Starting logout process...', isVerbose)
        if (!this.isLoggedIn()) {
            outro('You are not logged in.')
            return
        }
        const shouldLogout = await confirm({
            message: 'Are you sure you want to logout?',
        })
        if (!shouldLogout) {
            outro('Logout cancelled.')
            return
        }

        configStore.delete(this.tokenName)
        this.verboseLog('Token data removed from storage.', isVerbose)
        outro('You have been logged out successfully.')
    }

    private async showAccounts(isVerbose: boolean) {
        this.verboseLog('Retrieving stored authentication data...', isVerbose)
        const storedData = this.getStoredTokenData()
        if (!storedData) {
            return
        }
        this.verboseLog(
            'Authentication data retrieved successfully.',
            isVerbose
        )

        this.displayStoredUserData(storedData)
        outro('End of authentication data.')
    }

    private displayStoredUserData(storedData: tokenData): void {
        log.message('Stored Authentication Data:')
        log.info(`Token Created At: ${storedData.created_at}`)
        for (const user of storedData.gh) {
            log.message('---------------------------')
            log.step(`Login: ${user.login}`)
            log.step(`Email: ${user.email ?? 'N/A'}`)
            log.step(`Name: ${user.name ?? 'N/A'}`)
            log.step(`User View Type: ${user.user_view_type ?? 'N/A'}`)
        }
        log.message('---------------------------')
    }

    private getStoredTokenData(): tokenData | null {
        const storedData = configStore.get(this.tokenName) as tokenData | null
        if (!storedData) {
            outro('No stored authentication data found.')
            return null
        }
        return storedData
    }
    private handleError(error: unknown, isVerbose: boolean): void {
        if (isVerbose) {
            console.error(`Execution error: `, error)
        }
        outro('An unexpected error occured. Please try again.')
    }
    private async verifyToken(token: string): Promise<userBucket> {
        try {
            const userInfo = await verifyGhToken(token)

            if (!userInfo || !userInfo.login) {
                throw new Error(
                    'Token verification failed: Invalid response from GitHub API'
                )
            }

            return userInfo
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Token verification failed: ${error.message}`)
            }
            throw new Error('Token verification failed: Unknown error')
        }
    }

    private verboseLog(message: string, isVerbose: boolean): void {
        if (isVerbose) {
            log.info(message)
        }
    }
    public async whoAmI(format: 'json' | 'text' = 'text'): Promise<void> {
        if (!this.isLoggedIn()) {
            console.log('You are not logged in.')
            return
        }

        const user = this.getStoredTokenData()
        if (!user || user.gh.length < 1 || !user.gh[0]) {
            return
        }
        console.log('You are logged in as:')
        if (format === 'json') {
            console.log(JSON.stringify(user.gh[0], null, 2))
            return
        }
        console.log(`- Login: ${user.gh[0].login}`)
        console.log(`- Name: ${user.gh[0].name ?? 'N/A'}`)
        console.log(`- Email: ${user.gh[0].email ?? 'N/A'}`)
    }
}

export {
    AuthenticationManager,
    type options,
    type optionsRecord,
    type tokenData,
}
