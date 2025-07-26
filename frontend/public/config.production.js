// Choreo production configuration template
// This file should be mounted/replaced in production deployments
// Mount this as config.js in the Choreo deploy page

window.configs = {
  // Choreo managed service URL - relative path is preferred
  apiUrl: '/choreo-apis/default/bankstatmanagerservice/v1',
  
  // For external APIs or different environments, use full URLs:
  // apiUrl: 'https://your-backend-service.choreoapis.dev',
  
  // Application metadata
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  
  // Feature flags - can be used to enable/disable features at runtime
  features: {
    pdfGeneration: true,
    advancedAnalytics: true,
    debugMode: false
  },
  
  // Other configurable settings
  timeoutSettings: {
    uploadTimeout: 120000,  // 2 minutes
    reportTimeout: 30000    // 30 seconds
  }
};
