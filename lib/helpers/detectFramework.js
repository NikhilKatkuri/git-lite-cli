import fs from 'fs';
import path from 'path';

function detectFramework(projectPath) {
    const getRootFiles = () => {
        try {
            return fs.readdirSync(projectPath).filter(file =>
                fs.statSync(path.join(projectPath, file)).isFile()
            );
        } catch (error) {
            console.error('❌ Error reading directory:', error.message);
            return [];
        }
    };

    const rootFiles = getRootFiles();

    // ---- JS / TS / Frontend / Fullstack ----
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            if (deps['react-native']) return 'React Native';
            if (deps['react']) return 'React';
            if (deps['vue'] || deps['@vue/cli-service']) return 'Vue.js';
            if (deps['@angular/core']) return 'Angular';
            if (deps['svelte']) return 'Svelte';
            if (deps['next']) return 'Next.js';
            if (deps['nuxt']) return 'Nuxt.js';
            if (deps['gatsby']) return 'Gatsby';
            if (deps['remix']) return 'Remix';
            if (deps['astro']) return 'Astro';

            if (deps['express']) return 'Express.js';
            if (deps['nestjs'] || deps['@nestjs/core']) return 'NestJS';
            if (deps['fastify']) return 'Fastify';
            if (deps['koa']) return 'Koa.js';
            if (deps['hapi']) return 'Hapi.js';

            if (deps['electron']) return 'Electron (JavaScript)';
            if (deps['vite']) return 'vite';
            if (deps['webpack']) return 'webpack';

            return 'nodejs';
        } catch (error) {
            console.log('❌ Error reading package.json:', error.message);
            return 'nodejs';
        }
    }

    // ---- Python ----
    if (rootFiles.some(file => file.endsWith('.py'))) {
        if (fs.existsSync(path.join(projectPath, 'manage.py'))) return 'Django';
        if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
            const requirements = fs.readFileSync(path.join(projectPath, 'requirements.txt'), 'utf-8');
            if (requirements.includes('flask')) return 'Flask';
            if (requirements.includes('fastapi')) return 'FastAPI';
            if (requirements.includes('django')) return 'Django';
        }
        return 'python';
    }

    // ---- Java ----
    if (rootFiles.some(file => file.endsWith('.java'))) {
        if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
            const pom = fs.readFileSync(path.join(projectPath, 'pom.xml'), 'utf-8');
            if (pom.includes('spring-boot')) return 'Spring Boot';
            if (pom.includes('hibernate')) return 'Hibernate';
        }
        if (fs.existsSync(path.join(projectPath, 'build.gradle'))) {
            const gradle = fs.readFileSync(path.join(projectPath, 'build.gradle'), 'utf-8');
            if (gradle.includes('spring-boot')) return 'Spring Boot';
        }
        return 'java';
    }

    // Fallback
    return 'unknown';
}
 
export default detectFramework;
