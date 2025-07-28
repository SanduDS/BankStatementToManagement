import React from 'react';
import { FileText, BarChart3, PieChart, TrendingUp, Upload, CheckCircle, Star } from 'lucide-react';

const ReportFeatureShowcase = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 mb-8 text-white">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Professional PDF Reports</h2>
        <p className="text-blue-100 text-lg">
          Transform your bank statement into comprehensive financial insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Feature 1 */}
        <div className="bg-white bg-opacity-30 border border-white border-opacity-50 rounded-lg p-6 backdrop-blur-sm shadow-lg">
          <div className="bg-white bg-opacity-50 p-3 rounded-lg w-fit mb-4">
            <BarChart3 className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="font-bold mb-2 text-gray-800">Visual Charts</h3>
          <p className="text-gray-700 text-sm font-medium">
            Monthly income vs expenses with beautiful bar charts and trend analysis
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white bg-opacity-30 border border-white border-opacity-50 rounded-lg p-6 backdrop-blur-sm shadow-lg">
          <div className="bg-white bg-opacity-50 p-3 rounded-lg w-fit mb-4">
            <PieChart className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="font-bold mb-2 text-gray-800">Category Breakdown</h3>
          <p className="text-gray-700 text-sm font-medium">
            Automatic expense categorization with colorful pie charts and insights
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white bg-opacity-30 border border-white border-opacity-50 rounded-lg p-6 backdrop-blur-sm shadow-lg">
          <div className="bg-white bg-opacity-50 p-3 rounded-lg w-fit mb-4">
            <TrendingUp className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="font-bold mb-2 text-gray-800">AI Insights</h3>
          <p className="text-gray-700 text-sm font-medium">
            Smart financial recommendations and spending pattern analysis
          </p>
        </div>
      </div>

      {/* Report Features */}
      <div className="bg-white bg-opacity-30 border border-white border-opacity-50 rounded-lg p-6 mb-6 backdrop-blur-sm shadow-lg">
        <h3 className="font-bold mb-4 flex items-center text-gray-800 text-lg">
          <Star className="w-5 h-5 mr-2 text-yellow-600" />
          What's Included in Your Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Account summary and key metrics',
            'Monthly income vs expense analysis',
            'Expense category breakdowns',
            'Transaction frequency analysis',
            'Financial health indicators',
            'AI-powered spending insights',
            'Top transaction tables',
            'Professional formatting'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center space-x-2 bg-white bg-opacity-90 border border-white border-opacity-60 px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Start Your Financial Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default ReportFeatureShowcase;
