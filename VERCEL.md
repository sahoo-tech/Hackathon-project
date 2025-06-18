# Deploying VIRALYTIX to Vercel

This document provides instructions for deploying the VIRALYTIX project to Vercel.

## Project Structure

The VIRALYTIX project is a full-stack application with:
- React frontend in `VIRALYTIX/frontend`
- FastAPI backend in `VIRALYTIX/backend`

For Vercel deployment, we've configured the project to:
1. Deploy the React frontend as a static site
2. Use serverless functions to handle API requests

## Deployment Configuration

The project includes the following configuration files for Vercel:

- `vercel.json` - Main configuration file that tells Vercel how to build and serve the project
- `api/serverless.js` - Serverless function that handles API requests
- `VIRALYTIX/frontend/.env` - Environment variables for the frontend

## How to Deploy

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the following settings in the Vercel dashboard:
   - Framework Preset: Other
   - Build Command: `cd VIRALYTIX/frontend && npm install && npm run build`
   - Output Directory: `VIRALYTIX/frontend/build`
   - Install Command: `npm install`
   - Development Command: `cd VIRALYTIX/frontend && npm run start`

4. Add the following environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL`: `/api`
   - `REACT_APP_USE_MOCK_DATA`: `true`

5. Click "Deploy" and wait for the deployment to complete

## Troubleshooting

If you encounter a "Deployment not found" error:

1. Make sure your repository is properly connected to Vercel
2. Check that the build command and output directory are correctly configured
3. Verify that the `vercel.json` file is in the root of your repository
4. Check the Vercel deployment logs for any build errors

## Local Development

For local development:

1. Run the frontend: `cd VIRALYTIX/frontend && npm start`
2. The frontend will use mock data for API requests

## Notes

- This deployment uses mock data for all API endpoints
- In a production environment, you would need to deploy the FastAPI backend separately
- The serverless function in `api/serverless.js` provides mock responses for the Dark Web Surveillance feature