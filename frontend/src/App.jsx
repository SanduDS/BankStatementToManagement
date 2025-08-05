import React, { useState } from 'react';
import { AuthContextProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FileUpload from './components/FileUpload';
import EnhancedTransactionAnalysis from './components/EnhancedTransactionAnalysis';
import ReportDownload from './components/ReportDownload';
import ReportFeatureShowcase from './components/ReportFeatureShowcase';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (data, additionalData = {}) => {
    setAnalysisData(data);
    setAnalysisMetadata(additionalData.metadata || null);
    setLoading(false);
  };

  const handleUploadStart = () => {
    setLoading(true);
    setAnalysisData(null);
    setAnalysisMetadata(null);
  };

  return (
    <AuthContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bank Statement Analyzer
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Upload your bank statement to get detailed financial insights and professional reports
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">🤖 AI Analysis</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">📊 CSV Exports</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">📄 PDF Reports</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">🏦 Bank Statement Validation</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">📈 Advanced Analytics</span>
              </div>
            </div>

            {/* Protected content - requires authentication */}
            <ProtectedRoute>
              <FileUpload
                onAnalysisComplete={handleAnalysisComplete}
                onUploadStart={handleUploadStart}
                loading={loading}
              />

              {!analysisData && !loading && (
                <ReportFeatureShowcase />
              )}

              {analysisData && (
                <div className="space-y-8">
                  <ErrorBoundary
                    key={`analysis-${Date.now()}`}
                    title="Analysis Component Error"
                    message="There was an error displaying the transaction analysis. Please try refreshing the page."
                  >
                    <EnhancedTransactionAnalysis data={analysisData} />
                  </ErrorBoundary>
                  <ErrorBoundary
                    key={`report-${Date.now()}`}
                    title="Report Download Error"
                    message="There was an error with the report download component."
                  >
                    <ReportDownload data={analysisData} />
                  </ErrorBoundary>
                </div>
              )}
            </ProtectedRoute>
          </div>
        </main>
        <Footer />
      </div>
    </AuthContextProvider>
  );
}

export default App;
