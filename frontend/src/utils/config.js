// Utility functions for accessing Choreo runtime configuration

/**
 * Get the API URL from runtime configuration
 * Falls back to environment variable, then to localhost
 * Follows Choreo's recommended pattern
 */
export const getApiUrl = () => {
  // First try Choreo runtime config (mounted config.js)
  if (window.configs && window.configs.apiUrl) {
    return window.configs.apiUrl;
  }
  
  // Fallback to legacy config for backward compatibility
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
 * Supports both Choreo's window.configs and legacy window.APP_CONFIG
 */
export const getAppConfig = () => {
  // Prefer Choreo's convention
  if (window.configs) {
    return {
      API_URL: getApiUrl(),
      APP_NAME: window.configs.appName || 'Bank Statement Analyzer',
      VERSION: window.configs.version || '1.0.0',
      FEATURES: {
        PDF_GENERATION: window.configs.features?.pdfGeneration ?? true,
        ADVANCED_ANALYTICS: window.configs.features?.advancedAnalytics ?? true
      },
      TIMEOUT_SETTINGS: window.configs.timeoutSettings || {
        UPLOAD_TIMEOUT: 120000,
        REPORT_TIMEOUT: 30000
      }
    };
  }
  
  // Fallback to legacy config
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
