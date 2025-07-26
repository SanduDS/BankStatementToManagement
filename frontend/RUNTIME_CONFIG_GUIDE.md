# Runtime Configuration Guide

This frontend application supports runtime configuration through a `config.js` file, eliminating the need to rebuild the Docker image when changing the backend URL or other settings.

## How It Works

1. **Build Time**: The application includes a default `config.js` file in the `public/` directory
2. **Runtime**: The `config.js` file can be mounted/replaced in the container to override configuration
3. **Fallback**: If runtime config is not available, the app falls back to build-time environment variables, then to localhost

## Configuration File Location

### For Nginx (Default)
```
/usr/share/nginx/html/config.js
```

### For Node.js Serve
```
/app/dist/config.js
```

## Configuration Options

```javascript
window.APP_CONFIG = {
  // Backend API URL (REQUIRED)
  API_URL: 'https://your-backend-url.com',
  
  // Application metadata
  APP_NAME: 'Bank Statement Analyzer',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    PDF_GENERATION: true,
    ADVANCED_ANALYTICS: true,
    DEBUG_MODE: false
  },
  
  // Timeout settings
  TIMEOUT_SETTINGS: {
    UPLOAD_TIMEOUT: 120000,  // 2 minutes
    REPORT_TIMEOUT: 30000    // 30 seconds
  }
};
```

## Deployment Methods

### Method 1: ConfigMap in Kubernetes (Recommended for Choreo)

1. **Create ConfigMap**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  config.js: |
    window.APP_CONFIG = {
      API_URL: 'https://your-backend.choreoapis.dev',
      APP_NAME: 'Bank Statement Analyzer',
      VERSION: '1.0.0',
      FEATURES: {
        PDF_GENERATION: true,
        ADVANCED_ANALYTICS: true
      }
    };
```

2. **Mount in Deployment**:
```yaml
spec:
  containers:
  - name: frontend
    volumeMounts:
    - name: config-volume
      mountPath: /usr/share/nginx/html/config.js
      subPath: config.js
  volumes:
  - name: config-volume
    configMap:
      name: frontend-config
```

### Method 2: Docker Volume Mount

```bash
# Create config file
cat > config.js << EOF
window.APP_CONFIG = {
  API_URL: 'https://your-backend-url.com'
};
EOF

# Run container with mounted config
docker run -d \
  -p 8080:80 \
  -v $(pwd)/config.js:/usr/share/nginx/html/config.js:ro \
  your-frontend-image
```

### Method 3: Build-time Copy

```dockerfile
# In your custom Dockerfile
FROM your-frontend-image
COPY custom-config.js /usr/share/nginx/html/config.js
```

## Choreo Deployment

### Option A: Use Choreo ConfigMap

1. Create a ConfigMap in Choreo with your config.js content
2. Mount it to `/usr/share/nginx/html/config.js`
3. Set the API_URL to your backend service URL

### Option B: Use Choreo Environment Injection

If Choreo supports environment variable injection at runtime, you can create a startup script:

```bash
#!/bin/sh
# startup.sh
cat > /usr/share/nginx/html/config.js << EOF
window.APP_CONFIG = {
  API_URL: '${BACKEND_URL}',
  APP_NAME: 'Bank Statement Analyzer',
  VERSION: '1.0.0'
};
EOF

nginx -g "daemon off;"
```

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
