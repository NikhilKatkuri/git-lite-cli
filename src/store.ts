import Conf from 'conf'
import { getPath } from './utils/glc_paths.js'

/**
 * initialize Conf instance for Git Lite CLI
 */

const configStore = new Conf({
    configName: 'git-lite-cli-config',
    cwd: getPath._path,
})

export default configStore
