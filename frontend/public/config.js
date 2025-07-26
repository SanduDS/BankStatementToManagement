// Runtime configuration for the frontend application
// This file can be mounted/replaced at deployment time to configure the application
window.APP_CONFIG = {
  API_URL: 'http://localhost:8000',
  
  // Other configurable settings can be added here
  APP_NAME: 'Bank Statement Analyzer',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    PDF_GENERATION: true,
    ADVANCED_ANALYTICS: true
  }
};
