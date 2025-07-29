// Choreo runtime configuration for the frontend application
// This file can be mounted/replaced at deployment time to configure the application
window.configs = {
  apiUrl: '/choreo-apis/hellowproject/backend/v1',
  
  // Other configurable settings can be added here
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  
  // Feature flags
  features: {
    pdfGeneration: true,
    advancedAnalytics: true
  }
};
