import { execa } from 'execa'
import verboseLog from './verbose.js'

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
