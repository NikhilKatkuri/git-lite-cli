# Authentication Setup for Git Lite CLI

This guide explains how to set up GitHub authentication for Git Lite CLI to access your GitHub repositories.

## Why Authentication is Needed

Git Lite CLI uses GitHub's API to provide enhanced features like:

- Repository cloning with additional metadata
- Enhanced synchronization with GitHub
- Better error handling and diagnostics
- Integration with GitHub-specific features

## Creating a GitHub Personal Access Token

### Step 1: Access GitHub Token Settings

1. Log in to your GitHub account
2. Click on your profile picture in the top-right corner
3. Select "Settings" from the dropdown menu
4. In the left sidebar, scroll down and click "Developer settings"
5. Click "Personal access tokens"
6. Select "Tokens (classic)"

### Step 2: Generate New Token

1. Click "Generate new token"
2. Select "Generate new token (classic)"
3. Give your token a descriptive name like "Git Lite CLI"
4. Set an expiration date (recommended: 90 days for security)

### Step 3: Select Required Permissions

For Git Lite CLI to work properly, select these scopes:

**Required permissions:**

- `repo` - Full control of private repositories
- `user:email` - Access user email addresses
- `read:user` - Read access to user profile information

**Optional permissions for enhanced features:**

- `workflow` - Update GitHub Action workflows (if you work with GitHub Actions)
- `admin:repo_hook` - Repository hooks (for advanced repository management)

### Step 4: Generate and Copy Token

1. Click "Generate token" at the bottom of the page
2. Copy the token immediately (you won't be able to see it again)
3. Store it securely - treat it like a password

## Adding Token to Git Lite CLI

Run the authentication command and follow the prompts:

```bash
glc auth
```

Enter your GitHub token when prompted. The CLI will securely store it for future use.

## Verifying Authentication

Check if authentication is working:

```bash
glc whoami
```

This command should display your GitHub username and associated email if authentication is successful.

## Security Best Practices

1. **Never share your token** - Keep it confidential
2. **Set expiration dates** - Regularly rotate tokens
3. **Use minimal permissions** - Only grant necessary scopes
4. **Revoke unused tokens** - Clean up old tokens in GitHub settings
5. **Store securely** - Don't commit tokens to repositories

## Troubleshooting

### Token Not Working

- Verify the token has the correct permissions
- Check if the token has expired
- Ensure you copied the complete token without extra spaces

### Permission Denied Errors

- Make sure your token has the `repo` scope
- Check if you have access to the repository you're trying to access

### Token Storage Issues

- Try running `glc auth` again to reset stored credentials
- Check if environment variables are set correctly

## Revoking Access

To revoke Git Lite CLI access:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Find your Git Lite CLI token
3. Click "Delete" or "Revoke"
4. Run `glc auth` to remove stored credentials from your local machine

## Support

If you encounter authentication issues:

1. Check this guide first
2. Verify your token permissions
3. Open an issue on the GitHub repository with details about your problem
