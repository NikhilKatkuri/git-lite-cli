import { note, text } from '@clack/prompts';
import path from 'path';
import excuter from '../utils/excuter.js';
import getRepo, { getRepoName } from '../utils/repo.js';

export default async function cloneTask(auth: string, userLogin: string) {
  const repoUrl = (await text({
    message: 'Enter the repository URL to clone:',
  })) as string;
  const targetDir = (await text({
    message: 'Enter the target directory to clone into:',
  })) as string;

  const dir = path.resolve(process.cwd(), targetDir.trim());
  const cmd = `git clone ${repoUrl} ${dir}`;
  await excuter([cmd], { cwd: dir, stdOut: false });
  await getRepo(userLogin, getRepoName(repoUrl.trim()), auth, dir);
  note(`Repository cloned to ${dir}`);
}
