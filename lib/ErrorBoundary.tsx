import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from './logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.security.exception(error, { component: 'ErrorBoundary', errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-pretoria-blue mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600">
                We encountered an unexpected error. Don't worry, your data is safe!
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                <p className="text-sm font-mono text-gray-700">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-joburg-teal hover:underline"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for modals
export class ModalErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.security.exception(error, { component: 'ModalErrorBoundary', errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
          <div className="text-center">
            <i className="fa-solid fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h3 className="text-lg font-bold text-pretoria-blue mb-2">
              Unable to Load
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature encountered an error. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-joburg-teal text-white rounded-lg hover:bg-joburg-teal/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
