import { select } from '@clack/prompts';
import { handleCancel } from '../utils/promptHandler.js';

export default async function prompt() {
  const action = await select({
    message: 'what would you like to do?',
    options: [
      {
        value: 'create',
        label: 'Create a new Git repository',
      },
      {
        value: 'push',
        label: 'Push code to the repository',
      },
      {
        value: 'pull',
        label: 'Pull updates from the repository',
      },
      {
        value: 'commits',
        label: 'Manage commits',
      },
      {
        value: 'branch',
        label: 'Manage branch',
      },
      {
        value: 'gitignore',
        label: 'generate an .gitignore file',
      },
      {
        value: 'clone',
        label: 'Clone a Git repository',
      },
      {
        value: 'profile',
        label: 'Manage profile',
      },
    ],
  });

  handleCancel(action);
  return action as string;
}
