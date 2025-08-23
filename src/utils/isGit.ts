import { exec } from 'child_process';

export default async function isGitRepo() {
  const dir = process.cwd();
  try {
    exec('git rev-parse --is-inside-work-tree', { cwd: dir }, (error) => {
      if (error) {
        return false;
      }
    });
    return true;
  } catch {
    return false;
  }
}
