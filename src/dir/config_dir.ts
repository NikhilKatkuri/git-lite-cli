import path from 'path';
import os from 'os';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

/**
 *
 * @returns :{
 *   local: local,
 *   gitConfigPath: path.join(local, gitPath),
 *   gitConfigFile: path.join(local, gitPath, file),
 *   gitConfigUserFile: path.join(local, gitPath, user)
 * }
 */

export function getConfigDir() {
  const gitPath = path.join('gitpackage', 'config');
  const user = 'config.user.json';
  const file = 'config.data.json';
  const platform = process.platform;

  if (platform === 'win32') {
    // windows
    const local =
      process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'local');

    return {
      local: local,
      gitConfigPath: path.join(local, gitPath),
      gitConfigFile: path.join(local, gitPath, file),
      gitConfigUserFile: path.join(local, gitPath, user),
    };
  } else if (platform === 'darwin') {
    const local = path.join(os.homedir(), 'Library', 'Application Support');
    // macos
    return {
      local: local,
      gitConfigPath: path.join(local, gitPath),
      gitConfigFile: path.join(local, gitPath, file),
      gitConfigUserFile: path.join(local, gitPath, user),
    };
  } else {
    // rest devices
    const local = path.join(os.homedir(), '.config');
    return {
      local: local,
      gitConfigPath: path.join(local, gitPath),
      gitConfigFile: path.join(local, gitPath, file),
      gitConfigUserFile: path.join(local, gitPath, user),
    };
  }
}

/**
 * checks files and folders, if not exits it creates
 */

export function existenceOfConfig() {
  const folders = getConfigDir();
  const gitFolder = folders.gitConfigPath;
  if (!existsSync(gitFolder)) {
    mkdirSync(gitFolder, { recursive: true });
  }
  const gitFile = folders.gitConfigFile;
  if (!existsSync(gitFile)) {
    writeFileSync(gitFile, JSON.stringify({}), { encoding: 'utf-8' });
  }
  const gitUser = folders.gitConfigUserFile;
  if (!existsSync(gitUser)) {
    writeFileSync(gitUser, JSON.stringify({}), { encoding: 'utf-8' });
  }
}
