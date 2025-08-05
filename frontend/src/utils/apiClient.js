import axios from 'axios';
import { getApiUrl } from './config';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store auth token getter function
let getAuthToken = null;

/**
 * Set the authentication token getter function
 * This should be called from the auth context to provide token access
 */
export const setAuthTokenGetter = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🔍 API Request Interceptor - URL:', config.url);
    console.log('🔍 getAuthToken function exists:', !!getAuthToken);
    
    try {
      // Add authentication token if available
      if (getAuthToken) {
        console.log('🔍 Calling getAuthToken...');
        const token = await getAuthToken();
        console.log('🔍 Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header added');
        } else {
          console.log('❌ No token available');
        }
      } else {
        console.log('❌ No getAuthToken function available');
      }
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      // Continue with request without token
    }

    console.log('🔍 Final headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a fresh token
        if (getAuthToken) {
          const token = await getAuthToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (tokenError) {
        console.error('Token refresh failed:', tokenError);
        // Redirect to login or handle authentication failure
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API methods for different endpoints
 */
export const api = {
  // Health check
  health: () => apiClient.get('/health'),

  // File upload and analysis
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Generate PDF report
  generateReport: (data) => apiClient.post('/api/report/generate', data),

  // Download PDF report
  downloadReport: (reportId) => 
    apiClient.get(`/api/report/download/${reportId}`, {
      responseType: 'blob',
    }),

  // Export CSV
  exportCsv: (data) => 
    apiClient.post('/api/report/export-csv', data, {
      responseType: 'blob',
    }),

  // Generic authenticated request
  authenticatedRequest: (method, url, data = null, config = {}) => {
    return apiClient({
      method,
      url,
      data,
      ...config,
    });
  },
};

/**
 * Error handling utilities
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return {
          message: 'Authentication required. Please sign in.',
          type: 'auth',
          status,
        };
      case 403:
        return {
          message: 'Access denied. You don\'t have permission to perform this action.',
          type: 'permission',
          status,
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          type: 'not-found',
          status,
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          type: 'rate-limit',
          status,
        };
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          type: 'server-error',
          status,
        };
      default:
        return {
          message: data?.message || data?.detail || 'An unexpected error occurred.',
          type: 'unknown',
          status,
        };
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'network',
      status: null,
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred.',
      type: 'unknown',
      status: null,
    };
  }
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export default apiClient;