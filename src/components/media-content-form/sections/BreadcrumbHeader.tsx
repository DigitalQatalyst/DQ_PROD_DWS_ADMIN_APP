import type React from 'react';

interface BreadcrumbHeaderProps {
  onNavigateBack: () => void;
  isEditing: boolean;
}

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ onNavigateBack, isEditing }) => (
  <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        <button
          onClick={onNavigateBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Content Management
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{isEditing ? 'Edit Content' : 'Create New Content'}</span>
      </nav>
    </div>
  </div>
);

export default BreadcrumbHeader;

