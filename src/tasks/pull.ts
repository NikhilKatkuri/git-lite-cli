import { select, text } from '@clack/prompts';
import path from 'path';
import { existsSync } from 'fs';
import excuter from '../utils/excuter.js';
import isGitRepo from '../utils/isGit.js';

async function handlePull(dir: string, commands: string[]) {
  await excuter(commands, { cwd: dir });
}
async function handleDepth(dir: string, branch: string) {
  const depthLevel = (await text({
    message: 'depth level',
    defaultValue: '1',
    initialValue: '1',
  })) as string;
  await handlePull(dir, [`git pull --depth=${depthLevel} origin ${branch}`]);
}

export default async function pullTask() {
  const selectedDir = (await text({
    message: 'Enter the directory to pull changes from:',
    placeholder: '.',
    defaultValue: '.',
  })) as string;

  const dir = path.resolve(process.cwd(), selectedDir);

  if (!existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return;
  }

  const isGit = await isGitRepo();
  if (!isGit) {
    console.error(`Not a git repository: ${dir}`);
    return;
  }

  const action = await select({
    message: 'what do you want to do?',
    options: [
      { value: 'pull', label: 'Default Pull' },
      { value: 'rebase', label: 'Rebase Pull' },
      { value: 'ff-only', label: 'Fast-forward Only' },
      { value: 'squash', label: 'Squash Merge' },
      { value: 'shallow', label: 'Shallow Pulls' },
    ],
  });
  const branch = (await text({
    message: 'Enter the branch to pull changes from:',
    placeholder: 'main',
    defaultValue: 'main',
  })) as string;

  switch (action) {
    case 'pull':
      await handlePull(dir, [`git pull origin ${branch}`]);
      break;
    case 'rebase':
      await handlePull(dir, [
        `git checkout ${branch}`,
        `git fetch origin ${branch}`,
        `git rebase origin/${branch}`,
      ]);
      break;
    case 'ff-only':
      await handlePull(dir, [
        `git checkout ${branch}`,
        `git fetch origin ${branch}`,
        `git merge --ff-only origin/${branch}`,
      ]);
      break;
    case 'squash':
      await handlePull(dir, [
        `git checkout ${branch}`,
        `git fetch origin ${branch}`,
        `git merge --squash origin/${branch}`,
      ]);
      break;
    case 'shallow':
      await handleDepth(dir, branch);
      break;
  }
}
