import React from 'react';
type StatusVariant = 'draft' | 'pending' | 'approved' | 'published' | 'archived' | 'rejected' | 'sent-back' | 'unpublished';
interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className = ''
}) => {
  const getStatusStyles = (statusVariant: StatusVariant | undefined) => {
    // Default to lowercase status if no variant provided
    const normalizedVariant = statusVariant || (status ? status.toLowerCase().replace(' ', '-') : 'draft') as StatusVariant;
    const statusStyles: Record<StatusVariant, string> = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-200',
      pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      published: 'bg-blue-100 text-blue-800 border border-blue-200',
      archived: 'bg-gray-100 text-gray-800 border border-gray-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      'sent-back': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      unpublished: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return statusStyles[normalizedVariant] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };
  return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${getStatusStyles(variant)} ${className}`}>
      {status || 'N/A'}
    </span>;
};