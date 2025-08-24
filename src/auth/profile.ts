import { readFileSync, writeFileSync } from 'fs';
import { getConfigDir } from '../dir/config_dir.js';
import { fetchGitHubUser } from '../utils/fetchUser.js';
import type { userProfile } from '../types/userProfile.js';

export function profile(token: string) {
  const file = getConfigDir().gitConfigUserFile;
  return {
    setProfile: async () => {
      const data = await fetchGitHubUser(token, file);
      writeFileSync(file, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
      return data as userProfile;
    },
    getProfile: () => {
      const read = readFileSync(file, 'utf-8');
      return JSON.parse(read) as userProfile;
    },
  };
}
