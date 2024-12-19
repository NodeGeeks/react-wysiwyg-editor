import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { extname, join, relative } from 'path';

function copyCssFiles() {
    const srcDir = join(__dirname, '../src');
    const distDir = join(__dirname, '../dist');

    // Directories to exclude
    const excludeDirs = ['__tests__', '__mocks__', 'tests', 'test'];

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
    }

    function copyFiles(dir) {
        const files = readdirSync(dir);

        files.forEach(file => {
            const srcPath = join(dir, file);
            const relativePath = relative(srcDir, srcPath);
            const distPath = join(distDir, relativePath);

            // Skip if the current path includes any of the excluded directories
            if (excludeDirs.some(excludeDir => srcPath.includes(excludeDir))) {
                return;
            }

            if (statSync(srcPath).isDirectory()) {
                if (!existsSync(distPath)) {
                    mkdirSync(distPath, { recursive: true });
                }
                copyFiles(srcPath);
            } else if (extname(file) === '.css') {
                copyFileSync(srcPath, distPath);
                console.log(`Copied: ${relativePath}`);
            }
        });
    }

    copyFiles(srcDir);
}

// Run TypeScript compilation first
execSync('tsc', { stdio: 'inherit' });

// Then copy CSS files
copyCssFiles();
