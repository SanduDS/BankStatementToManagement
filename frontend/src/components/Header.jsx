import React from 'react';
import { BarChart3, TrendingUp, FileText, Download } from 'lucide-react';
import AuthButtons from './AuthButtons';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bank Statement Analyzer</h1>
              <p className="text-sm text-gray-500">AI-powered financial insights with PDF reports</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Feature highlights - hidden on small screens */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Smart Analytics</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">PDF Reports</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Easy Export</span>
              </div>
            </div>
            
            {/* Authentication buttons */}
            <AuthButtons />
            
            {/* MVP badge for mobile */}
            <div className="md:hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                MVP
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
