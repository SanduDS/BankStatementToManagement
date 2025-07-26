import { getApiUrl } from './config';

// Create an API client with automatic authentication handling
class ApiClient {
  constructor() {
    this.baseURL = getApiUrl();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.warn('Authentication required - redirecting to login');
        // Redirect to login page
        window.location.href = '/auth/login';
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different content types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        return { blob, headers: response.headers };
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData 
      ? { ...options.headers } 
      : { 'Content-Type': 'application/json', ...options.headers };
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
      headers,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;
