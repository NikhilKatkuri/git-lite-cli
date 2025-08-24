import axios from 'axios';
import terminalImage from 'terminal-image';

export default async function showAvatar(avatarUrl: string) {
  try {
    // Request high-quality image with appropriate headers
    const { data } = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'GitCLI/1.0',
        Accept: 'image/*',
      },
    });

    const image = await terminalImage.buffer(Buffer.from(data), {
      width: 5000 * 100,
      height: 5000 * 100,
      preserveAspectRatio: true,
    });

    console.log(image);
  } catch (error) {
    console.error(
      'Failed to display avatar:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    console.log('Avatar URL:', avatarUrl);
  }
}
