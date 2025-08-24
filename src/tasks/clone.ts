import { note, text } from '@clack/prompts';
import path from 'path';
import excuter from '../utils/excuter.js';
import getRepo, { getRepoName } from '../utils/repo.js';
import { handleCancel } from '../utils/promptHandler.js';

export default async function cloneTask(auth: string, userLogin: string) {
  const repoUrl = await text({
    message: 'Enter the repository URL to clone:',
  });

  handleCancel(repoUrl);

  const targetDir = await text({
    message: 'Enter the target directory to clone into:',
  });

  handleCancel(targetDir);

  const dir = path.resolve(process.cwd(), (targetDir as string).trim());
  const cmd = `git clone ${repoUrl as string} ${dir}`;
  await excuter([cmd], { cwd: dir, stdOut: false });
  await getRepo(userLogin, getRepoName((repoUrl as string).trim()), auth, dir);
  note(`Repository cloned to ${dir}`);
}
