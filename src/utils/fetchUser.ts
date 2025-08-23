import axios from 'axios';
import { writeFileSync } from 'fs';

/**
 * Fetch GitHub user details and store them in a file
 * @param token - GitHub Personal Access Token
 * @param file - File path to save the user details
 * @returns The user data with timestamp
 */
export async function fetchGitHubUser(token: string, file: string) {
  const url = 'https://api.github.com/user';

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `token ${token}` },
    });

    const data = {
      ...res.data,
      timeStamped: new Date().toISOString(),
    };

    writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  } catch (err: any) {
    if (err.response) {
      console.error('❌ GitHub API Error:', err.response.data.message);
    } else {
      console.error('❌ Network or Unknown Error:', err.message);
    }
    throw err;
  }
}
