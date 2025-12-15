import React, { useState, Fragment } from 'react';
import { Menu, X, ChevronRight, Home } from 'lucide-react';
// ============================================================================
// HEADER COMPONENTS
// ============================================================================
interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}
interface PublicHeaderProps {
  logo?: React.ReactNode;
  navLinks?: NavLink[];
  ctaButton?: React.ReactNode;
  variant?: 'public' | 'app';
  'data-id'?: string;
}
export function PublicHeader({
  logo,
  navLinks = [],
  ctaButton,
  variant = 'public',
  'data-id': dataId
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm" data-id={dataId}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {logo || <div className="text-xl font-bold text-gray-900">Logo</div>}
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link, index) => <a key={index} href={link.href} className={`text-sm font-medium transition-colors ${link.active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                {link.label}
              </a>)}
          </nav>
          {/* CTA Button */}
          <div className="hidden md:flex md:items-center">{ctaButton}</div>
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile Navigation */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link, index) => <a key={index} href={link.href} className={`text-sm font-medium transition-colors ${link.active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </a>)}
              {ctaButton && <div className="pt-2">{ctaButton}</div>}
            </nav>
          </div>}
      </div>
    </header>;
}
// ============================================================================
// FOOTER COMPONENT
// ============================================================================
interface FooterLink {
  label: string;
  href: string;
}
interface FooterSection {
  title: string;
  links: FooterLink[];
}
interface PublicFooterProps {
  logo?: React.ReactNode;
  sections?: FooterSection[];
  copyright?: string;
  socialLinks?: React.ReactNode;
  variant?: 'public' | 'app';
  'data-id'?: string;
}
export function PublicFooter({
  logo,
  sections = [],
  copyright,
  socialLinks,
  variant = 'public',
  'data-id': dataId
}: PublicFooterProps) {
  return <footer className="border-t border-gray-200 bg-white mt-20 md:mt-28" data-id={dataId}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
          {/* Logo Section */}
          <div className="col-span-2">
            {logo || <div className="text-xl font-bold text-gray-900 mb-4">Logo</div>}
          </div>
          {/* Footer Sections */}
          {sections.map((section, index) => <div key={index} className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => <li key={linkIndex}>
                    <a href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      {link.label}
                    </a>
                  </li>)}
              </ul>
            </div>)}
        </div>
        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            {copyright || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>
          {socialLinks && <div className="flex gap-4">{socialLinks}</div>}
        </div>
      </div>
    </footer>;
}
// ============================================================================
// BREADCRUMBS (for public pages)
// ============================================================================
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}
interface PublicBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  'data-id'?: string;
}
function PublicBreadcrumbs({
  items,
  className = '',
  'data-id': dataId
}: PublicBreadcrumbsProps) {
  return <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb" data-id={dataId}>
      {items.map((item, index) => <Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3 h-3 opacity-60" />}
          {item.current ? <span className="font-medium flex items-center">
              {index === 0 && <Home className="w-4 h-4 opacity-60 mr-1" />}
              {item.label}
            </span> : <a href={item.href || '#'} className="hover:opacity-80 flex items-center transition-opacity">
              {index === 0 && <Home className="w-4 h-4 opacity-60 mr-1" />}
              {item.label}
            </a>}
        </Fragment>)}
    </nav>;
}
// ============================================================================
// HERO SECTION
// ============================================================================
interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  image?: string;
  variant?: 'default' | 'centered' | 'split' | 'gradient';
  backgroundImage?: string;
  'data-id'?: string;
}
export function Hero({
  title,
  subtitle,
  description,
  actions,
  image,
  variant = 'default',
  backgroundImage,
  'data-id': dataId
}: HeroProps) {
  if (variant === 'gradient') {
    return <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-24 md:py-32" data-id={dataId}>
        {backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
        backgroundImage: `url(${backgroundImage})`
      }} />}
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 text-center">
          {subtitle && <p className="text-sm font-semibold text-indigo-100 mb-4 uppercase tracking-wide">
              {subtitle}
            </p>}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            {title}
          </h1>
          {description && <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>}
          {actions && <div className="flex flex-wrap justify-center gap-4">{actions}</div>}
        </div>
      </section>;
  }
  if (variant === 'split' && image) {
    return <section className="bg-white" data-id={dataId}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20 md:py-28">
            <div>
              {subtitle && <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
                  {subtitle}
                </p>}
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                {title}
              </h1>
              {description && <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {description}
                </p>}
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
            <div className="relative">
              <img src={image} alt={title} className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
            </div>
          </div>
        </div>
      </section>;
  }
  if (variant === 'centered') {
    return <section className="bg-white" data-id={dataId}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center py-20 md:py-28">
            {subtitle && <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
                {subtitle}
              </p>}
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
              {title}
            </h1>
            {description && <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {description}
              </p>}
            {actions && <div className="flex flex-wrap justify-center gap-3">
                {actions}
              </div>}
            {image && <div className="mt-8">
                <img src={image} alt={title} className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
              </div>}
          </div>
        </div>
      </section>;
  }
  // Default variant
  return <section className="bg-white" data-id={dataId}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl py-20 md:py-28">
          {subtitle && <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
              {subtitle}
            </p>}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          {description && <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {description}
            </p>}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {image && <div className="pb-12 md:pb-16">
            <img src={image} alt={title} className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
          </div>}
      </div>
    </section>;
}
// ============================================================================
// CONTENT SECTION
// ============================================================================
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  'data-id'?: string;
}
export function ContentSection({
  children,
  className = '',
  'data-id': dataId
}: ContentSectionProps) {
  return <section className={`mt-12 md:mt-16 ${className}`} data-id={dataId}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">{children}</div>
    </section>;
}
// ============================================================================
// PAGE LAYOUTS
// ============================================================================
interface HomePageProps {
  header?: React.ReactNode;
  hero: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  'data-id'?: string;
}
export function HomePage({
  header,
  hero,
  children,
  footer,
  'data-id': dataId
}: HomePageProps) {
  return <div className="min-h-screen flex flex-col bg-gray-50" data-id={dataId}>
      {header}
      <main className="flex-grow">
        {hero}
        {children}
      </main>
      {footer}
    </div>;
}
interface FeaturePageProps {
  header?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'gradient';
  backgroundImage?: string;
  'data-id'?: string;
}
export function FeaturePage({
  header,
  title,
  subtitle,
  description,
  breadcrumbs,
  children,
  footer,
  variant = 'default',
  backgroundImage,
  'data-id': dataId
}: FeaturePageProps) {
  if (variant === 'gradient') {
    return <div className="min-h-screen flex flex-col" data-id={dataId}>
        {header}
        <main className="flex-grow">
          <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-24 md:py-32">
            {backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
            backgroundImage: `url(${backgroundImage})`
          }} />}
            <div className="relative max-w-7xl mx-auto px-6 md:px-10 text-center">
              {breadcrumbs && breadcrumbs.length > 0 && <div className="flex justify-center mb-4">
                  <PublicBreadcrumbs items={breadcrumbs} className="text-indigo-100" />
                </div>}
              {subtitle && <p className="text-sm font-semibold text-indigo-100 mb-3 uppercase tracking-wide">
                  {subtitle}
                </p>}
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                {title}
              </h1>
              {description && <p className="text-xl text-indigo-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                  {description}
                </p>}
            </div>
          </section>
          {children}
        </main>
        {footer}
      </div>;
  }
  return <div className="min-h-screen flex flex-col bg-gray-50" data-id={dataId}>
      {header}
      <main className="flex-grow">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="max-w-3xl mx-auto text-center py-20 md:py-28">
              {breadcrumbs && breadcrumbs.length > 0 && <div className="flex justify-center mb-6">
                  <PublicBreadcrumbs items={breadcrumbs} className="text-gray-500" />
                </div>}
              {subtitle && <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
                  {subtitle}
                </p>}
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                {title}
              </h1>
              {description && <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {description}
                </p>}
            </div>
          </div>
        </section>
        {children}
      </main>
      {footer}
    </div>;
}
interface DetailPageProps {
  header?: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'fullWidthHeader';
  subtitle?: string;
  backgroundImage?: string;
  'data-id'?: string;
}
export function DetailPage({
  header,
  title,
  breadcrumbs,
  children,
  footer,
  variant = 'default',
  subtitle,
  backgroundImage,
  'data-id': dataId
}: DetailPageProps) {
  if (variant === 'fullWidthHeader') {
    return <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden" data-id={dataId}>
        {header}
        <main className="flex-grow overflow-x-hidden">
          <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20 md:py-28 shadow-sm min-h-[320px] md:min-h-[420px]">
            {backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
            backgroundImage: `url(${backgroundImage})`
          }} />}
            {/* Gradient fade overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-50/20 pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-3 md:mb-4">
                  <PublicBreadcrumbs items={breadcrumbs} className="text-white drop-shadow-sm" />
                </div>}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-4">
                {title}
              </h1>
              {subtitle && <p className="text-base md:text-lg text-indigo-100 mt-2 md:mt-3 max-w-3xl">
                  {subtitle}
                </p>}
            </div>
          </section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-8 pb-8 md:mt-10 prose prose-sm max-w-none text-gray-700">
              {children}
            </div>
          </div>
        </main>
        {footer}
      </div>;
  }
  // Default variant
  return <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden" data-id={dataId}>
      {header}
      <main className="flex-grow bg-white overflow-x-hidden">
        <header className="pt-10 pb-6 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-2">
                <PublicBreadcrumbs items={breadcrumbs} className="text-gray-500" />
              </div>}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-10 prose prose-sm max-w-none text-gray-700">
            {children}
          </div>
        </div>
      </main>
      {footer}
    </div>;
}
// ============================================================================
// PUBLIC LAYOUT BASE (Reusable wrapper)
// ============================================================================
interface PublicLayoutBaseProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  'data-id'?: string;
}
export function PublicLayoutBase({
  header,
  children,
  footer,
  'data-id': dataId
}: PublicLayoutBaseProps) {
  return <div className="min-h-screen flex flex-col bg-gray-50" data-id={dataId}>
      {header}
      <main className="flex-grow">{children}</main>
      {footer}
    </div>;
}