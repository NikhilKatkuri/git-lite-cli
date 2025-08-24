# Ctrl+C (SIGINT) Handling Implementation

## Overview

This implementation adds graceful handling of Ctrl+C (SIGINT) and SIGTERM signals throughout the GitCLI application. When users press Ctrl+C during any input prompt, the application will display a cancellation message and exit cleanly.

## Changes Made

### 1. Signal Handler Setup (`src/index.ts`)

- Added `setupSignalHandlers()` function that listens for SIGINT and SIGTERM signals
- Uses `@clack/prompts`'s `cancel()` function to display a clean cancellation message
- Calls the signal handler setup at the start of the main function

### 2. Prompt Handler Utility (`src/utils/promptHandler.ts`)

- Created a reusable utility module for handling prompt cancellations
- `handleCancel(value, message?)` - Checks if a prompt was cancelled and exits gracefully
- `withCancelHandler(promptFn, cancelMessage?)` - Wrapper function for automatic cancellation handling

### 3. Updated All Prompt Calls

Modified the following files to handle cancellation properly:

- **`src/services/cli.ts`** - Main menu selection
- **`src/services/create.ts`** - Repository creation prompts
- **`src/services/push.ts`** - Push-related prompts
- **`src/services/branch.ts`** - Branch selection and creation
- **`src/tasks/commit.ts`** - Commit message and deletion prompts
- **`src/tasks/clone.ts`** - Repository cloning prompts
- **`src/tasks/pull.ts`** - Pull operation prompts

### 4. Type Safety Improvements

- Added proper type casting for prompt results
- Removed unnecessary type assertions where possible
- Added proper handling of the `symbol` type returned by cancelled prompts

## How It Works

### Signal Handling

```typescript
process.on('SIGINT', () => {
  cancel('Operation cancelled by user');
  process.exit(0);
});
```

### Prompt Cancellation Checking

```typescript
const userInput = await text({ message: 'Enter something:' });
handleCancel(userInput); // Exits gracefully if cancelled
```

### Before vs After

**Before:**

```typescript
const action = (await select({...})) as string;
// No cancellation handling - could cause errors
```

**After:**

```typescript
const action = await select({...});
handleCancel(action); // Graceful exit if cancelled
return action as string;
```

## Testing

You can test the Ctrl+C handling by:

1. Running the CLI: `npm run cli`
2. At any prompt, press `Ctrl+C`
3. The application should display a cancellation message and exit cleanly

Alternatively, run the test script:

```bash
node test-ctrl-c.js
```

## Benefits

1. **Better User Experience**: Clean exit instead of stack traces
2. **Consistent Behavior**: All prompts handle cancellation the same way
3. **Maintainable Code**: Centralized cancellation logic
4. **Type Safety**: Proper handling of prompt return types
5. **Error Prevention**: Prevents runtime errors from cancelled prompts

## Notes

- The implementation uses `@clack/prompts`'s built-in cancellation detection
- Signal handlers are set up once at application startup
- All prompt calls now consistently check for cancellation
- The application exits with code 0 (success) when cancelled by user
