import { execa } from 'execa'
import verboseLog from './verbose.js'

/**
 * Check if the current directory is a git repository.
 *
 * @param isVerbose boolean
 * @returns Promise<boolean>
 */

const gate = async (isVerbose: boolean): Promise<boolean> => {
    try {
        const { stdout } = await execa('git', ['status'])
        verboseLog(stdout, isVerbose)
        return true
    } catch (error) {
        verboseLog(String(error), isVerbose)
        return false
    }
}

export default gate
