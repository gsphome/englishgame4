import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  retry: () => void;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      {import.meta.env.DEV && error && (
        <details className="text-left bg-gray-100 p-3 rounded mb-4">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="text-sm mt-2 overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <div className="space-y-2">
        <button
          onClick={retry}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = './'}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  </div>
);