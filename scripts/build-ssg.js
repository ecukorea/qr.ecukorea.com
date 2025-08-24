#!/usr/bin/env node

/**
 * Build script for Static Site Generation (SSG)
 * Handles the build process for the QR URL shortener
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building QR URL Shortener for Static Site Generation...\n');

try {
    // Step 1: Clean previous build
    console.log('1️⃣ Cleaning previous build...');
    if (fs.existsSync('out')) {
        fs.rmSync('out', { recursive: true, force: true });
    }
    if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
    }
    console.log('✅ Clean completed\n');

    // Step 2: Run Next.js build
    console.log('2️⃣ Running Next.js build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed\n');

    // Step 3: Create necessary files for static hosting
    console.log('3️⃣ Creating static hosting files...');

    // Create _redirects file for Netlify (if needed)
    const redirectsContent = `
# Redirect all unknown paths to index.html for client-side routing
/*    /index.html   200

# Handle specific routes
/qr-styler-demo/*  /qr-styler-demo/index.html  200
`;

    fs.writeFileSync(path.join('out', '_redirects'), redirectsContent.trim());

    // Create .nojekyll for GitHub Pages
    fs.writeFileSync(path.join('out', '.nojekyll'), '');

    // Create 404.html that redirects to index.html for client-side routing
    const custom404 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Redirect to index.html for client-side routing
    window.location.href = '/';
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
`;

    fs.writeFileSync(path.join('out', '404.html'), custom404.trim());

    console.log('✅ Static hosting files created\n');

    // Step 4: Verify build output
    console.log('4️⃣ Verifying build output...');
    const outDir = 'out';
    const requiredFiles = ['index.html', '_next', '404.html'];

    for (const file of requiredFiles) {
        const filePath = path.join(outDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Required file/directory missing: ${file}`);
        }
    }

    console.log('✅ Build verification completed\n');

    // Step 5: Display build summary
    console.log('📊 Build Summary:');
    console.log('================');

    const stats = fs.statSync(outDir);
    console.log(`📁 Output directory: ${outDir}/`);
    console.log(`📅 Build completed: ${stats.mtime.toLocaleString()}`);

    // Count files in output
    function countFiles(dir) {
        let count = 0;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                count += countFiles(itemPath);
            } else {
                count++;
            }
        }
        return count;
    }

    const fileCount = countFiles(outDir);
    console.log(`📄 Total files: ${fileCount}`);

    console.log('\n🎉 Static site generation completed successfully!');
    console.log('\n📋 Deployment Instructions:');
    console.log('==========================');
    console.log('1. Upload the "out/" directory to your static hosting provider');
    console.log('2. Configure your hosting to serve index.html for unknown routes');
    console.log('3. Ensure your hosting supports client-side routing');
    console.log('\n🌐 Recommended hosting providers:');
    console.log('• Vercel: Automatic deployment from Git');
    console.log('• Netlify: Drag & drop the "out" folder');
    console.log('• GitHub Pages: Push to gh-pages branch');
    console.log('• Cloudflare Pages: Connect your repository');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}