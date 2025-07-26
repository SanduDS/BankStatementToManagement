import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and get user info
  const checkAuth = async () => {
    try {
      const userinfoCookie = Cookies.get('userinfo');
      if (userinfoCookie) {
        // If userinfo cookie exists, decode and set user
        const userInfo = JSON.parse(decodeURIComponent(userinfoCookie));
        setUser(userInfo);
      } else {
        // Try to fetch user info from /auth/userinfo endpoint
        const response = await fetch('/auth/userinfo', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
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
    window.location.href = '/auth/login';
  };

  // Logout function - redirects to Choreo logout with session hint
  const logout = () => {
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
