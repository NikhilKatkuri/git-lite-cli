import axios from 'axios';
import configRoot from '../dir/config_root.js';
import { writeFileSync } from 'fs';
import type { RepoConfig } from '../types/RepoConfig.js';

export default async function CROG({
  token,
  name,
  description,
  isPublic,
  dir,
}: {
  token: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  dir: string;
}) {
  const url = 'https://api.github.com/user/repos';
  try {
    const res = await axios.post(
      url,
      {
        name,
        description,
        private: !isPublic,
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
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
      branches: ['main'],
    };
    const config = (await configRoot(dir)).getDirPaths();
    writeFileSync(config.configJSON, JSON.stringify(_DATA_, null, 2), {
      encoding: 'utf-8',
    });

    return res.data.html_url;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      error.response.data.message ===
        'Resource not accessible by personal access token'
    ) {
      console.log(`ERROR: Token does not have permission to create repos.`);
      console.log(
        `FIX: Create PAT with 'repo' permission or enable 'repository creation' scope.`
      );
      console.log(`https://github.com/settings/tokens`);
      return null;
    }

    const errorMessage =
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : 'Unknown error';

    console.log(`ERROR: Failed to create repo: ${errorMessage}`);
    return null;
  }
}
