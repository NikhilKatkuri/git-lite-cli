import fs from 'fs';
import path from 'path';

function detectFramework(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return 'nodejs';  // fallback
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

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
        if (deps['koa']) return 'Koa.js';
        if (deps['fastify']) return 'Fastify';
        if (deps['hapi']) return 'Hapi.js';

        // fallback
        return 'nodejs';

    } catch (error) {
        console.log('❌ Error reading package.json:', error.message);
        return 'nodejs';
    }
}
 
export default detectFramework;