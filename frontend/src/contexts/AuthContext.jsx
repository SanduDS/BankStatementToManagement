import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuthContext } from '@asgardeo/auth-react';
import { getAsgardeoConfig } from '../utils/config';
import { setAuthTokenGetter } from '../utils/apiClient';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

// Auth context provider that wraps Asgardeo's AuthProvider
export const AuthContextProvider = ({ children }) => {
  // Get Asgardeo configuration from config utilities
  const asgardeoConfig = getAsgardeoConfig();

  return (
    <AuthProvider config={asgardeoConfig}>
      <AuthContextProviderInner>
        {children}
      </AuthContextProviderInner>
    </AuthProvider>
  );
}

// Inner provider that uses Asgardeo's useAuthContext
const AuthContextProviderInner = ({ children }) => {
  const {
    state,
    signIn,
    signOut,
    getBasicUserInfo,
    getIDToken,
    getAccessToken,
    refreshAccessToken,
    revokeAccessToken,
    on,
    isLoading
  } = useAuthContext();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup API client with token getter (only once, always returns latest token)
  useEffect(() => {
    console.log('getAccessToken:', getAccessToken);
    console.log('state:', state);
    setAuthTokenGetter(async () => {
      if (state.isAuthenticated) {
        try {
          // Try using getIDToken as a workaround if getAccessToken fails
          if (typeof getAccessToken === 'function') {
            console.log('Attempting to get access token...');
            return await getAccessToken();
          } else if (typeof getIDToken === 'function') {
            console.log('Falling back to ID token...');
            return await getIDToken();
          } else {
            console.error('Neither getAccessToken nor getIDToken is available');
            return null;
          }
        } catch (error) {
          console.error('Failed to get access token, trying ID token:', error);
          try {
            // Fallback to ID token if access token fails
            return await getIDToken();
          } catch (idTokenError) {
            console.error('Failed to get ID token as well:', idTokenError);
            return null;
          }
        }
      }
      return null;
    });
  }, [state.isAuthenticated, getAccessToken, getIDToken]);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        setLoading(true);
        setError(null);

        if (state.isAuthenticated) {
          const userInfo = await getBasicUserInfo();
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    handleAuthStateChange();
  }, [state.isAuthenticated, getBasicUserInfo]);

  // Listen for auth events and setup API client
  useEffect(() => {
    const unsubscribe = on('sign-in', () => {
      console.log('User signed in');
    });

    const unsubscribeSignOut = on('sign-out', () => {
      console.log('User signed out');
      setUser(null);
    });

    // Only handle event subscriptions/unsubscriptions here
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubscribeSignOut === 'function') unsubscribeSignOut();
    };
  }, [on]);

  // Enhanced sign in function
  const handleSignIn = useCallback(async () => {
    try {
      setError(null);
      await signIn();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
    }
  }, [signIn]);

  // Listen for token expiration events from API client
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired, redirecting to sign in');
      handleSignIn();
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [handleSignIn]);

  // Enhanced sign out function
  const handleSignOut = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
    }
  };

  // Get access token with error handling
  const getToken = async () => {
    try {
      const token = await getAccessToken();
      return token;
    } catch (err) {
      console.error('Get token error:', err);
      // Try to refresh token
      try {
        await refreshAccessToken();
        return await getAccessToken();
      } catch (refreshErr) {
        console.error('Token refresh error:', refreshErr);
        throw refreshErr;
      }
    }
  };

  // Check if user has specific roles/permissions
  const hasRole = (role) => {
    if (!user || !user.groups) return false;
    return user.groups.includes(role);
  };

  const contextValue = {
    // User state
    user,
    isAuthenticated: state.isAuthenticated,
    loading: loading || isLoading,
    error,

    // Auth methods
    signIn: handleSignIn,
    signOut: handleSignOut,
    getToken,
    getIDToken,
    refreshAccessToken,
    revokeAccessToken,

    // Utility methods
    hasRole,

    // Raw Asgardeo state for advanced usage
    asgardeoState: state
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}