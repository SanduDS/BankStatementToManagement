import React, { useState } from 'react';
import axios from 'axios';
import { Download, FileText, Loader, BarChart3, PieChart, TrendingUp, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../utils/config';

const ReportDownload = ({ analysisData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const downloadReport = async () => {
    if (!analysisData) {
      setError('No analysis data available for report generation');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const API_URL = getApiUrl();

    try {
      const response = await axios.post(
        `${API_URL}/api/generate-report/`,
        analysisData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'bank_statement_report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('PDF report downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Download error:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to generate PDF report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!analysisData) {
    return null;
  }

  // Calculate some statistics for display
  const totalIncome = analysisData.transactions?.income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const totalExpenses = analysisData.transactions?.expenses?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const incomeCount = analysisData.transactions?.income?.length || 0;
  const expenseCount = analysisData.transactions?.expenses?.length || 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left side - Report Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Generate PDF Report
              </h3>
              <p className="text-sm text-gray-600">
                Comprehensive financial analysis with charts and insights
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800">Monthly Charts</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
              <PieChart className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800">Category Breakdown</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800">Financial Insights</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
              <FileText className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-800">Transaction Tables</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm font-medium">
              {incomeCount} Income transactions
            </span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm font-medium">
              {expenseCount} Expense transactions
            </span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm font-medium">
              {analysisData.account_details?.currency || 'LKR'} {(totalIncome + totalExpenses).toLocaleString()} Total Volume
            </span>
          </div>
        </div>

        {/* Right side - Download Button */}
        <div className="lg:flex-shrink-0">
          <button
            onClick={downloadReport}
            disabled={loading}
            className={`
              w-full lg:w-auto flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-semibold text-lg
              ${loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
              }
              transition-all duration-200 transform hover:scale-105
            `}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Report Contents Preview */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-500 mb-2 font-medium">📄 Your PDF report will include:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            <span>Account summary and key metrics</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            <span>Monthly income vs expense charts</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            <span>Expense category breakdowns</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
            <span>AI-powered financial insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            <span>Top transaction tables</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
            <span>Professional formatting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDownload;
