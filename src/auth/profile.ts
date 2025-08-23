import { readFileSync } from 'fs';
import { getConfigDir } from '../dir/config_dir.js';
import { fetchGitHubUser } from '../utils/fetchUser.js';

export function profile(token: string) {
  const file = getConfigDir().gitConfigUserFile;
  return {
    setProfile: async () => {
      const data = await fetchGitHubUser(token, file);
      return data;
    },
    getProfile: () => {
      const read = readFileSync(file, 'utf-8');
      return JSON.parse(read);
    },
  };
}
