import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, loading, login } = useAuth();

  // Debug logging
  console.log('ProtectedRoute state:', { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Authentication Required
        </h3>
        <p className="text-yellow-700 mb-4">
          Please sign in to access this feature.
        </p>
        <button
          onClick={login}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Shield size={16} className="mr-2" />
          Sign In to Continue
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
