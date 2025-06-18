// Build script for Vercel deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the api directory exists
if (!fs.existsSync(path.join(__dirname, 'api'))) {
  fs.mkdirSync(path.join(__dirname, 'api'));
}

// Function to execute commands with proper error handling
function runCommand(command, cwd = __dirname) {
  try {
    console.log(`Running command: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      cwd: cwd
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Main build process
async function build() {
  console.log('Starting build process...');
  
  // Navigate to frontend directory and install dependencies
  const frontendPath = path.join(__dirname, 'VIRALYTIX', 'frontend');
  
  console.log('Installing frontend dependencies...');
  if (!runCommand('npm install', frontendPath)) {
    console.error('Failed to install frontend dependencies');
    process.exit(1);
  }
  
  console.log('Building frontend...');
  if (!runCommand('npm run build', frontendPath)) {
    console.error('Failed to build frontend');
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
}

// Run the build
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});