import React from 'react';
import { FileText, BarChart3, PieChart, TrendingUp, Download, CheckCircle, Star } from 'lucide-react';

const ReportFeatureShowcase = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 mb-8 text-white">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Professional PDF Reports</h2>
        <p className="text-blue-100 text-lg">
          Transform your bank statement into comprehensive financial insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Feature 1 */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg w-fit mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Visual Charts</h3>
          <p className="text-blue-100 text-sm">
            Monthly income vs expenses with beautiful bar charts and trend analysis
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg w-fit mb-4">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Category Breakdown</h3>
          <p className="text-blue-100 text-sm">
            Automatic expense categorization with colorful pie charts and insights
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg w-fit mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">AI Insights</h3>
          <p className="text-blue-100 text-sm">
            Smart financial recommendations and spending pattern analysis
          </p>
        </div>
      </div>

      {/* Report Features */}
      <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 backdrop-blur-sm">
        <h3 className="font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
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
              <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
              <span className="text-blue-100 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Upload your statement to generate your report</span>
        </div>
      </div>
    </div>
  );
};

export default ReportFeatureShowcase;
