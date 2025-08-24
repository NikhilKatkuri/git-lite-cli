#!/usr/bin/env node

import { intro, outro } from '@clack/prompts';
import isAuth from './auth/isAuth.js';
import { profile } from './auth/profile.js';
import { isConnectedToInternet } from './utils/ICN.js';
import prompt from './services/cli.js';
import Greet from './utils/greetings.js';
import createProject from './services/create.js';
import push from './services/push.js';
import { Commit } from './tasks/commit.js';
import cloneTask from './tasks/clone.js';

async function main() {
  // check internet connection
  const isConnection = await isConnectedToInternet();
  if (!isConnection) {
    console.log(
      'No internet connection. Please check your network and try again.'
    );
    process.exit(1);
  }
  // check authentication
  const auth = await isAuth();
  const userProfile = await profile(auth).getProfile();

  if (!userProfile) {
    console.log('User profile not found.');
    process.exit(1);
  }
  /**
   * Greet the user
   */
  intro(Greet(userProfile.login));
  /**
   * Prompt the user for an action
   */
  const action = await prompt();
  /**
   * Handle user action
   */
  switch (action) {
    case 'create':
      await createProject(auth);
      break;
    case 'push':
      await push(auth, userProfile.login);
      break;
    case 'pull':
      break;
    case 'commits':
      Commit();
      break;
    case 'branch':
      break;
    case 'clone':
      await cloneTask(auth, userProfile.login);
      break;
    case 'profile':
      break;
  }
  outro('Thank you for using GitCLI!');
}

await main();
