import { confirm, select, text } from '@clack/prompts';

export default async function branch(branches: string[]) {
  const isNewBranch = await confirm({
    message: 'do you want to create a new branch?',
  });
  if (isNewBranch) {
    const newBranch = (await text({
      message: 'Enter the name of the new branch:',
    })) as string;
    return {
      branch: newBranch,
      isNewBranch: isNewBranch,
    };
  }
  const branch = (await select({
    message: 'Which branch do you want to switch to?',
    options: [
      ...branches.map((branch) => ({
        value: branch,
        label: branch,
      })),
    ],
  })) as string;
  return {
    branch: branch,
    isNewBranch: isNewBranch,
  };
}
