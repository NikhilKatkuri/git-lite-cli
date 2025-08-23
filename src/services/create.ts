import { confirm, note, text } from '@clack/prompts';
import path, { basename } from 'path';
import quickCommit from '../tasks/commit.js';
import CROG from '../utils/crog.js';
import { exec } from 'child_process';

export default async function createProject(auth: string) {
  try {
    const directory = (await text({
      message: 'enter root/project directory',
      defaultValue: '.',
      placeholder: '.',
    })) as string;

    const dir = path.resolve(directory === '.' ? process.cwd() : directory);

    const project = (await text({
      message: 'enter project name',
      defaultValue: basename(dir),
      placeholder: basename(dir),
    })) as string;

    const description = (await text({
      message: 'description for project',
      placeholder: 'a brief description',
      defaultValue: `${project} - A project that does awesome things`,
    })) as string;

    const isPublic = (await confirm({
      message: 'Would you like to make the repository public?',
      initialValue: true,
    })) as boolean;

    const url = await CROG({
      token: auth,
      name: project,
      description: description,
      isPublic: isPublic,
    });
    note(`remote: ${url}`);
    const isPush = await confirm({
      message: 'Would you like to push the changes to the remote repository?',
      initialValue: true,
    });

    if (!isPush) return;

    const commit = (await quickCommit(project)) as string;

    // Execute git commands in sequence
    const commands = [
      `git init`,
      `git add .`,
      `git commit -m "${commit}"`,
      `git branch -M main`,
      `git remote add origin ${url}.git`,
      `git push -u origin main`,
    ];

    for (const cmd of commands) {
      await new Promise<void>((resolve, reject) => {
        exec(cmd, { cwd: dir }, (error, stdout, stderr) => {
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
  } catch {
    process.exit(1);
  }
}
