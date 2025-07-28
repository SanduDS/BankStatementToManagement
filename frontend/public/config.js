// Runtime configuration for the frontend application
// This file can be modified at deployment time to configure the application
window.configs = {
  apiUrl: 'http://localhost:8000',
  
  // Other configurable settings can be added here
  appName: 'Bank Statement Analyzer',
  version: '1.0.0',
  
  // Feature flags
  features: {
    pdfGeneration: true,
    advancedAnalytics: true
  }
};
