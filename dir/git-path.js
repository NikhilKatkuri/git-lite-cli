// utils/config-path.js

import os from 'os';
import path from 'path';
import fs from 'fs';

export function getConfigDir() {
  const platform = process.platform;

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(localAppData, 'gitpackage', 'config');
  } else if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'gitpackage', 'config');
  } else {
    return path.join(os.homedir(), '.config', 'gitpackage', 'config');
  }
}

export function ensureConfigDirExists() {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
