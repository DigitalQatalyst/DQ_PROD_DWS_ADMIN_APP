import React from 'react';
type SkeletonVariant = 'table' | 'card' | 'detail' | 'metrics';
interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'table',
  count = 3,
  className = ''
}) => {
  const renderTableSkeleton = () => {
    return <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
        {Array.from({
        length: count
      }).map((_, index) => <div key={index} className="h-16 bg-gray-100 rounded-lg mb-2 flex items-center px-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>)}
      </div>;
  };
  const renderCardSkeleton = () => {
    return <div className={`animate-pulse grid gap-4 ${className}`} style={{
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
    }}>
        {Array.from({
        length: count
      }).map((_, index) => <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6 mb-4"></div>
            <div className="flex justify-between mt-6">
              <div className="h-8 bg-gray-200 rounded-full w-20"></div>
              <div className="h-8 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>)}
      </div>;
  };
  const renderDetailSkeleton = () => {
    return <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>;
  };
  const renderMetricsSkeleton = () => {
    return <div className={`animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({
        length: 4
      }).map((_, index) => <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>)}
      </div>;
  };
  switch (variant) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    case 'metrics':
      return renderMetricsSkeleton();
    default:
      return renderTableSkeleton();
  }
};