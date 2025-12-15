import React from 'react';
import { FolderIcon, PlusIcon } from 'lucide-react';
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'Get started by creating a new record',
  icon = <FolderIcon className="w-12 h-12 text-gray-300" />,
  actionLabel = 'Create New',
  onAction,
  className = ''
}) => {
  return <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="bg-gray-50 rounded-full p-4 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {message}
      </p>
      {onAction && <button onClick={onAction} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
          <PlusIcon className="h-4 w-4 mr-1.5" />
          {actionLabel}
        </button>}
    </div>;
};