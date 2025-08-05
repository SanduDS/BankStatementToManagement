import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, User, Loader2 } from 'lucide-react';

const AuthButtons = ({ className = '' }) => {
  const { user, isAuthenticated, loading, signIn, signOut, error } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <span className="text-sm">Auth Error</span>
        <button
          onClick={signIn}
          className="text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {/* User info */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user.displayName || user.username || user.email}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={signOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={signIn}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In</span>
      </button>
    </div>
  );
};

export default AuthButtons;