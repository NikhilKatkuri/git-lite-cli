import axios from 'axios';
import configRoot from '../dir/config_root.js';
import { writeFileSync } from 'fs';
import type { RepoConfig } from '../types/RepoConfig.js';

export default async function getRepo(
  owner: string,
  repo: string,
  token: string,
  dir: string
) {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const _DATA_: RepoConfig = {
      id: res.data.id,
      local_dir: dir,
      node_id: res.data.node_id,
      name: res.data.name,
      full_name: res.data.full_name,
      description: res.data.description,
      private: res.data.private,
      html_url: res.data.html_url,
      owner: {
        login: res.data.owner.login,
        id: res.data.owner.id,
        node_id: res.data.owner.node_id,
        avatar_url: res.data.owner.avatar_url,
        gravatar_id: res.data.owner.gravatar_id,
        url: res.data.owner.url,
        html_url: res.data.owner.html_url,
        followers_url: res.data.owner.followers_url,
        following_url: res.data.owner.following_url,
        gists_url: res.data.owner.gists_url,
        starred_url: res.data.owner.starred_url,
        subscriptions_url: res.data.owner.subscriptions_url,
        organizations_url: res.data.owner.organizations_url,
        repos_url: res.data.owner.repos_url,
        events_url: res.data.owner.events_url,
        received_events_url: res.data.owner.received_events_url,
        type: res.data.owner.type,
        user_view_type: res.data.owner.user_view_type,
        site_admin: res.data.owner.site_admin,
      },
      branches: res.data.default_branch ? [res.data.default_branch] : ['main'],
    };
    const config = (await configRoot(dir)).getDirPaths();
    writeFileSync(config.configJSON, JSON.stringify(_DATA_, null, 2), {
      encoding: 'utf-8',
    });
    return res.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch repository: ${err.message}`);
    }
    {
      console.error('Error fetching repo:', err);
    }
  }
}

export function getRepoName(repoUrl: string): string {
  const match = repoUrl.split('/').pop();
  return match ? (match.endsWith('.git') ? match.slice(0, -4) : match) : '';
}
