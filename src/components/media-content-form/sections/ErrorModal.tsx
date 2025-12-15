import type React from 'react';

interface ErrorModalProps {
  show: boolean;
  message: string;
  error?: any;
  onClose: () => void;
  isDev: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ show, message, error, onClose, isDev }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-900 mb-4">{message}</p>
          {isDev && error && (
            <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300 overflow-auto max-h-48">
              <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-words mb-2">
                {error?.message || String(error)}
              </p>
              {error?.response && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                    Response details
                  </summary>
                  <pre className="mt-2 text-xs font-mono text-gray-600 whitespace-pre-wrap break-words overflow-auto">
                    {JSON.stringify(error.response, null, 2)}
                  </pre>
                </details>
              )}
              {error?.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs font-mono text-gray-600 whitespace-pre-wrap break-words overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
              {!error?.message && !error?.stack && (
                <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;

