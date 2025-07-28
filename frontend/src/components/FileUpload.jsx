import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, Info, Download } from 'lucide-react';
import { getApiUrl } from '../utils/config';

const FileUpload = ({ onAnalysisComplete, onUploadStart, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationInfo, setValidationInfo] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Enhanced file validation
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError(`File size too large. Maximum allowed size is 50MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`);
      setFile(null);
      return;
    }

    // Check if file name suggests it's a bank statement
    const filename = selectedFile.name.toLowerCase();
    const bankKeywords = ['statement', 'bank', 'account', 'transaction'];
    const hasBankKeyword = bankKeywords.some(keyword => filename.includes(keyword));
    
    if (!hasBankKeyword) {
      setValidationInfo({
        type: 'warning',
        message: 'File name doesn\'t contain typical bank statement keywords. Please ensure this is a bank statement PDF.'
      });
    } else {
      setValidationInfo(null);
    }

    setFile(selectedFile);
    setError('');
    setCsvData(null);
    setAnalysisMetadata(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setError('');
    setSuccess('');
    setValidationInfo(null);
    onUploadStart();

    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    const API_URL = getApiUrl();

    try {
      const response = await axios.post(`${API_URL}/api/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes timeout for large files
      });

      // Handle both old and new response formats
      if (response.data.error) {
        // Enhanced error handling with specific error types
        const errorData = response.data;
        let errorMessage = errorData.error;
        
        // Add suggestions if available
        if (errorData.suggestions && errorData.suggestions.length > 0) {
          errorMessage += '\n\nSuggestions:\n' + errorData.suggestions.map(s => `• ${s}`).join('\n');
        }
        
        // Add analysis info for invalid bank statements
        if (errorData.error_type === 'invalid_bank_statement' && errorData.analysis) {
          const analysis = errorData.analysis;
          errorMessage += `\n\nAnalysis Details:\n• Confidence: ${(analysis.confidence * 100).toFixed(1)}%`;
          if (analysis.matched_keywords && analysis.matched_keywords.length > 0) {
            errorMessage += `\n• Found keywords: ${analysis.matched_keywords.join(', ')}`;
          }
        }
        
        // Add retry suggestions for service issues
        if (errorData.error_type === 'service_overloaded') {
          errorMessage += '\n\n💡 The AI service is currently busy. This usually resolves within a few minutes.';
        } else if (errorData.error_type === 'rate_limited') {
          errorMessage += '\n\n💡 Please wait a moment before trying again.';
        }
        
        setError(errorMessage);
      } else {
        // Handle successful response
        const extractedData = response.data.extracted || response.data;
        const metadata = response.data.metadata;
        const csvExports = response.data.csv_exports;
        
        setSuccess('Bank statement analyzed successfully!');
        setAnalysisMetadata(metadata);
        setCsvData(csvExports);
        
        // Pass data to parent component
        onAnalysisComplete(extractedData, {
          metadata,
          csvExports
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Failed to analyze bank statement.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again with a smaller file or check your internet connection.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File size too large. Please upload a file smaller than 50MB.';
      } else if (err.response?.data?.error) {
        const errorData = err.response.data;
        
        // Provide user-friendly messages for specific error types
        if (errorData.error_type) {
          switch (errorData.error_type) {
            case 'service_overloaded':
              errorMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
              break;
            case 'rate_limited':
              errorMessage = 'Too many requests. Please wait a moment before trying again.';
              break;
            case 'invalid_api_key':
              errorMessage = 'API configuration error. Please check your settings.';
              break;
            case 'invalid_bank_statement':
              errorMessage = 'This document does not appear to be a valid bank statement.';
              break;
            default:
              errorMessage = errorData.error || `Analysis failed: ${errorData.error_type}`;
          }
        } else {
          errorMessage = errorData.error;
        }
        
        // Add suggestions if available
        if (errorData.suggestions) {
          errorMessage += '\n\nSuggestions:\n' + errorData.suggestions.map(s => `• ${s}`).join('\n');
        }
        
        // Add analysis info for invalid bank statements
        if (errorData.error_type === 'invalid_bank_statement' && errorData.analysis) {
          const analysis = errorData.analysis;
          errorMessage += `\n\nAnalysis Details:\n• Confidence: ${(analysis.confidence * 100).toFixed(1)}%`;
          if (analysis.matched_keywords && analysis.matched_keywords.length > 0) {
            errorMessage += `\n• Found keywords: ${analysis.matched_keywords.join(', ')}`;
          }
        }
        
        // Add retry suggestions for service issues
        if (errorData.error_type === 'service_overloaded') {
          errorMessage += '\n\n💡 The AI service is currently busy. This usually resolves within a few minutes.';
        } else if (errorData.error_type === 'rate_limited') {
          errorMessage += '\n\n💡 Please wait a moment before trying again.';
        }
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }
      
      setError(errorMessage);
    }
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Bank Statement</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-3">
            {file ? (
              <>
                <FileText className="mx-auto h-12 w-12 text-green-500" />
                <div>
                  <p className="text-lg font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your PDF bank statement here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            PDF Password (if protected)
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF password if required"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Validation Info */}
        {validationInfo && (
          <div className={`flex items-center space-x-2 ${
            validationInfo.type === 'warning' ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' : 'text-blue-600 bg-blue-50 border border-blue-200'
          } rounded-md p-3`}>
            <Info className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{validationInfo.message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm whitespace-pre-line">{error}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            !file || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Analyzing Bank Statement...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Analyze & Generate Report</span>
              <FileText className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>

      {/* Success Message with CSV Downloads - Outside Form */}
      {success && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
          
          {/* Analysis Metadata */}
          {analysisMetadata && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Analysis Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Total Transactions: {analysisMetadata.total_transactions}</div>
                  <div>Income: {analysisMetadata.income_transactions}</div>
                  <div>Expenses: {analysisMetadata.expense_transactions}</div>
                  <div>Confidence: {(analysisMetadata.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
          
          {/* CSV Export Options */}
          {csvData && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">📊 Download Data as CSV:</div>
              <div className="grid grid-cols-2 gap-2">
                {csvData.transactions && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadCSV(csvData.transactions, 'transactions.csv');
                    }}
                    className="flex items-center justify-center space-x-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>Transactions</span>
                  </button>
                )}
                {csvData.summary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadCSV(csvData.summary, 'account-summary.csv');
                    }}
                    className="flex items-center justify-center space-x-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>Summary</span>
                  </button>
                )}
                {csvData.monthly_summary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadCSV(csvData.monthly_summary, 'monthly-analysis.csv');
                    }}
                    className="flex items-center justify-center space-x-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>Monthly</span>
                  </button>
                )}
                {csvData.category_summary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadCSV(csvData.category_summary, 'categories.csv');
                    }}
                    className="flex items-center justify-center space-x-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>Categories</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="font-medium text-gray-600">📄 Supported Features:</p>
            <p>• PDF bank statements only</p>
            <p>• Password-protected PDFs supported</p>
            <p>• Maximum file size: 50MB</p>
            <p>• AI-powered transaction extraction</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">📊 Export Options:</p>
            <p>• CSV downloads for all data</p>
            <p>• Professional PDF reports</p>
            <p>• Monthly and category analysis</p>
            <p>• Account summary exports</p>
          </div>
        </div>
        <div className="border-t pt-2 mt-3">
          <p className="font-medium text-gray-600">🔒 Privacy & Security:</p>
          <p>• Your data is processed securely and not stored permanently</p>
          <p>• Bank statement validation ensures document authenticity</p>
          <p>• All processing happens on secure, encrypted servers</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
