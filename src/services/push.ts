import { outro, text, note } from '@clack/prompts';
import isGitRepo from '../utils/isGit.js';
import quickCommit from '../tasks/commit.js';
import configRoot, { getConfig, updateConfig } from '../dir/config_root.js';
import excuter from '../utils/excuter.js';
import branch from './branch.js';
import getRepo, { getRepoName } from '../utils/repo.js';
import { getCommitPushStatus, getSimpleRepoInfo } from '../utils/gcp.js';
import path from 'path';

export default async function push(auth: string, profile: string) {
  const cmds: string[] = [];
  const bool = isGitRepo();
  if (!bool) {
    outro('Not a git repository');
    process.exit(1);
  }
  const config = await configRoot(process.cwd());
  const url = config.verify();
  if (!url) {
    const repoName = (await text({
      message: 'Enter the remote repository URL:',
    })) as string;
    const localDir = (await text({
      message: 'Enter the local directory path:',
      defaultValue: '.',
      placeholder: '.',
    })) as string;
    const dir = path.resolve(process.cwd(), localDir);
    await getRepo(profile, getRepoName(repoName), auth, dir);
  }
  const data = getConfig();
  if (!data.local_dir || !data || !data.name) {
    note('Project data not found');
    process.exit(1);
  }

  // Check git status using the simple functions
  const repoInfo = getSimpleRepoInfo(data.local_dir);
  const status = getCommitPushStatus(data.local_dir);

  note(`Repository status: ${status}`);

  // Only add and commit if there are changes that need to be committed
  if (repoInfo.needsCommit) {
    const commit = (await quickCommit(data.name)) as string;
    cmds.push(`git add .`);
    cmds.push(`git commit -m "${commit}"`);
    note('Changes detected - will commit before pushing');
  } else if (status === 'committed and pushed') {
    outro('Repository is already up to date - nothing to push');
    return;
  } else if (status === 'committed but not pushed') {
    note('Found unpushed commits - need to be pushed to remote');
  } else {
    note('No local changes detected - proceeding with push');
  }
  const selectedBranch = await branch(data.branches);
  if (selectedBranch.isNewBranch) {
    data.branches.push(selectedBranch.branch);
    updateConfig(data, data.local_dir);
    cmds.push(`git checkout -b ${selectedBranch.branch}`);
    cmds.push(`git push -u origin ${selectedBranch.branch}`);
  } else {
    cmds.push(`git push -u origin HEAD:${selectedBranch.branch}`);
  }
  await excuter(cmds, { cwd: data.local_dir });
}
