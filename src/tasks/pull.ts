import { select, text } from '@clack/prompts';
import path from 'path';
import { existsSync } from 'fs';
import excuter from '../utils/excuter.js';
import isGitRepo from '../utils/isGit.js';
import { handleCancel } from '../utils/promptHandler.js';

async function handlePull(dir: string, commands: string[]) {
  await excuter(commands, { cwd: dir });
}
async function handleDepth(dir: string, branch: string) {
  const depthLevel = await text({
    message: 'depth level',
    defaultValue: '1',
    initialValue: '1',
  });

  handleCancel(depthLevel);
  await handlePull(dir, [
    `git pull --depth=${depthLevel as string} origin ${branch}`,
  ]);
}

export default async function pullTask() {
  const selectedDir = await text({
    message: 'Enter the directory to pull changes from:',
    placeholder: '.',
    defaultValue: '.',
  });

  handleCancel(selectedDir);

  const dir = path.resolve(process.cwd(), selectedDir as string);

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

  handleCancel(action);

  const branch = await text({
    message: 'Enter the branch to pull changes from:',
    placeholder: 'main',
    defaultValue: 'main',
  });

  handleCancel(branch);

  const branchName = branch as string;

  switch (action) {
    case 'pull':
      await handlePull(dir, [`git pull origin ${branchName}`]);
      break;
    case 'rebase':
      await handlePull(dir, [
        `git checkout ${branchName}`,
        `git fetch origin ${branchName}`,
        `git rebase origin/${branchName}`,
      ]);
      break;
    case 'ff-only':
      await handlePull(dir, [
        `git checkout ${branchName}`,
        `git fetch origin ${branchName}`,
        `git merge --ff-only origin/${branchName}`,
      ]);
      break;
    case 'squash':
      await handlePull(dir, [
        `git checkout ${branchName}`,
        `git fetch origin ${branchName}`,
        `git merge --squash origin/${branchName}`,
      ]);
      break;
    case 'shallow':
      await handleDepth(dir, branchName);
      break;
  }
}
