import { readFileSync, writeFileSync } from 'fs';
import { existenceOfConfig, getConfigDir } from '../dir/config_dir.js';
import { intro, outro, password } from '@clack/prompts';
import { profile } from './profile.js';

async function isAuth() {
  existenceOfConfig();
  const file = getConfigDir().gitConfigFile;
  const read = readFileSync(file, { encoding: 'utf-8' });
  const content = JSON.parse(read);
  if (
    !content.token ||
    !content.token.startsWith('ghp_') ||
    content.token.toString().length !== 40
  ) {
    intro('Authentication Required');
    const token = (await password({
      message: 'Enter your token',
      validate: (value) => {
        if (!value) {
          return 'Token is required';
        }
        if (value.length < 40) {
          return 'Token must be at least 40 characters long';
        }
        if (!value.startsWith('ghp_')) {
          return 'Token must start with "ghp_"';
        }
        return undefined;
      },
    })) as string;

    if (!token) process.exit(1);
    content.token = token;
    // Save the updated content back to the file
    writeFileSync(file, JSON.stringify(content, null, 2));
    profile(token).setProfile();
    outro('Token saved successfully!');
  }
  await profile(content.token).setProfile();
  return content.token;
}

export default isAuth;
