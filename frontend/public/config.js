// Runtime configuration for the frontend application
// This file can be mounted/replaced at deployment time to configure the application
window.APP_CONFIG = {
  API_URL: 'https://30ea7c26-925d-4678-a19d-cf800a59a6bd-dev.e1-us-east-azure.choreoapis.dev/default/bankstatmanagerservice/v1.0',
  
  // Other configurable settings can be added here
  APP_NAME: 'Bank Statement Analyzer',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    PDF_GENERATION: true,
    ADVANCED_ANALYTICS: true
  }
};
