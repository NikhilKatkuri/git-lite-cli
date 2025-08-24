import { text, select, confirm } from '@clack/prompts';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { get } from 'https';
import { IncomingMessage } from 'http';

interface DetectedFramework {
  name: string;
  confidence: number;
  template: string;
  githubTemplate?: string; // GitHub template name
}

// Map of framework names to GitHub gitignore template names
const GITHUB_TEMPLATES = {
  'Node.js': 'Node',
  React: 'Node',
  'Next.js': 'Node',
  'Vue.js': 'Node',
  Angular: 'Node',
  TypeScript: 'Node',
  Python: 'Python',
  Java: 'Java',
  Go: 'Go',
  Rust: 'Rust',
  'C++': 'C++',
  'C#': 'VisualStudio',
  Swift: 'Swift',
  Kotlin: 'Kotlin',
  Ruby: 'Ruby',
  PHP: 'PHP',
  Dart: 'Dart',
  Flutter: 'Dart',
  Unity: 'Unity',
  Android: 'Android',
  iOS: 'Swift',
  WordPress: 'WordPress',
  Laravel: 'Laravel',
  Django: 'Python',
  Rails: 'Rails',
};

async function fetchGitHubTemplate(templateName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/github/gitignore/main/${templateName}.gitignore`;

    const req = get(url, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch template: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function getTemplateContent(
  framework: DetectedFramework
): Promise<string> {
  if (framework.githubTemplate) {
    try {
      console.log(`Fetching ${framework.name} template from GitHub...`);
      const template = await fetchGitHubTemplate(framework.githubTemplate);
      return template;
    } catch (error) {
      console.warn(
        `Failed to fetch GitHub template for ${framework.name}, using fallback:`,
        error
      );
      return framework.template; // Fallback to local template
    }
  }
  return framework.template;
}

async function getPopularTemplates(): Promise<DetectedFramework[]> {
  const popularTemplates = [
    'Node',
    'Python',
    'Java',
    'Go',
    'Rust',
    'C++',
    'VisualStudio',
    'Swift',
    'Android',
    'Unity',
    'Laravel',
    'Rails',
    'WordPress',
    'Dart',
    'Kotlin',
    'Ruby',
    'PHP',
  ];

  return popularTemplates.map((template) => ({
    name: template,
    confidence: 100,
    template: getGenericGitignore(),
    githubTemplate: template,
  }));
}

async function detectFramework(dir: string): Promise<DetectedFramework[]> {
  const readDir = readdirSync(dir);
  const frameworks: DetectedFramework[] = [];

  // Check if package.json exists for Node.js projects
  if (readDir.includes('package.json')) {
    try {
      const packageJson = JSON.parse(
        readFileSync(path.join(dir, 'package.json'), 'utf8')
      );
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Next.js detection (check before React since Next.js includes React)
      if (dependencies.next) {
        frameworks.push({
          name: 'Next.js',
          confidence: 95,
          template: getNextjsGitignore(),
          githubTemplate: GITHUB_TEMPLATES['Next.js'],
        });
      }
      // React detection
      else if (dependencies.react || dependencies['@types/react']) {
        frameworks.push({
          name: 'React',
          confidence: 90,
          template: getReactGitignore(),
          githubTemplate: GITHUB_TEMPLATES['React'],
        });
      }

      // Vue detection
      if (dependencies.vue || dependencies['@vue/cli']) {
        frameworks.push({
          name: 'Vue.js',
          confidence: 90,
          template: getVueGitignore(),
          githubTemplate: GITHUB_TEMPLATES['Vue.js'],
        });
      }

      // Angular detection
      if (dependencies['@angular/core']) {
        frameworks.push({
          name: 'Angular',
          confidence: 95,
          template: getAngularGitignore(),
          githubTemplate: GITHUB_TEMPLATES['Angular'],
        });
      }

      // Express/Node.js detection
      if (dependencies.express || dependencies.fastify || dependencies.koa) {
        frameworks.push({
          name: 'Node.js/Express',
          confidence: 80,
          template: getNodeGitignore(),
          githubTemplate: GITHUB_TEMPLATES['Node.js'],
        });
      }

      // TypeScript detection
      if (dependencies.typescript || readDir.includes('tsconfig.json')) {
        frameworks.push({
          name: 'TypeScript',
          confidence: 85,
          template: getTypescriptGitignore(),
          githubTemplate: GITHUB_TEMPLATES['TypeScript'],
        });
      }

      // Generic Node.js if no specific framework detected but package.json exists
      if (frameworks.length === 0) {
        frameworks.push({
          name: 'Node.js',
          confidence: 70,
          template: getNodeGitignore(),
          githubTemplate: GITHUB_TEMPLATES['Node.js'],
        });
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
    }
  }

  // Go detection
  if (readDir.includes('go.mod') || readDir.includes('go.sum')) {
    frameworks.push({
      name: 'Go',
      confidence: 95,
      template: getGenericGitignore(),
      githubTemplate: GITHUB_TEMPLATES['Go'],
    });
  }

  // Rust detection
  if (readDir.includes('Cargo.toml')) {
    frameworks.push({
      name: 'Rust',
      confidence: 95,
      template: getGenericGitignore(),
      githubTemplate: GITHUB_TEMPLATES['Rust'],
    });
  }

  // Python detection
  if (
    readDir.includes('requirements.txt') ||
    readDir.includes('pyproject.toml') ||
    readDir.includes('setup.py') ||
    readDir.includes('Pipfile')
  ) {
    frameworks.push({
      name: 'Python',
      confidence: 90,
      template: getPythonGitignore(),
      githubTemplate: GITHUB_TEMPLATES['Python'],
    });
  }

  // Java detection
  if (readDir.includes('pom.xml') || readDir.includes('build.gradle')) {
    frameworks.push({
      name: 'Java',
      confidence: 90,
      template: getJavaGitignore(),
      githubTemplate: GITHUB_TEMPLATES['Java'],
    });
  }

  // C# detection
  if (
    readDir.some((file) => file.endsWith('.csproj') || file.endsWith('.sln'))
  ) {
    frameworks.push({
      name: 'C#',
      confidence: 90,
      template: getGenericGitignore(),
      githubTemplate: GITHUB_TEMPLATES['C#'],
    });
  }

  // Unity detection
  if (readDir.includes('Assets') && readDir.includes('ProjectSettings')) {
    frameworks.push({
      name: 'Unity',
      confidence: 95,
      template: getGenericGitignore(),
      githubTemplate: GITHUB_TEMPLATES['Unity'],
    });
  }

  // Generic fallback
  if (frameworks.length === 0) {
    frameworks.push({
      name: 'Generic',
      confidence: 50,
      template: getGenericGitignore(),
    });
  }

  return frameworks.sort((a, b) => b.confidence - a.confidence);
}

function getReactGitignore(): string {
  return `# Dependencies
node_modules/
/.pnp
.pnp.js

# Production build
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getNextjsGitignore(): string {
  return `# Dependencies
node_modules/
/.pnp
.pnp.js

# Production build
/.next/
/out/

# Environment variables
.env*.local

# Vercel
.vercel

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getVueGitignore(): string {
  return `# Dependencies
node_modules/

# Production build
/dist/

# Local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getAngularGitignore(): string {
  return `# Dependencies
node_modules/

# Production build
/dist/
/tmp/
/out-tsc/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# IDE - IntelliJ
.idea/
*.iml
*.ipr
*.iws

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db

# Angular specific
.angular/cache
.sass-cache/
connect.lock
typings/`;
}

function getNodeGitignore(): string {
  return `# Dependencies
node_modules/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getTypescriptGitignore(): string {
  return `# Dependencies
node_modules/

# Compiled output
/dist/
/build/
*.js
*.js.map
*.d.ts

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getPythonGitignore(): string {
  return `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getJavaGitignore(): string {
  return `# Compiled class file
*.class

# Log file
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs
hs_err_pid*

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# Gradle
.gradle
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# IDE
.idea/
*.iws
*.iml
*.ipr
out/
.vscode/

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db`;
}

function getGenericGitignore(): string {
  return `# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Environment variables
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# Git-lite CLI
.gitlite/

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
*~

# Build outputs
dist/
build/
output/`;
}

export default async function gitIgnoreGen() {
  const selectedDir = (await text({
    message: 'Which directory do you want to generate the .gitignore file in?',
    placeholder: '. (current directory)',
    defaultValue: '.',
  })) as string;

  const dir = path.resolve(process.cwd(), selectedDir || '.');

  console.log(`\nAnalyzing directory: ${dir}`);

  const frameworks = await detectFramework(dir);

  // Ask user if they want to use detected frameworks or browse popular templates
  const useDetected =
    frameworks.length > 0
      ? await select({
          message: 'How would you like to generate your .gitignore?',
          options: [
            {
              value: 'detected',
              label: `Use detected frameworks (${frameworks.length} found)`,
            },
            {
              value: 'browse',
              label: 'Browse popular templates from GitHub',
            },
            {
              value: 'generic',
              label: 'Use generic template',
            },
          ],
        })
      : 'browse';

  let availableFrameworks: DetectedFramework[];

  if (useDetected === 'detected' && frameworks.length > 0) {
    availableFrameworks = frameworks;
    console.log('\nDetected frameworks:');
    frameworks.forEach((fw, index) => {
      console.log(`${index + 1}. ${fw.name} (confidence: ${fw.confidence}%)`);
    });
  } else if (useDetected === 'browse') {
    console.log('\nFetching popular templates from GitHub...');
    availableFrameworks = await getPopularTemplates();
  } else {
    availableFrameworks = [
      {
        name: 'Generic',
        confidence: 50,
        template: getGenericGitignore(),
      },
    ];
  }

  let selectedFramework: DetectedFramework;

  if (availableFrameworks.length === 1) {
    const useDetected = await confirm({
      message: `Use template: ${availableFrameworks[0]?.name ?? 'Unknown'}?`,
    });

    selectedFramework =
      useDetected && availableFrameworks[0]
        ? availableFrameworks[0]
        : { name: 'Generic', confidence: 50, template: getGenericGitignore() };
  } else {
    const choice = (await select({
      message: 'Select a template:',
      options: [
        ...availableFrameworks.map((fw, index) => ({
          value: index,
          label:
            useDetected === 'detected'
              ? `${fw.name} (confidence: ${fw.confidence}%)`
              : fw.name,
        })),
        {
          value: -1,
          label: 'Generic template',
        },
      ],
    })) as number;

    selectedFramework =
      choice === -1 || availableFrameworks[choice] === undefined
        ? { name: 'Generic', confidence: 50, template: getGenericGitignore() }
        : availableFrameworks[choice];
  }

  const gitignorePath = path.join(dir, '.gitignore');

  if (existsSync(gitignorePath)) {
    const overwrite = await confirm({
      message: '.gitignore file already exists. Overwrite it?',
    });

    if (!overwrite) {
      console.log('Operation cancelled.');
      return;
    }
  }

  try {
    const templateContent = await getTemplateContent(selectedFramework);
    writeFileSync(gitignorePath, templateContent);
    console.log(
      `\n.gitignore file generated successfully for ${selectedFramework.name}!`
    );
    console.log(`Location: ${gitignorePath}`);
  } catch (error) {
    console.error('Error writing .gitignore file:', error);
  }
}
