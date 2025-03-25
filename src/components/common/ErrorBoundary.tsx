import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                Error details
              </summary>
              <pre className="mt-2 p-4 bg-gray-700 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 