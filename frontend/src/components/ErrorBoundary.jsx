import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details for potential debugging
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                {this.props.title || 'Something went wrong'}
              </h3>
              <p className="text-red-600">
                {this.props.message || 'An error occurred while rendering this component.'}
              </p>
            </div>
          </div>
          
          {this.props.showRetry !== false && (
            <button
              onClick={this.handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          )}
          
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-red-700 font-medium">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-3 bg-red-100 rounded text-red-800 overflow-auto text-xs">
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
