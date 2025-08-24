import { select, text } from '@clack/prompts';
import { getConfig } from '../dir/config_root.js';
import isGitRepo from '../utils/isGit.js';
import excuter from '../utils/excuter.js';
import { handleCancel } from '../utils/promptHandler.js';

const initialCommits: string[] = [
  `Initialize project structure for /m/project/m/, pushed via gitlite`,
  `Set up initial codebase for /m/project/m/, pushed via gitlite`,
  `Establish base configuration for /m/project/m/, pushed via gitlite`,
  `Create initial project files for /m/project/m/, pushed via gitlite`,
  `Begin development of /m/project/m/, pushed via gitlite`,
  `Configure initial setup for /m/project/m/, pushed via gitlite`,
  `Add initial commit for /m/project/m/, pushed via gitlite`,
  `Establish project foundation for /m/project/m/, pushed via gitlite`,
  `Set up initial version of /m/project/m/, pushed via gitlite`,
  `Start project with initial files for /m/project/m/, pushed via gitlite`,
];

function randomCommit(projectname: string) {
  const rand = Math.floor(Math.random() * initialCommits.length);
  const commitMessage = initialCommits[rand]
    ? initialCommits[rand].replace('/m/project/m/', projectname)
    : (initialCommits[0] ?? '').replace('/m/project/m/', projectname);
  return commitMessage;
}
export default async function quickCommit(projectname: string) {
  const rc = randomCommit(projectname);
  const msg = await text({
    message: 'enter commit message',
    placeholder: 'commit message',
    defaultValue: rc ?? '',
  });

  handleCancel(msg);
  return msg as string;
}

async function handleCommit() {
  const projectname = getConfig().name;
  if (!projectname) {
    return;
  }
  const msg = (await quickCommit(projectname)) as string;
  const cmd = [];
  cmd.push('git add .');
  cmd.push(`git commit -m "${msg}"`);
  await excuter(cmd);
}

async function handleDeleteCommit() {
  const action = await select({
    message: 'How do you want to delete the commit?',
    options: [
      {
        value: 'soft',
        label: 'Soft reset (keep changes in working directory)',
      },
      { value: 'mixed', label: 'Mixed reset (keep changes unstaged)' },
      { value: 'hard', label: 'Hard reset (discard all changes)' },
    ],
  });

  handleCancel(action);

  let cmd = '';
  switch (action) {
    case 'soft':
      cmd = 'git reset --soft HEAD~1';
      break;
    case 'mixed':
      cmd = 'git reset --mixed HEAD~1';
      break;
    case 'hard':
      cmd = 'git reset --hard HEAD~1';
      break;
    default:
      console.log('Invalid option selected');
      return;
  }

  console.log(`Executing: ${cmd}`);
  await excuter([cmd]);
  console.log('Previous commit has been deleted');
}

export async function Commit() {
  const bool = await isGitRepo();
  if (!bool) {
    console.log('Not a git repository');
    return;
  }
  const action = await select({
    message: 'what do you want to do?',
    options: [
      { value: 'quick-commit', label: 'Commit the changes' },
      { value: 'delete-commit', label: 'Delete Commit' },
    ],
  });

  handleCancel(action);

  switch (action) {
    case 'quick-commit':
      await handleCommit();
      break;
    case 'delete-commit':
      await handleDeleteCommit();
      break;
  }
}
