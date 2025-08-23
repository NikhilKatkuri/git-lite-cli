import https from 'https';

/**
 *
 * @returns Promise<boolean>
 */

export async function isConnectedToInternet(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get('https://www.google.com', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}
