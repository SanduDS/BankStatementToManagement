// Utility functions for accessing runtime configuration

/**
 * Get the API URL from runtime configuration
 * Falls back to environment variable, then to localhost
 */
export const getApiUrl = () => {
  // First try runtime config (mounted config.js)
  if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // Fallback to build-time environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Final fallback
  return 'http://localhost:8000';
};

/**
 * Get application configuration
 */
export const getAppConfig = () => {
  return window.APP_CONFIG || {
    API_URL: getApiUrl(),
    APP_NAME: 'Bank Statement Analyzer',
    VERSION: '1.0.0',
    FEATURES: {
      PDF_GENERATION: true,
      ADVANCED_ANALYTICS: true
    }
  };
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  const config = getAppConfig();
  return config.FEATURES && config.FEATURES[featureName] === true;
};
