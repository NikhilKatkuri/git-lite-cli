import { exec } from 'child_process';

/**
 * Execute shell commands with validation and error handling
 * @param commands - Array of commands to execute
 * @param options - Execution options
 */
export default async function excuter(
  commands: string[],
  options: { cwd?: string; stdOut?: boolean } = {}
): Promise<void> {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('Commands must be a non-empty array');
  }

  options.stdOut = options.stdOut ?? true;

  for (const cmd of commands) {
    if (typeof cmd !== 'string' || cmd.trim().length === 0) {
      throw new Error('Each command must be a non-empty string');
    }

    // Basic command validation - prevent dangerous operations
    const sanitizedCmd = cmd.trim();
    const dangerousPatterns = [
      /rm\s+-rf\s+\/$/, // Prevent rm -rf /
      />\s*\/dev\/null/, // Prevent output redirection to dangerous locations
      /&&\s*rm/, // Prevent chained dangerous commands
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitizedCmd)) {
        throw new Error(`Potentially dangerous command detected: ${cmd}`);
      }
    }

    await new Promise<void>((resolve, reject) => {
      exec(sanitizedCmd, { cwd: options.cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${sanitizedCmd}`);
          console.error(`Error: ${error.message}`);
          reject(
            new Error(`Command failed: ${sanitizedCmd} - ${error.message}`)
          );
          return;
        }
        if (stderr) {
          if (options.stdOut) {
            console.warn(`Warning: ${stderr}`);
          }
        }
        if (stdout) {
          if (options.stdOut) {
            console.log(`${stdout.trim()}`);
          }
        }
        resolve();
      });
    });
  }
}
