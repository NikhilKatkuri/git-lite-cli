import { execSync } from 'child_process';

function getCommitPushStatus(directory?: string): string {
  try {
    const options = directory
      ? { encoding: 'utf-8' as const, cwd: directory }
      : { encoding: 'utf-8' as const };

    //  git status output
    const output = execSync('git status', options);

    // Check for untracked files first
    if (output.includes('Untracked files:')) {
      return 'has untracked files';
    }

    // Check for uncommitted changes
    if (
      output.includes('Changes not staged for commit') ||
      output.includes('Changes to be committed')
    ) {
      return 'has uncommitted changes';
    }

    // Check if project is ahead of remote (committed but not pushed)
    if (output.includes('ahead')) {
      return 'committed but not pushed';
    }

    // Check if project is behind remote
    if (output.includes('behind')) {
      return 'behind remote';
    }

    // Check if project is diverged from remote
    if (output.includes('diverged')) {
      return 'diverged from remote';
    }

    // Check if everything is up to date
    if (output.includes('up to date') || output.includes('up-to-date')) {
      return 'committed and pushed';
    }

    return 'unknown status';
  } catch {
    return 'not a git repo';
  }
}

function hasChangesToCommit(directory?: string): boolean {
  try {
    const options = directory
      ? { encoding: 'utf-8' as const, cwd: directory }
      : { encoding: 'utf-8' as const };

    const output = execSync('git status --porcelain', options);

    return output.trim().length > 0;
  } catch {
    return false;
  }
}

//  Check if repository is clean (no changes, no untracked files)

function isRepoClean(directory?: string): boolean {
  return !hasChangesToCommit(directory);
}

//  Get simple status info about the repository
function getSimpleRepoInfo(directory?: string) {
  const status = getCommitPushStatus(directory);
  const hasChanges = hasChangesToCommit(directory);
  const isClean = isRepoClean(directory);

  return {
    status: status,
    hasChanges: hasChanges,
    isClean: isClean,
    needsCommit: hasChanges,
    canPush: !hasChanges && status.includes('ahead'),
  };
}

export {
  getCommitPushStatus,
  hasChangesToCommit,
  isRepoClean,
  getSimpleRepoInfo,
};

export default getCommitPushStatus;
