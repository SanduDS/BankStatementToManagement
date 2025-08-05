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
      },
      AUTH: {
        CLIENT_ID: window.configs.auth?.clientId || import.meta.env.VITE_ASGARDEO_CLIENT_ID,
        BASE_URL: window.configs.auth?.baseUrl || import.meta.env.VITE_ASGARDEO_BASE_URL,
        SIGN_IN_REDIRECT_URL: window.configs.auth?.signInRedirectUrl || window.location.origin,
        SIGN_OUT_REDIRECT_URL: window.configs.auth?.signOutRedirectUrl || window.location.origin,
        SCOPE: window.configs.auth?.scope || ["openid", "profile", "email"]
      }
    };
  }

  // Legacy support
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return {
      ...window.APP_CONFIG,
      AUTH: window.APP_CONFIG.AUTH || {
        CLIENT_ID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
        BASE_URL: import.meta.env.VITE_ASGARDEO_BASE_URL,
        SIGN_IN_REDIRECT_URL: window.location.origin,
        SIGN_OUT_REDIRECT_URL: window.location.origin,
        SCOPE: ["openid", "profile", "email"]
      }
    };
  }

  // Default configuration
  return {
    API_URL: getApiUrl(),
    APP_NAME: 'Bank Statement Analyzer',
    VERSION: '1.0.0',
    FEATURES: {
      PDF_GENERATION: true,
      ADVANCED_ANALYTICS: true
    },
    AUTH: {
      CLIENT_ID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
      BASE_URL: import.meta.env.VITE_ASGARDEO_BASE_URL,
      SIGN_IN_REDIRECT_URL: window.location.origin,
      SIGN_OUT_REDIRECT_URL: window.location.origin,
      SCOPE: ["openid", "profile", "email"]
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

/**
 * Get authentication configuration
 */
export const getAuthConfig = () => {
  const config = getAppConfig();
  return config.AUTH;
};

/**
 * Check if authentication is properly configured
 */
export const isAuthConfigured = () => {
  const authConfig = getAuthConfig();
  return !!(authConfig.CLIENT_ID && authConfig.BASE_URL);
};

/**
 * Get the full Asgardeo configuration object
 */
export const getAsgardeoConfig = () => {
  const config = getAppConfig();
  const authConfig = config.AUTH;
  
  return {
    signInRedirectURL: authConfig.SIGN_IN_REDIRECT_URL,
    signOutRedirectURL: authConfig.SIGN_OUT_REDIRECT_URL,
    clientID: authConfig.CLIENT_ID,
    baseUrl: authConfig.BASE_URL,
    scope: authConfig.SCOPE,
    resourceServerURLs: [config.API_URL],
    enablePKCE: true,
    storage: "webWorker"
  };
};
