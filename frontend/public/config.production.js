// Production configuration template
// This file should be mounted/replaced in production deployments
// at /usr/share/nginx/html/config.js (for nginx) or /app/dist/config.js (for other setups)

window.APP_CONFIG = {
  // Replace this with your actual backend URL
  API_URL: 'https://your-backend-service.choreoapis.dev',
  
  // Application metadata
  APP_NAME: 'Bank Statement Analyzer',
  VERSION: '1.0.0',
  
  // Feature flags - can be used to enable/disable features at runtime
  FEATURES: {
    PDF_GENERATION: true,
    ADVANCED_ANALYTICS: true,
    DEBUG_MODE: false
  },
  
  // Other configurable settings
  TIMEOUT_SETTINGS: {
    UPLOAD_TIMEOUT: 120000,  // 2 minutes
    REPORT_TIMEOUT: 30000    // 30 seconds
  }
};
