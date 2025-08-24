import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the package version from package.json
 */
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch {
    return '2.0.0'; // fallback version
  }
}

/**
 * Display version information
 */
export function showVersion(): void {
  const version = getVersion();
  console.log(`git-lite-cli v${version}`);
  console.log('A lightweight CLI tool for seamless GitHub automation');
}

/**
 * Display help information
 */
export function showHelp(): void {
  const version = getVersion();
  console.log(`git-lite-cli v${version}`);
  console.log('A lightweight CLI tool for seamless GitHub automation');
  console.log('');
  console.log('Usage:');
  console.log('  git-lite-cli                Run the interactive CLI');
  console.log('');
  console.log('Options:');
  console.log('  -v, --version              Show version number');
  console.log('  -h, --help                 Show help information');
  console.log('');
  console.log('Features:');
  console.log('  • Create GitHub repositories (public/private)');
  console.log('  • Push local projects to GitHub');
  console.log('  • Clone repositories interactively');
  console.log('  • Branch management');
  console.log('  • Commit management');
  console.log('  • Pull updates from repositories');
  console.log('  • Generate .gitignore files');
  console.log('  • Profile management');
  console.log('');
  console.log('Examples:');
  console.log('  git-lite-cli               Start the interactive CLI');
  console.log('  git-lite-cli --version     Show version');
  console.log('  git-lite-cli --help        Show this help');
  console.log('');
  console.log('Repository: https://github.com/NikhilKatkuri/git-lite-cli');
  console.log('Issues: https://github.com/NikhilKatkuri/git-lite-cli/issues');
}

/**
 * Parse command line arguments and handle them
 * Returns true if an argument was handled (and program should exit)
 * Returns false if no arguments were handled (and program should continue)
 */
export function handleCliArgs(): boolean {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return false; // No arguments, continue with interactive mode
  }

  const firstArg = args[0];
  if (!firstArg) {
    return false; // No first argument, continue with interactive mode
  }

  const arg = firstArg.toLowerCase();

  switch (arg) {
    case '-v':
    case '--version':
      showVersion();
      return true;

    case '-h':
    case '--help':
    case 'help':
      showHelp();
      return true;

    default:
      console.log(`Unknown option: ${args[0]}`);
      console.log('Run "git-lite-cli --help" for usage information.');
      return true;
  }
}
