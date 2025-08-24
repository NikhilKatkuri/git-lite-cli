import { confirm, select, text } from '@clack/prompts';
import { handleCancel } from '../utils/promptHandler.js';

export default async function branch(branches: string[]) {
  const isNewBranch = await confirm({
    message: 'do you want to create a new branch?',
  });

  handleCancel(isNewBranch);

  if (isNewBranch) {
    const newBranch = await text({
      message: 'Enter the name of the new branch:',
    });

    handleCancel(newBranch);

    return {
      branch: newBranch as string,
      isNewBranch: isNewBranch as boolean,
    };
  }
  const branch = await select({
    message: 'Which branch do you want to switch to?',
    options: [
      ...branches.map((branch) => ({
        value: branch,
        label: branch,
      })),
    ],
  });

  handleCancel(branch);

  return {
    branch: branch as string,
    isNewBranch: isNewBranch as boolean,
  };
}
