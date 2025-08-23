import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import type { RepoConfig } from '../types/RepoConfig.js';
export default async function configRoot(dir: string) {
  const configDir = path.join(dir, '.gitlite');

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const configJSON = path.join(configDir, 'config.json');
  if (!existsSync(configJSON)) {
    writeFileSync(configJSON, JSON.stringify({}), { encoding: 'utf-8' });
  }

  return {
    verify: () => {
      const read = readFileSync(configJSON, { encoding: 'utf-8' });
      const json = JSON.parse(read);
      const url = json.html_url + '.git';
      if (url) {
        const regex =
          /^(?:git@|https:\/\/)(?:github\.com)[:/]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\.git)?$/;
        return regex.test(url);
      }
      return false;
    },
    getDirPaths: () => {
      return {
        configDir,
        configJSON,
      };
    },
  };
}

export function getConfig(): RepoConfig {
  const read = readFileSync(
    path.join(process.cwd(), '.gitlite', 'config.json'),
    { encoding: 'utf-8' }
  );
  const json = JSON.parse(read);
  return json;
}
export function updateConfig(newConfig: RepoConfig, dir: string): void {
  writeFileSync(
    path.join(dir, '.gitlite', 'config.json'),
    JSON.stringify(newConfig, null, 2),
    {
      encoding: 'utf-8',
    }
  );
}
