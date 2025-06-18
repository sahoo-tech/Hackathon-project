#!/bin/bash

# Print commands and their arguments as they are executed
set -x

# Exit immediately if a command exits with a non-zero status
set -e

# Go to frontend directory
cd VIRALYTIX/frontend

# Install dependencies
npm install --legacy-peer-deps

# Build the frontend
CI=false npm run build

# Return to root directory
cd ../..

echo "Build completed successfully!"