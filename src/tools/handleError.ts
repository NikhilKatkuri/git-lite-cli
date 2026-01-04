import { outro } from '@clack/prompts'

/**
 * Handles errors that occur during execution.
 * @param error unkown
 * @param isVerbose boolean
 * @return void
 */

export default function handleError(error: unknown, isVerbose: boolean): void {
    if (isVerbose) {
        console.error(`Execution error: `, error)
    }
    outro('An unexpected error occured. Please try again.')
}
