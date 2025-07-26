import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug = () => {
  const { user, loading, isAuthenticated, checkAuth } = useAuth();

  const handleRefresh = () => {
    checkAuth();
  };

  const getAllCookies = () => {
    return document.cookie.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
      return cookies;
    }, {});
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Authentication Debug</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Authentication State:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify({ 
              loading, 
              isAuthenticated, 
              user: user || 'null' 
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold">All Cookies:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify(getAllCookies(), null, 2)}
          </pre>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Auth
          </button>
          
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Login
          </button>
          
          <button
            onClick={() => window.location.href = '/auth/userinfo'}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Userinfo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
