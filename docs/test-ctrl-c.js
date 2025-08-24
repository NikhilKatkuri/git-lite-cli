#!/usr/bin/env node

import { intro, text, outro, cancel } from '@clack/prompts';
import { handleCancel } from './src/utils/promptHandler.js';

// Setup signal handlers
function setupSignalHandlers() {
  process.on('SIGINT', () => {
    cancel('Operation cancelled by user (Ctrl+C)');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cancel('Operation terminated');
    process.exit(0);
  });
}

async function testCtrlC() {
  setupSignalHandlers();

  intro('Testing Ctrl+C handling');

  console.log('Press Ctrl+C at any prompt to test cancellation...');

  try {
    const name = await text({
      message: 'What is your name? (Try pressing Ctrl+C)',
      placeholder: 'Enter your name',
    });

    handleCancel(name);

    const age = await text({
      message: 'What is your age? (Try pressing Ctrl+C again)',
      placeholder: 'Enter your age',
    });

    handleCancel(age);

    outro(`Hello ${name}, you are ${age} years old!`);
  } catch (error) {
    cancel('An error occurred');
    process.exit(1);
  }
}
testCtrlC();
