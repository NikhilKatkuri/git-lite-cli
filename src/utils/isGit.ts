import { exec } from 'child_process';

export default async function isGitRepo(): Promise<boolean> {
  const dir = process.cwd();
  try {
    return new Promise<boolean>((resolve) => {
      exec('git rev-parse --is-inside-work-tree', { cwd: dir }, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch {
    return false;
  }
}
