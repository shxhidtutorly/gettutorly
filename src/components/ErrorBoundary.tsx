
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific errors we're looking for
    if (error.message.includes('pn is not a function')) {
      console.error('Found pn function error - likely a missing import in summary generation');
    }
    
    if (error.message.includes('yn is not a function')) {
      console.error('Found yn function error - check yn import');
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left text-sm">
                <summary className="cursor-pointer text-gray-300">Error Details</summary>
                <pre className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
