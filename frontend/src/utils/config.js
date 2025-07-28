// Utility functions for accessing runtime configuration

/**
 * Get the API URL for the backend service
 * Priority order:
 * 1. Runtime config (mounted config.js)
 * 2. Environment variables
 * 3. Development fallback
 */
export function getApiUrl() {
  // First try runtime config (mounted config.js)
  if (typeof window !== 'undefined' && window.configs?.apiUrl) {
    console.log('Using runtime config API URL:', window.configs.apiUrl);
    return window.configs.apiUrl;
  }

  // Fallback to environment variables
  if (import.meta.env.VITE_API_URL) {
    console.log('Using environment variable API URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  const fallbackUrl = 'http://localhost:8000';
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
}

/**
 * Get app configuration from runtime config
 * Supports both window.configs and legacy window.APP_CONFIG
 */
export function getAppConfig() {
  // Prefer standard convention
  if (typeof window !== 'undefined' && window.configs) {
    return {
      API_URL: getApiUrl(),
      APP_NAME: window.configs.appName || 'Bank Statement Analyzer',
      VERSION: window.configs.version || '1.0.0',
      FEATURES: {
        PDF_GENERATION: window.configs.features?.pdfGeneration ?? true,
        ADVANCED_ANALYTICS: window.configs.features?.advancedAnalytics ?? true
      }
    };
  }

  // Legacy support
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return window.APP_CONFIG;
  }

  // Default configuration
  return {
    API_URL: getApiUrl(),
    APP_NAME: 'Bank Statement Analyzer',
    VERSION: '1.0.0',
    FEATURES: {
      PDF_GENERATION: true,
      ADVANCED_ANALYTICS: true
    }
  };
}

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  const config = getAppConfig();
  return config.FEATURES && config.FEATURES[featureName] === true;
};
