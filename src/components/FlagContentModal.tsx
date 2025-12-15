import React, { useState, useEffect } from 'react';
import { XIcon, AlertTriangleIcon } from 'lucide-react';

interface FlagContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  contentTitle: string;
}

export const FlagContentModal: React.FC<FlagContentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contentTitle
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const minLength = 10;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validate required field
    if (!reason.trim()) {
      setError('Reason for flagging is required');
      return;
    }

    // Validate minimum length
    if (reason.trim().length < minLength) {
      setError(`Reason must be at least ${minLength} characters`);
      return;
    }

    // Clear error and submit
    setError('');
    onConfirm(reason.trim());
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-modal-title"
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-6 w-6 text-amber-600 mr-3" />
            <h3 id="flag-modal-title" className="text-lg font-bold text-gray-900">
              Flag for Review
            </h3>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Content to flag:
            </p>
            <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-md">
              {contentTitle}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="flag-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for flagging <span className="text-red-500">*</span>
            </label>
            <textarea
              id="flag-reason"
              rows={5}
              className={`block w-full shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm border rounded-md p-3 resize-y ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Please provide a detailed reason why this content should be reviewed (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(''); // Clear error on input
              }}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">
                Minimum {minLength} characters required
              </p>
              <p className={`text-xs ${reason.length < minLength ? 'text-red-500' : 'text-green-600'}`}>
                {reason.length} / {minLength}
              </p>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Flagging this content will change its status to "Pending Review" 
              and notify administrators for immediate attention.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={reason.trim().length < minLength}
          >
            Flag for Review
          </button>
        </div>
      </div>
    </div>
  );
};

