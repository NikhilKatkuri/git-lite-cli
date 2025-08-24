import { profile } from '../auth/profile.js';
import showAvatarInline from '../utils/avatar.js';

export default async function profileTask(auth: string) {
  const data = await profile(auth).setProfile();
  console.log(
    `
=======================================
GitHub Profile : ${data.login}
=======================================`
  );
  await showAvatarInline(data.avatar_url);
  console.log(`
Username      : ${data.login}
Name          : ${data.name}
Bio           : ${data.bio}
Location      : ${data.location}
Email         : ${data.email}
Company       : ${data.company}
Blog/Website  : ${data.blog}
Public Repos  : ${data.public_repos}
Followers     : ${data.followers}
Following     : ${data.following}
Joined GitHub : ${data.created_at}
Profile URL   : ${data.html_url}
=======================================`);
}
