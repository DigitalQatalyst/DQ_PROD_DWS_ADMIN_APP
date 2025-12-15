import React from 'react';
import { cn } from '../../../utils/cn';

export interface ChartContainerProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  height?: string;
  headerActions?: React.ReactNode;
}

/**
 * ChartContainer - ShadCN UI styled container for charts
 * Provides consistent styling and layout for all dashboard charts
 */
const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  className,
  children,
  height = 'h-80',
  headerActions,
}) => {
  return (
    <div className={cn('bg-white border border-border rounded-xl p-6', className)}>
      {(title || description || headerActions) && (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {title && (
                <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">{headerActions}</div>
            )}
          </div>
        </div>
      )}
      <div className={height}>{children}</div>
    </div>
  );
};

export default ChartContainer;

