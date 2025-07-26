# WSO2 Choreo Deployment Guide

This guide explains how to deploy the Bank Statement Analyzer API to WSO2 Choreo.

## Prerequisites

1. **WSO2 Choreo Account**: Sign up at [https://console.choreo.dev/](https://console.choreo.dev/)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Set up the required environment variables

## Required Environment Variables

In WSO2 Choreo, you need to configure these environment variables:

```
ANTHROPIC_API_KEY=your_claude_api_key_here
ENVIRONMENT=production
```

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository has the following structure:
```
backend/
├── .choreo/
│   └── component.yaml
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── routes/
│   └── services/
├── Dockerfile
├── requirements.txt
├── .dockerignore
└── README.md
```

### 2. Create a New Component in Choreo

1. Log in to [WSO2 Choreo Console](https://console.choreo.dev/)
2. Click **"Create"** → **"Service"** → **"Web Application"**
3. Choose **"Bring Your Own Dockerfile"**
4. Connect your GitHub repository
5. Select the `backend` folder as the build context
6. Set the Dockerfile path to `./Dockerfile`

### 3. Configure Environment Variables

1. Go to **"Configurations"** → **"Environment Variables"**
2. Add the following variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `ENVIRONMENT`: Set to `production`

### 4. Deploy the Application

1. Click **"Deploy"** in the Choreo console
2. Wait for the build and deployment to complete
3. Note the generated API endpoint URL

### 5. Test the Deployment

Once deployed, your API will be available at:
```
https://your-app-name-xxxx.choreoapis.dev
```

Test endpoints:
- Health check: `GET /health`
- API documentation: `GET /docs`
- Upload endpoint: `POST /api/upload/`
- Report generation: `POST /api/generate-report/`

### 6. Update Frontend Configuration

Update your frontend to use the deployed API URL instead of localhost.

## Configuration Files Explained

### .choreo/component.yaml
Defines the component configuration for Choreo deployment including:
- Build configuration (Dockerfile path)
- Service endpoints with proper port mapping
- Environment variables
- Component metadata

Key sections:
```yaml
build:
  dockerfile: ./Dockerfile

endpoints:
  - name: api
    service:
      port: 8080  # Required field for Choreo
    type: REST
    path: /
    visibility: Public
```

### Dockerfile
Multi-stage build configuration optimized for:
- Small image size
- Security (non-root user)
- Python dependencies
- Port 8080 (required by Choreo)

### requirements.txt
Cleaned up dependencies list with only essential packages for production.

## Production Considerations

1. **Security**: 
   - API keys are managed through environment variables
   - CORS is configured for production domains

2. **Performance**:
   - Resource limits are set in component.yaml
   - Health checks ensure service availability

3. **Monitoring**:
   - Use Choreo's built-in monitoring
   - Check logs in the Choreo console

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Dockerfile syntax
   - Verify requirements.txt has correct versions
   - Ensure all Python imports are available

2. **Runtime Errors**:
   - Check environment variables are set
   - Verify API key is valid
   - Check application logs in Choreo console

3. **CORS Issues**:
   - Update CORS origins in main.py
   - Add your frontend domain to allowed origins

### Getting Logs:
```bash
# Access logs through Choreo console
# Go to: Observability → Logs
```

## Next Steps

After successful deployment:
1. Update frontend to use the new API URL
2. Test all functionality end-to-end
3. Set up monitoring and alerts
4. Configure custom domain (optional)

## Support

For Choreo-specific issues, refer to:
- [WSO2 Choreo Documentation](https://wso2.com/choreo/docs/)
- [Choreo Community Forum](https://github.com/wso2/choreo-samples/discussions)
