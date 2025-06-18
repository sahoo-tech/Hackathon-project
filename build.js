// Simple build script for Vercel deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the api directory exists
if (!fs.existsSync(path.join(__dirname, 'api'))) {
  fs.mkdirSync(path.join(__dirname, 'api'));
}

// Build the frontend
console.log('Building frontend...');
try {
  execSync('cd VIRALYTIX/frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build successful!');
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}

console.log('Build completed successfully!');