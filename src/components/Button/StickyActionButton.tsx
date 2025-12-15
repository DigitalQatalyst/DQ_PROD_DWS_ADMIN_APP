import React from 'react';
export interface StickyActionButtonProps {
  onClick: () => void;
  buttonText?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  'data-id'?: string;
}
const StickyActionButton: React.FC<StickyActionButtonProps> = ({
  onClick,
  buttonText = 'Sign In to Get Started',
  description = 'Access your personalized dashboard',
  disabled = false,
  loading = false,
  'data-id': dataId
}) => {
  return <div className="sticky bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white shadow-lg" data-id={dataId}>
      <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg transition-all duration-200 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-base tracking-tight shadow-md md:text-[15px] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed" onClick={onClick} disabled={disabled || loading}>
        {loading ? 'Loading...' : buttonText}
      </button>
      {description && <p className="text-xs text-gray-500 text-center mt-2 md:text-[11px] sm:text-[10px]">
          {description}
        </p>}
    </div>;
};
export { StickyActionButton };