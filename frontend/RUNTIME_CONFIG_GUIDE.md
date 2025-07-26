# Choreo Runtime Configuration Guide

This frontend application supports Choreo's recommended runtime configuration pattern using a `config.js` file that can be mounted at deployment time without rebuilding the Docker image.

## How It Works (Choreo Pattern)

1. **Build Time**: The application includes a default `config.js` file in the `public/` directory
2. **Runtime**: The `config.js` file can be mounted/replaced in Choreo's deployment configuration
3. **Fallback**: If runtime config is not available, the app falls back to build-time environment variables, then to localhost

## Configuration File Format (Choreo Standard)

```javascript
window.configs = {
  // Relative path for Choreo managed services (recommended)
  apiUrl: '/choreo-apis/default/bankstatmanagerservice/v1',
  
  // Or absolute URL for external services
  // apiUrl: 'https://your-external-api.com/api/v1',
  
  // Application metadata
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  
  // Feature flags
  features: {
    pdfGeneration: true,
    advancedAnalytics: true
  }
};
```

## Choreo Deployment Configuration

### Step 1: Create config.js Content
```javascript
window.configs = {
  apiUrl: '/choreo-apis/default/bankstatmanagerservice/v1',
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  features: {
    pdfGeneration: true,
    advancedAnalytics: true
  }
};
```

### Step 2: Mount in Choreo Deploy Page
1. Go to your web application in Choreo Console
2. Navigate to the **Deploy** page
3. In the **Configure and Deploy** pane, find **File Mounts**
4. Click **Add File Mount**
5. Set:
   - **Mount Path**: `/usr/share/nginx/html/config.js`
   - **Content**: Paste your config.js content above
6. Deploy your application

### Step 3: Verify Configuration
Visit `https://your-app-url/config-test.html` to verify the configuration is loaded correctly.

## Testing Configuration

### Local Testing
```bash
# Start the application
npm run dev

# Check current config in browser console
console.log(window.APP_CONFIG);

# Test config utility
import { getApiUrl, getAppConfig } from './utils/config';
console.log('API URL:', getApiUrl());
console.log('Full config:', getAppConfig());
```

### Production Testing
```bash
# Check if config is loaded
curl http://your-app-url/config.js

# Verify in browser
# Open browser dev tools and check:
console.log(window.APP_CONFIG);
```

## Benefits

1. **No Rebuild Required**: Change configuration without rebuilding the Docker image
2. **Environment Specific**: Different configs for dev, staging, production
3. **Feature Flags**: Enable/disable features at runtime
4. **Easy Maintenance**: Configuration is separate from application code
5. **Kubernetes Native**: Works well with ConfigMaps and Secrets

## Troubleshooting

### Config Not Loading
- Check that `/config.js` is accessible at `http://your-app/config.js`
- Verify the config.js file syntax (valid JavaScript)
- Check browser console for errors

### API Calls Failing
- Verify the API_URL in config.js is correct
- Check CORS settings on the backend
- Confirm the backend is accessible from the frontend's network

### Fallback Behavior
The application will use this priority order:
1. `window.APP_CONFIG.API_URL` (runtime config)
2. `import.meta.env.VITE_API_URL` (build-time env var)
3. `http://localhost:8000` (default fallback)

## Example Production Deployment

```yaml
# choreo-frontend-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  config.js: |
    window.APP_CONFIG = {
      API_URL: 'https://bank-statement-backend.choreoapis.dev',
      APP_NAME: 'Bank Statement Analyzer',
      VERSION: '1.0.0',
      FEATURES: {
        PDF_GENERATION: true,
        ADVANCED_ANALYTICS: true,
        DEBUG_MODE: false
      }
    };
---
# The rest of your deployment will be handled by Choreo
```

This approach provides maximum flexibility for deployment while maintaining the ability to use the same Docker image across all environments.
