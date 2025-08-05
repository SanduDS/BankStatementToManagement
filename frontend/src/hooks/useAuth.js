import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook that provides authentication functionality
 * This is a re-export of the useAuth hook from AuthContext for convenience
 */
export const useAuth = () => {
  return useAuthContext();
};

/**
 * Hook for protected API calls with automatic token handling
 */
export const useAuthenticatedApi = () => {
  const { getToken, isAuthenticated, signIn } = useAuth();

  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await getToken();
      
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      };

      const response = await fetch(url, {
        ...options,
        headers: authHeaders
      });

      if (response.status === 401) {
        // Token might be expired, try to refresh and retry
        try {
          const newToken = await getToken();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...authHeaders,
              'Authorization': `Bearer ${newToken}`
            }
          });
          
          if (retryResponse.status === 401) {
            // Still unauthorized, redirect to login
            await signIn();
            throw new Error('Authentication required');
          }
          
          return retryResponse;
        } catch (refreshError) {
          await signIn();
          throw new Error('Authentication required');
        }
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  };

  return { makeAuthenticatedRequest };
};

/**
 * Hook for handling authentication state changes
 */
export const useAuthState = () => {
  const { user, isAuthenticated, loading, error } = useAuth();

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isLoggedIn: isAuthenticated && !loading && !error,
    isLoading: loading,
    hasError: !!error
  };
};

/**
 * Hook for role-based access control
 */
export const useRoleAccess = () => {
  const { hasRole, user } = useAuth();

  const checkAccess = (requiredRoles = []) => {
    if (!user) return false;
    if (requiredRoles.length === 0) return true;
    
    return requiredRoles.some(role => hasRole(role));
  };

  const getUserRoles = () => {
    return user?.groups || [];
  };

  return {
    hasRole,
    checkAccess,
    getUserRoles,
    isAdmin: hasRole('admin'),
    isUser: hasRole('user')
  };
};

export default useAuth;