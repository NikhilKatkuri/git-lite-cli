# Contributing to git-lite CLI

Thank you for considering contributing to git-lite CLI! We welcome contributions from developers of all skill levels. This document provides guidelines and information on how to contribute to the project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and constructive in all interactions.

## Ways to Contribute

- **Bug Reports**: Report bugs and issues you encounter
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes, new features, or improvements
- **Documentation**: Improve documentation, README, or examples
- **Testing**: Help test new features and report issues

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- GitHub account

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/your-username/git-lite-cli.git
   cd git-lite-cli
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/NikhilKatkuri/git-lite-cli.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Build the project**:

   ```bash
   npm run build
   ```

6. **Test the CLI**:
   ```bash
   npm run cli
   ```

## Development Workflow

### Before You Start

1. **Check existing issues** to see if your bug/feature is already being worked on
2. **Create an issue** for new bugs or features to discuss the approach
3. **Assign yourself** to the issue you want to work on

### Making Changes

1. **Create a new branch** for your feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with clear, descriptive messages

### Commit Message Guidelines

We follow conventional commit standards:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:

```
feat: add branch deletion functionality
fix: resolve authentication token validation issue
docs: update installation instructions
```

### Code Style and Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **File Structure**: Follow the existing project structure

#### Before Committing

Run these commands to ensure code quality:

```bash
# Check formatting and linting
npm run check

# Auto-fix formatting and linting issues
npm run fix

# Build to ensure no compilation errors
npm run build
```

## Testing

Currently, the project doesn't have automated tests, but manual testing is crucial:

1. **Test the CLI** with `npm run cli`
2. **Test all features** you've modified
3. **Test edge cases** and error scenarios
4. **Ensure authentication works** with GitHub tokens
5. **Test on different operating systems** if possible

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:

   ```bash
   git push origin your-branch-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to related issues (if any)
   - Screenshots or examples (if applicable)

### Pull Request Guidelines

- **Keep PRs focused**: One feature or fix per PR
- **Write clear descriptions**: Explain what, why, and how
- **Include tests**: Add or update tests when applicable
- **Update documentation**: Update README or docs if needed
- **Be responsive**: Address review feedback promptly

## Project Structure

Understanding the codebase structure will help you contribute effectively:

```
src/
├── index.ts              # Main entry point
├── auth/                 # Authentication modules
├── services/             # Core services (create, push, etc.)
├── tasks/                # Task handlers
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Feature Development Guidelines

### Adding New Commands

1. Create the command logic in `src/services/` or `src/tasks/`
2. Add the command option to `src/services/cli.ts`
3. Add the command handler to the switch statement in `src/index.ts`
4. Test the command thoroughly

### Adding New Utilities

1. Place utility functions in `src/utils/`
2. Follow existing naming conventions
3. Add appropriate TypeScript types
4. Document complex functions

## Reporting Issues

### Bug Reports

Include the following information:

- **Environment**: OS, Node.js version, npm version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Error messages**: Full error output
- **Screenshots**: If applicable

### Feature Requests

Include the following information:

- **Problem**: What problem does this solve?
- **Solution**: Describe your proposed solution
- **Alternatives**: Any alternative solutions considered
- **Use cases**: How would this feature be used?

## Getting Help

- **GitHub Issues**: For bugs, features, and general questions
- **GitHub Discussions**: For community discussions
- **Documentation**: Check README.md and inline code comments

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Special mentions for outstanding contributions

## Questions?

If you have any questions about contributing, feel free to:

- Open an issue for discussion
- Reach out to [@NikhilKatkuri](https://github.com/NikhilKatkuri)

Thank you for contributing to git-lite CLI! 🚀
