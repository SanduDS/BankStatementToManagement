import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import TransactionAnalysis from './components/TransactionAnalysis';
import ReportDownload from './components/ReportDownload';
import ReportFeatureShowcase from './components/ReportFeatureShowcase';
import Header from './components/Header';
import './App.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setLoading(false);
  };

  const handleUploadStart = () => {
    setLoading(true);
    setAnalysisData(null);
  };

  return (
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
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📊 AI-Powered Analysis</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">📈 Interactive Charts</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">📄 PDF Reports</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">🔒 Secure Processing</span>
            </div>
          </div>

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
              <ReportDownload analysisData={analysisData} />
              <TransactionAnalysis data={analysisData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
