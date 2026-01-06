import Conf from 'conf'
import { getPath } from '../utils/glc_paths.js'
import type { BoomEvent } from './event.js'
import createEvent from './event.js'

const queue = new Conf({
    configName: 'git-lite-cli-analytics-config',
    cwd: getPath._path,
})

function addToQueue(event: string, duration_ms: number): void {
    try {
        const currentQueue = queue.get('event-queue') as BoomEvent[] | undefined
        const eveObj = createEvent(event, duration_ms)
        if (!currentQueue) {
            queue.set('event-queue', [eveObj])
        } else {
            currentQueue.push(eveObj)
            queue.set('event-queue', currentQueue)
        }
    } catch {}
}
/**
 * Utility function to track command execution time and add to analytics queue
 */
export default async function trackCommand(
    commandName: string,
    fn: () => void | Promise<void>
) {
    const startTime = Date.now()
    await fn()
    addToQueue(commandName, Date.now() - startTime)
}
