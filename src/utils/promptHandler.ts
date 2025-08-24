import { isCancel, cancel } from '@clack/prompts';

/**
 * Handles cancellation of prompts by checking if the value is a cancel symbol
 * and exiting the process gracefully
 * @param value - The value returned from a prompt
 * @param message - Optional custom cancellation message
 */
export function handleCancel(value: unknown, message?: string): void {
  if (isCancel(value)) {
    cancel(message || 'Operation cancelled by user');
    process.exit(0);
  }
}

/**
 * Wrapper for prompt functions that automatically handles cancellation
 * @param promptFn - A function that returns a promise with the prompt result
 * @param cancelMessage - Optional custom cancellation message
 * @returns The prompt result if not cancelled
 */
export async function withCancelHandler<T>(
  promptFn: () => Promise<T>,
  cancelMessage?: string
): Promise<T> {
  const result = await promptFn();
  handleCancel(result, cancelMessage);
  return result;
}
