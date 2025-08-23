import { text } from '@clack/prompts';

const initialCommits: string[] = [
  `Initialize project structure for /m/project/m/, pushed via gitlite`,
  `Set up initial codebase for /m/project/m/, pushed via gitlite`,
  `Establish base configuration for /m/project/m/, pushed via gitlite`,
  `Create initial project files for /m/project/m/, pushed via gitlite`,
  `Begin development of /m/project/m/, pushed via gitlite`,
  `Configure initial setup for /m/project/m/, pushed via gitlite`,
  `Add initial commit for /m/project/m/, pushed via gitlite`,
  `Establish project foundation for /m/project/m/, pushed via gitlite`,
  `Set up initial version of /m/project/m/, pushed via gitlite`,
  `Start project with initial files for /m/project/m/, pushed via gitlite`,
];

function randomCommit(projectname: string) {
  const rand = Math.floor(Math.random() * initialCommits.length);
  const commitMessage = initialCommits[rand]
    ? initialCommits[rand].replace('/m/project/m/', projectname)
    : (initialCommits[0] ?? '').replace('/m/project/m/', projectname);
  return commitMessage;
}
export default async function quickCommit(projectname: string) {
  const rc = randomCommit(projectname);
  const msg = await text({
    message: 'enter commit message',
    placeholder: 'commit message',
    defaultValue: rc ?? '',
  });
  return msg;
}
