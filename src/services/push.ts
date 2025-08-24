import { outro, text } from '@clack/prompts';
import isGitRepo from '../utils/isGit.js';
import quickCommit from '../tasks/commit.js';
import configRoot, { getConfig, updateConfig } from '../dir/config_root.js';
import excuter from '../utils/excuter.js';
import branch from './branch.js';
import getRepo, { getRepoName } from '../utils/repo.js';
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
    console.log('Project data not found');
    process.exit(1);
  }
  const commit = (await quickCommit(data.name)) as string;

  cmds.push(`git add .`);
  cmds.push(`git commit -m "${commit}"`);
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
