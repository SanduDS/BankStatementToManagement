# Frontend Deployment Guide for Choreo

This guide explains how to deploy the Bank Statement Analyzer frontend to WSO2 Choreo.

## Prerequisites

1. WSO2 Choreo account
2. GitHub repository with the frontend code
3. Backend API deployed and accessible

## Deployment Steps

### 1. Prepare the Environment

1. Update the `.env` file with your production API URL:
   ```bash
   cp .env.production.template .env.production
   # Edit .env.production with your actual backend URL
   ```

2. Test the build locally:
   ```bash
   npm install
   npm run build
   npm run preview
   ```

### 2. Deploy to Choreo

1. **Create a New Component**:
   - Log in to Choreo Console
   - Click "Create" → "Web Application"
   - Connect your GitHub repository
   - Select the frontend folder as the build path

2. **Configure Build Settings**:
   - Build Context: `/frontend`
   - Dockerfile: `./Dockerfile`
   - Port: `80`

3. **Set Environment Variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.choreoapis.dev`)

4. **Deploy**:
   - Click "Deploy" to build and deploy your application
   - Monitor the build logs for any issues

### 3. Configuration Details

#### Dockerfile
The included `Dockerfile` uses a multi-stage build:
- **Build stage**: Uses Node.js to build the React application
- **Production stage**: Uses Nginx to serve the static files

#### Nginx Configuration
The `nginx.conf` file includes:
- Client-side routing support
- Static asset caching
- Security headers
- Gzip compression

#### Environment Variables
- `VITE_API_URL`: The base URL for your backend API
- Environment variables must be prefixed with `VITE_` to be accessible in the frontend

### 4. Post-Deployment

1. **Test the Application**:
   - Visit your deployed URL
   - Test file upload functionality
   - Verify API connectivity

2. **Monitor**:
   - Check Choreo logs for any runtime issues
   - Monitor API calls and responses

3. **Update API URL**:
   - If your backend URL changes, update the `VITE_API_URL` environment variable
   - Redeploy the application

## Troubleshooting

### Build Issues
- Ensure all dependencies are properly listed in `package.json`
- Check that the build completes successfully locally
- Verify Docker build works: `docker build -t frontend .`

### Runtime Issues
- Check browser console for JavaScript errors
- Verify API URL is correctly set and accessible
- Ensure CORS is properly configured on the backend

### API Connectivity
- Test API endpoints directly from browser dev tools
- Verify backend is deployed and accessible
- Check network requests in browser developer tools

## File Structure

```
frontend/
├── .choreo/
│   └── component.yaml       # Choreo component configuration
├── public/                  # Static assets
├── src/                    # React source code
├── .choreoignore           # Files to ignore during deployment
├── .env                    # Local environment variables
├── .env.production.template # Production environment template
├── Dockerfile              # Container build instructions
├── nginx.conf              # Nginx server configuration
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite build configuration
```

## Security Considerations

1. **Environment Variables**: Never commit production API keys to version control
2. **CORS**: Ensure backend CORS settings allow your frontend domain
3. **HTTPS**: Always use HTTPS in production
4. **Content Security Policy**: Consider adding CSP headers for additional security

## Performance Optimization

1. **Code Splitting**: The build is configured to split vendor libraries
2. **Caching**: Static assets are cached for 1 year
3. **Compression**: Gzip compression is enabled
4. **Minification**: JavaScript and CSS are minified in production builds
