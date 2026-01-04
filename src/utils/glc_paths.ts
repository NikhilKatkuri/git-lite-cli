import os from 'os'
import path from 'path'

const glcHome = () => {
    // Determine platform-specific config directory
    if (os.platform() === 'win32') {
        /**
         * On Windows, use %APPDATA% if available, otherwise default to
         * C:\Users\<User>\AppData\Roaming
         */
        const appData = process.env.APPDATA
        return appData ?? path.join(os.homedir(), 'AppData', 'roaming')
    }

    if (os.platform() === 'darwin') {
        /**
         * On macOS, use ~/Library/Application Support
         * as the config directory
         */
        return path.join(os.homedir(), 'Library', 'Application Support')
    }

    /**
     * On Linux and other UNIX-like systems, use ~/.config
     * as the config directory
     */
    return path.join(os.homedir(), '.config')
}

/**
 * Get the configuration file path for Git Lite CLI
 * */
const getPath = {
    _path: path.join(glcHome(), 'git-lite-cli'),

    glc() {
        const config = path.join(glcHome(), this._path, 'config.json')
        return config
    },
}

export { getPath, glcHome }
