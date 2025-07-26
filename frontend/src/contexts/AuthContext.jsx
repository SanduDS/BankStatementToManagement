import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and get user info
  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      // Development mode check
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        console.log('Development mode detected - using mock authentication');
        // Mock user for development
        setUser({ 
          name: 'Test User',
          given_name: 'Test',
          email: 'test@example.com',
          sub: 'dev-user-123'
        });
        setLoading(false);
        return;
      }
      
      const userinfoCookie = Cookies.get('userinfo');
      console.log('Userinfo cookie:', userinfoCookie ? 'Found' : 'Not found');
      
      if (userinfoCookie) {
        // If userinfo cookie exists, it's likely a JWT token
        try {
          // Check if it's a JWT token (starts with eyJ)
          if (userinfoCookie.startsWith('eyJ')) {
            console.log('JWT token found in userinfo cookie');
            // For JWT tokens, we should use the /auth/userinfo endpoint instead
            // as client-side JWT decoding is not secure and the token might be encrypted
          } else {
            // Try to parse as JSON (fallback for other formats)
            const userInfo = JSON.parse(decodeURIComponent(userinfoCookie));
            console.log('User info from cookie:', userInfo);
            setUser(userInfo);
            return;
          }
        } catch {
          console.log('Cookie is not JSON, likely a JWT token - will use userinfo endpoint');
        }
      }
      
      // Try to fetch user info from /auth/userinfo endpoint
      console.log('Fetching user info from /auth/userinfo...');
      const response = await fetch('/auth/userinfo', {
        credentials: 'include'
      });
      
      console.log('Auth response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data from endpoint:', userData);
        setUser(userData);
      } else {
        console.log('No valid authentication found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function - redirects to Choreo auth
  const login = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      console.log('Development mode - simulating login');
      setUser({ 
        name: 'Test User',
        given_name: 'Test',
        email: 'test@example.com',
        sub: 'dev-user-123'
      });
      return;
    }
    
    window.location.href = '/auth/login';
  };

  // Logout function - redirects to Choreo logout with session hint
  const logout = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      console.log('Development mode - simulating logout');
      setUser(null);
      return;
    }
    
    const sessionHint = user?.sid || '';
    window.location.href = `/auth/logout?session_hint=${sessionHint}`;
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
