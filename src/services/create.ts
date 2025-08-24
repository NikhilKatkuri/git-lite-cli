import { confirm, note, text } from '@clack/prompts';
import path, { basename } from 'path';
import quickCommit from '../tasks/commit.js';
import CROG from '../utils/crog.js';
import excuter from '../utils/excuter.js';
import { handleCancel } from '../utils/promptHandler.js';

export default async function createProject(auth: string) {
  try {
    const directory = await text({
      message: 'enter root/project directory',
      defaultValue: '.',
      placeholder: '.',
    });

    handleCancel(directory);

    const dir = path.resolve(
      (directory as string) === '.' ? process.cwd() : (directory as string)
    );

    const project = await text({
      message: 'enter project name',
      defaultValue: basename(dir),
      placeholder: basename(dir),
    });

    handleCancel(project);

    const description = await text({
      message: 'description for project',
      placeholder: 'a brief description',
      defaultValue: `${project as string} - A project that does awesome things`,
    });

    handleCancel(description);

    const isPublic = await confirm({
      message: 'Would you like to make the repository public?',
      initialValue: true,
    });

    handleCancel(isPublic);

    const url = await CROG({
      token: auth,
      name: project as string,
      description: description as string,
      isPublic: isPublic as boolean,
      dir: dir,
    });
    note(`remote: ${url}`);
    const isPush = await confirm({
      message: 'Would you like to push the changes to the remote repository?',
      initialValue: true,
    });

    handleCancel(isPush);

    if (!isPush) return;

    const commit = (await quickCommit(project as string)) as string;

    // Execute git commands in sequence
    const commands = [
      `git init`,
      `git add .`,
      `git commit -m "${commit}"`,
      `git branch -M main`,
      `git remote add origin ${url}.git`,
      `git push -u origin main`,
    ];

    await excuter(commands, { cwd: dir });
  } catch {
    process.exit(1);
  }
}
