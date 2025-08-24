import { select, text } from '@clack/prompts';
import { existsSync } from 'fs';
import path from 'path';
import isGitRepo from '../utils/isGit.js';
import excuter from '../utils/excuter.js';
import { getConfig, updateConfig } from '../dir/config_root.js';

async function updateLocalConfig(branch: string, dir: string) {
  const config = await getConfig();
  return {
    update: async () => {
      config.branches.push(branch);
      updateConfig(config, dir);
    },
    delete: async () => {
      config.branches = config.branches.filter((b) => b !== branch);
      updateConfig(config, dir);
    },
  };
}

async function create(dir: string) {
  const branchName = (await text({
    message: 'Enter the name of the new branch:',
    placeholder: 'feature/new-feature',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Branch name is required';
      }
      if (!/^[a-zA-Z0-9/_-]+$/.test(value.trim())) {
        return 'Branch name can only contain letters, numbers, hyphens, underscores, and forward slashes';
      }
      return undefined;
    },
  })) as string;

  await excuter(['git checkout -b ' + branchName.trim()], { cwd: dir });

  (await updateLocalConfig(branchName.trim(), dir)).update();
}

async function handleBranchSwitch(dir: string) {
  const branchName = (await text({
    message: 'Enter the name of the branch to switch to:',
    placeholder: 'feature/new-feature',
    defaultValue: 'main',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Branch name is required';
      }
      return undefined;
    },
  })) as string;

  await excuter(['git checkout ' + branchName.trim()], { cwd: dir });
}

async function handleBranchDelete(dir: string) {
  const branchName = (await text({
    message: 'Enter the name of the branch to delete:',
    placeholder: 'feature/new-feature',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Branch name is required';
      }
      if (value.trim() === 'main' || value.trim() === 'master') {
        return 'Cannot delete main or master branch';
      }
      return undefined;
    },
  })) as string;

  await excuter(['git branch -d ' + branchName.trim()], { cwd: dir });
  await (await updateLocalConfig(branchName.trim(), dir)).delete();
}

async function handleRename(dir: string) {
  const oldBranchName = (await text({
    message: 'Enter the name of the branch to rename:',
    placeholder: 'feature/old-feature',
  })) as string;

  const newBranchName = (await text({
    message: 'Enter the new name for the branch:',
    placeholder: 'feature/new-feature',
  })) as string;

  await excuter(['git branch -m ' + oldBranchName + ' ' + newBranchName], {
    cwd: dir,
  });
  await (await updateLocalConfig(oldBranchName.trim(), dir)).delete();
  await (await updateLocalConfig(newBranchName.trim(), dir)).update();
}

async function handleLocal(dir: string) {
  const action = (await select({
    message: 'choose an operation',
    options: [
      {
        value: 'create',
        label: 'Create a branch',
      },
      {
        value: 'switch',
        label: 'Switch / Checkout',
      },
      {
        value: 'delete',
        label: 'Delete a branch',
      },
      {
        value: 'rename',
        label: 'Rename a branch',
      },
    ],
  })) as string;

  switch (action) {
    case 'create':
      await create(dir);
      break;
    case 'switch':
      await handleBranchSwitch(dir);
      break;
    case 'delete':
      await handleBranchDelete(dir);
      break;
    case 'rename':
      await handleRename(dir);
      break;
  }
}

async function handleInfo(dir: string) {
  const action = (await select({
    message: 'Enter the information you want to know about the branch:',
    options: [
      { value: 'list', label: 'List branches' },
      { value: 'show', label: 'Show branch details' },
    ],
  })) as string;
  switch (action) {
    case 'list':
      await excuter(['git branch -a'], { cwd: dir });
      break;
    case 'show':
      await excuter(['git show-branch'], { cwd: dir });
      break;
  }
}

async function handleRemote(dir: string) {
  const action = (await select({
    message: 'Choose a remote operation:',
    options: [
      { value: 'push', label: 'Push branch' },
      { value: 'pull', label: 'Pull branch' },
    ],
  })) as string;

  const branch = (await text({
    message: 'Enter the name of the branch:',
    placeholder: 'feature/new-feature',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Branch name is required';
      }
      return undefined;
    },
  })) as string;

  switch (action) {
    case 'push':
      await excuter(['git push origin ' + branch.trim()], { cwd: dir });
      break;
    case 'pull':
      await excuter(['git pull origin ' + branch.trim()], { cwd: dir });
      break;
    default:
      console.error('Invalid remote action selected');
  }
}

async function handleSync(dir: string) {
  const action = (await select({
    message: 'Choose a sync operation:',
    options: [
      { value: 'merge', label: 'Merge branches' },
      { value: 'rebase', label: 'Rebase branches' },
      { value: 'cherry-pick', label: 'Cherry-pick commits' },
    ],
  })) as string;
  if (action !== 'cherry-pick') {
    const branch = (await text({
      message: 'Enter the name of the branch:',
      placeholder: 'feature/new-feature',
    })) as string;
    const cmd = `git ${action} ${branch}`;
    await excuter([cmd], { cwd: dir });
  } else {
    const commit = (await text({
      message: 'Enter the commit hash to cherry-pick:',
      placeholder: 'abc123',
    })) as string;
    const cmd = `git cherry-pick ${commit}`;
    await excuter([cmd], { cwd: dir });
  }
}

export default async function branchTask() {
  try {
    const selectedDir = (await text({
      message: 'Enter the directory to create the branch in:',
      defaultValue: '.',
      placeholder: '.',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Directory path is required';
        }
        return undefined;
      },
    })) as string;

    const dir = path.join(process.cwd(), selectedDir.trim());

    if (!existsSync(dir)) {
      console.error(`Directory does not exist: ${dir}`);
      return;
    }

    const isGit = await isGitRepo();
    if (!isGit) {
      console.error(`Not a git repository: ${dir}`);
      return;
    }

    const action = (await select({
      message: 'what would you like to do',
      options: [
        {
          value: 'local',
          label: 'Local operation',
        },
        {
          value: 'remote',
          label: 'Remote operation',
        },
        {
          value: 'sync',
          label: 'Sync operation',
        },
        {
          value: 'info',
          label: 'Info operation',
        },
      ],
    })) as string;

    switch (action) {
      case 'local':
        await handleLocal(dir);
        break;
      case 'remote':
        await handleRemote(dir);
        break;
      case 'sync':
        await handleSync(dir);
        break;
      case 'info':
        await handleInfo(dir);
        break;
      default:
        console.error('Invalid action selected');
    }
  } catch (error) {
    console.error(
      'Error in branch task:',
      error instanceof Error ? error.message : String(error)
    );
  }
}
