import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Lock, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  showLoginPrompt = true,
  className = ''
}) => {
  const { isAuthenticated, loading, error, signIn, hasRole, user } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
        <p className="text-red-600 mb-4">Authentication Error</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={signIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    if (showLoginPrompt) {
      return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
          <Lock className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            You need to sign in to access this content. Please sign in with your account to continue.
          </p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        </div>
      );
    }

    return null;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
          <Lock className="h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            You don't have the required permissions to access this content.
          </p>
          <div className="text-sm text-gray-500">
            <p>Required roles: {requiredRoles.join(', ')}</p>
            <p>Your roles: {user?.groups?.join(', ') || 'None'}</p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required roles, render children
  return <>{children}</>;
};

// Higher-order component version for wrapping components
export const withProtectedRoute = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Hook for conditional rendering based on authentication
export const useProtectedContent = (requiredRoles = []) => {
  const { isAuthenticated, hasRole } = useAuth();

  const canAccess = isAuthenticated && (
    requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role))
  );

  return {
    canAccess,
    isAuthenticated,
    hasRequiredRoles: requiredRoles.length === 0 || requiredRoles.some(role => hasRole(role))
  };
};

export default ProtectedRoute;