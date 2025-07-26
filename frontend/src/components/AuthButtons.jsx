import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthButtons = () => {
  const { user, loading, login, logout, isAuthenticated } = useAuth();

  // Debug logging
  console.log('AuthButtons state:', { user, loading, isAuthenticated });

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <User size={16} />
          <span>Welcome, {user?.given_name || user?.name || 'User'}</span>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <LogOut size={16} className="mr-1" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      <LogIn size={16} className="mr-2" />
      Sign In
    </button>
  );
};

export default AuthButtons;
