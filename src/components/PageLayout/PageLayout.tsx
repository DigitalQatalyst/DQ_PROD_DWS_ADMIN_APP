import React, { Fragment, Component } from 'react';
import { ChevronRight, Home } from 'lucide-react';
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ComponentType<{
    className?: string;
  }>;
  current?: boolean;
}
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  'data-id'?: string;
}
export function Breadcrumbs({
  items,
  className = '',
  'data-id': dataId
}: BreadcrumbsProps) {
  // Determine if we're using a custom color scheme (e.g., white text)
  const isCustomColor = className.includes('text-white') || className.includes('text-');
  const defaultTextColor = isCustomColor ? '' : 'text-gray-600';
  const defaultCurrentColor = isCustomColor ? '' : 'text-gray-900';
  const defaultIconColor = isCustomColor ? '' : 'text-gray-400';
  const defaultHoverColor = isCustomColor ? 'hover:opacity-80' : 'hover:text-gray-800';
  return <nav className={`flex items-center gap-2 text-sm ${className}`} style={{
    whiteSpace: 'nowrap'
  }} aria-label="Breadcrumb" data-id={dataId}>
      {items.map((item, index) => <Fragment key={index}>
          {index > 0 && <ChevronRight className={`w-3 h-3 ${defaultIconColor}`} />}
          {item.current ? <span className={`${defaultCurrentColor} font-medium flex items-center`}>
              {index === 0 && <Home className={`w-4 h-4 ${defaultIconColor} mr-1`} />}
              {item.label}
            </span> : <a href={item.href || '#'} className={`${defaultTextColor} ${defaultHoverColor} flex items-center`}>
              {index === 0 && <Home className={`w-4 h-4 ${defaultIconColor} mr-1`} />}
              {item.label}
            </a>}
        </Fragment>)}
    </nav>;
}
interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  variant?: 'default' | 'fullWidthHeader';
  subtitle?: string;
  backgroundImage?: string;
  'data-id'?: string;
}
export function PageHeader({
  title,
  breadcrumbs,
  variant = 'default',
  subtitle,
  backgroundImage,
  'data-id': dataId
}: PageHeaderProps) {
  if (variant === 'fullWidthHeader') {
    return <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20 md:py-28 shadow-sm min-h-[320px] md:min-h-[420px]" data-id={dataId}>
        {backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
        backgroundImage: `url(${backgroundImage})`
      }} />}
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-50/20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-3 md:mb-4">
              <Breadcrumbs items={breadcrumbs} className="text-white drop-shadow-sm" />
            </div>}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-4">
            {title}
          </h1>
          {subtitle && <p className="text-base md:text-lg text-indigo-100 mt-2 md:mt-3 max-w-3xl">
              {subtitle}
            </p>}
        </div>
      </section>;
  }
  // Default variant - transparent header with consistent styling
  return <header className="pt-6 md:pt-10 pb-4 md:pb-6 bg-transparent" data-id={dataId}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-2">
            <Breadcrumbs items={breadcrumbs} />
          </div>}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          {title}
        </h1>
      </div>
    </header>;
}
interface PageLayoutProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerVariant?: 'default' | 'fullWidthHeader';
  headerSubtitle?: string;
  headerBackgroundImage?: string;
  children: React.ReactNode;
  'data-id'?: string;
}
export function PageLayout({
  title,
  breadcrumbs,
  headerVariant = 'default',
  headerSubtitle,
  headerBackgroundImage,
  children,
  'data-id': dataId
}: PageLayoutProps) {
  // Full-width header variant
  if (headerVariant === 'fullWidthHeader') {
    return <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50" data-id={dataId}>
        {title && <PageHeader title={title} breadcrumbs={breadcrumbs} variant="fullWidthHeader" subtitle={headerSubtitle} backgroundImage={headerBackgroundImage} />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8 md:mt-10 md:pb-10">
          <div className="space-y-4 md:space-y-6">{children}</div>
        </div>
      </main>;
  }
  // Default variant - standard contained layout
  return <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50" data-id={dataId}>
      {title && <PageHeader title={title} breadcrumbs={breadcrumbs} variant="default" />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 md:mt-10 space-y-4 md:space-y-6">{children}</div>
      </div>
    </main>;
}
interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  'data-id'?: string;
}
export function PageSection({
  children,
  className = '',
  'data-id': dataId
}: PageSectionProps) {
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-200 max-w-full overflow-hidden ${className}`} data-id={dataId}>
      {children}
    </div>;
}
interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  'data-id'?: string;
}
export function SectionHeader({
  title,
  description,
  actions,
  'data-id': dataId
}: SectionHeaderProps) {
  return <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 gap-3" data-id={dataId}>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          {title}
        </h2>
        {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>;
}
interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
  'data-id'?: string;
}
export function SectionContent({
  children,
  className = '',
  'data-id': dataId
}: SectionContentProps) {
  return <div className={`p-4 sm:p-6 ${className}`} data-id={dataId}>
      {children}
    </div>;
}
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-id'?: string;
}
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  'data-id': dataId
}: PrimaryButtonProps) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
        text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${className}
      `} data-id={dataId}>
      {children}
    </button>;
}
interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-id'?: string;
}
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  'data-id': dataId
}: SecondaryButtonProps) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`
        inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md
        text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${className}
      `} data-id={dataId}>
      {children}
    </button>;
}