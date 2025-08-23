import { exec } from 'child_process';

export default async function excuter(
  commands: string[],
  options: { cwd?: string } = {}
): Promise<void> {
  for (const cmd of commands) {
    await new Promise<void>((resolve, reject) => {
      exec(cmd, { cwd: options.cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${cmd}`);
          console.error(`Error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.warn(`Warning: ${stderr}`);
        }
        if (stdout) {
          console.log(`${stdout.trim()}`);
        }
        resolve();
      });
    });
  }
}
