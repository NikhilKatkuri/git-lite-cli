import { log } from '@clack/prompts'

/**
 * Logs a message if verbose mode is enabled.
 * @param message string
 * @param isVerbose  boolean
 * @returns void
 */

function verboseLog(message: string, isVerbose: boolean): void {
    if (isVerbose) {
        log.info(message)
    }
}
export default verboseLog
