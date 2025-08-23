import axios from 'axios';

export default async function CROG({
  token,
  name,
  description,
  isPublic,
}: {
  token: string;
  name: string;
  description?: string;
  isPublic?: boolean;
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
    return res.data.html_url;
  } catch (error: any) {
    if (
      error.response?.data?.message ===
      'Resource not accessible by personal access token'
    ) {
      console.log(`ERROR: Token does not have permission to create repos.`);
      console.log(
        `FIX: Create PAT with 'repo' permission or enable 'repository creation' scope.`
      );
      console.log(`https://github.com/settings/tokens`);
      return null;
    }

    console.log(
      `ERROR: Failed to create repo: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}
