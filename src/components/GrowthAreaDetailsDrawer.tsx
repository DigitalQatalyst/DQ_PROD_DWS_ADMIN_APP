import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon, CheckCircleIcon, ArchiveIcon, FlagIcon, BarChartIcon, TrendingUpIcon, ClockIcon, StarIcon, MaximizeIcon, MinimizeIcon, CopyIcon, DownloadIcon, BuildingIcon, MailIcon, GlobeIcon, MapPinIcon, PhoneIcon, BriefcaseIcon, TagIcon, HomeIcon, ShieldIcon, TruckIcon, UsersIcon, CalendarIcon, AwardIcon, HashIcon, LinkIcon, DollarSignIcon, PieChartIcon, PercentIcon, LineChartIcon, LightbulbIcon, TargetIcon, LayersIcon, CoinsIcon, ScissorsIcon } from 'lucide-react';
import { createFocusTrap } from 'focus-trap';
import { TabsSimple } from './TabVariations';
import type { SimpleSection } from './TabVariations';
type GrowthAreaDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  growthArea: any;
};
export const GrowthAreaDetailsDrawer: React.FC<GrowthAreaDetailsDrawerProps> = ({
  isOpen,
  onClose,
  growthArea
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Set up focus trap for accessibility
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Store the currently focused element to restore focus later
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      // Create and activate focus trap
      focusTrapRef.current = createFocusTrap(drawerRef.current, {
        fallbackFocus: drawerRef.current,
        escapeDeactivates: false,
        allowOutsideClick: true
      });
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        focusTrapRef.current?.activate();
      }, 100);
    }
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        // Restore focus when drawer closes
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus();
        }
      }
    };
  }, [isOpen]);
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      // Escape key to close/collapse drawer
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isExpanded) {
          toggleExpanded();
        } else {
          handleClose();
        }
      }
      // Shift+Enter to toggle expanded view
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        toggleExpanded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded]);
  // Handle URL params for deep linking
  useEffect(() => {
    if (isOpen) {
      updateUrlParams();
    }
  }, [isOpen, isExpanded, growthArea]);
  // Check for deep link parameters on mount
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === 'full') {
        setIsExpanded(true);
      }
    };
    if (isOpen) {
      checkUrlParams();
    }
  }, [isOpen]);
  // Apply content scale effect when drawer opens
  useEffect(() => {
    if (isOpen && contentRef.current && !prefersReducedMotion.current) {
      contentRef.current.style.transform = 'scale(0.98)';
      contentRef.current.style.opacity = '0';
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(1)';
          contentRef.current.style.opacity = '1';
        }
      }, 50);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  // Get available tabs based on growth area data
  const getAvailableTabs = () => {
    const tabs = [{
      id: 'overview',
      title: 'Overview'
    }, {
      id: 'statistics',
      title: 'Statistics'
    }, {
      id: 'opportunities',
      title: 'Opportunities'
    }, {
      id: 'support',
      title: 'Support & Resources'
    }];
    return tabs;
  };
  const availableTabs = getAvailableTabs();
  // Get current active tab ID
  const getActiveTabId = () => {
    return availableTabs[activeTabIndex]?.id || 'overview';
  };
  // Update URL params for deep linking
  const updateUrlParams = () => {
    const url = new URL(window.location.href);
    if (isOpen && growthArea) {
      url.searchParams.set('areaId', growthArea.id);
      if (isExpanded) {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.set('view', 'drawer');
      }
    } else {
      url.searchParams.delete('areaId');
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };
  // Render growth area type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Established: 'bg-blue-100 text-blue-800 border border-blue-200',
      Emerging: 'bg-purple-100 text-purple-800 border border-purple-200',
      Strategic: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>;
  };
  // Render growth area status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Growing: 'bg-green-100 text-green-800 border border-green-200',
      Stable: 'bg-amber-100 text-amber-800 border border-amber-200',
      Accelerating: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      Emerging: 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Copy deep link to clipboard
  const copyDeepLink = () => {
    const areaId = growthArea.id;
    const currentUrl = new URL(window.location.href);
    // Ensure we're on the growth-areas page
    currentUrl.pathname = '/growth-areas';
    // Set the query parameters
    currentUrl.searchParams.set('areaId', areaId);
    currentUrl.searchParams.set('view', isExpanded ? 'full' : 'drawer');
    navigator.clipboard.writeText(currentUrl.toString());
    alert('Link copied to clipboard!');
  };
  // Export growth area details as PDF
  const exportPdf = () => {
    alert('Exporting growth area details as PDF...');
  };
  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  // Handle drawer close with URL cleanup
  const handleClose = () => {
    // Deactivate focus trap
    if (focusTrapRef.current) {
      focusTrapRef.current.deactivate();
    }
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('areaId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close drawer
    onClose();
  };
  // Filter businesses in this growth area
  const getBusinessesInArea = () => {
    // TODO: Replace with actual business data from database
    return [];
  };
  // Format percentage for display
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };
  // Get icon component from icon name
  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      'TrendingUp': TrendingUpIcon,
      'BarChart': BarChartIcon,
      'Building': BuildingIcon,
      'Layers': LayersIcon,
      'CircleDollarSign': DollarSignIcon,
      'Users': UsersIcon,
    };
    return iconMap[iconName || ''] || TrendingUpIcon; // Default to TrendingUpIcon
  };
  // Render overview tab
  const renderOverview = () => {
    const IconComponent = getIconComponent(growthArea.icon?.name);
    return <div className="px-6 lg:px-8">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className={`h-16 w-16 rounded-full ${growthArea.iconBgColor || 'bg-gray-100'} flex items-center justify-center`}>
          <IconComponent className={`h-8 w-8 ${growthArea.iconColor || 'text-gray-600'}`} />
        </div>
      </div>
      {/* Growth Area Type */}
      <div className="mb-4 flex items-center">
        <div className={`p-2 rounded-md ${growthArea.type === 'Established' ? 'bg-blue-100 text-blue-600' : growthArea.type === 'Emerging' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {growthArea.type === 'Established' && <BuildingIcon className="h-4 w-4" />}
          {growthArea.type === 'Emerging' && <LightbulbIcon className="h-4 w-4" />}
          {growthArea.type === 'Strategic' && <TargetIcon className="h-4 w-4" />}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-700">
            {growthArea.type}
          </h3>
          <p className="text-xs text-gray-500">
            {growthArea.status && `${growthArea.status}`}
          </p>
        </div>
      </div>
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {growthArea.description}
        </p>
      </div>
      {/* Key Statistics */}
      {growthArea.keyStatistics && growthArea.keyStatistics.length > 0 && <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Key Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {growthArea.keyStatistics.map((stat: any, index: number) => <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </span>
                {stat.change && <span className={`ml-2 text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(stat.change)}
                  </span>}
              </div>
            </div>)}
        </div>
      </div>}
      {/* Growth Projection */}
      {growthArea.growthProjection && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Growth Projection
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <TrendingUpIcon className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                {growthArea.growthProjection.rate}%{' '}
                {growthArea.growthProjection.period}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {growthArea.growthProjection.description}
            </p>
          </div>
        </div>}
      {/* Associated Zones */}
      {growthArea.associatedZones && growthArea.associatedZones.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Associated Zones & Clusters
          </h3>
          <div className="space-y-3">
            {growthArea.associatedZones.map((zone: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center">
                  <BuildingIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-800">
                    {zone.name}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {zone.type}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {zone.location}
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <a href={`/zones-clusters?zoneId=${zone.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
                    View Details
                    <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                  </a>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Key Players */}
      {growthArea.keyPlayers && growthArea.keyPlayers.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Key Players
          </h3>
          <div className="space-y-3">
            {growthArea.keyPlayers.map((player: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-800">
                    {player.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {player.description}
                </p>
              </div>)}
          </div>
        </div>}
      {/* Regulatory Framework */}
      {growthArea.regulatoryFramework && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Regulatory Framework
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <ShieldIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                {growthArea.regulatoryFramework.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {growthArea.regulatoryFramework.description}
            </p>
            {growthArea.regulatoryFramework.keyRegulations && <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Key Regulations:
                </h4>
                <ul className="space-y-1">
                  {growthArea.regulatoryFramework.keyRegulations.map((regulation: string, idx: number) => <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>{regulation}</span>
                      </li>)}
                </ul>
              </div>}
          </div>
        </div>}
    </div>;
  };
  // Render statistics tab
  const renderStatistics = () => <div className="px-6 lg:px-8">
      {/* Economic Impact */}
      {growthArea.economicImpact && growthArea.economicImpact.length > 0 && <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Economic Impact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {growthArea.economicImpact.map((stat: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </span>
                {stat.change && <span className={`ml-2 text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(stat.change)}
                  </span>}
              </div>
              {stat.description && <p className="mt-1 text-xs text-gray-600">{stat.description}</p>}
            </div>)}
        </div>
      </div>}
      {/* Employment */}
      {growthArea.employment && growthArea.employment.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Employment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {growthArea.employment.map((stat: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </span>
                {stat.change && <span className={`ml-2 text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(stat.change)}
                  </span>}
              </div>
              {stat.description && <p className="mt-1 text-xs text-gray-600">{stat.description}</p>}
            </div>)}
        </div>
      </div>}
      {/* Market Trends */}
      {growthArea.marketTrends && growthArea.marketTrends.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Market Trends
          </h3>
          <div className="space-y-4">
            {growthArea.marketTrends.map((trend: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-md ${trend.impact === 'Positive' ? 'bg-green-100 text-green-600' : trend.impact === 'Neutral' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} mr-3 mt-0.5`}>
                    {trend.impact === 'Positive' && <TrendingUpIcon className="h-4 w-4" />}
                    {trend.impact === 'Neutral' && <TargetIcon className="h-4 w-4" />}
                    {trend.impact === 'Challenging' && <LineChartIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">
                      {trend.name}
                    </h4>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Comparative Analysis */}
      {growthArea.comparativeAnalysis && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Comparative Analysis
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 mb-4">
              {growthArea.comparativeAnalysis.description}
            </p>
            <h4 className="text-xs font-medium text-gray-700 mb-3">
              Comparison with Regional Markets
            </h4>
            <div className="space-y-3 mb-4">
              {growthArea.comparativeAnalysis.regionalComparison.map((item: any, idx: number) => <div key={idx} className="flex items-center">
                    <div className="w-24 text-xs text-gray-700 font-medium">
                      {item.region}
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{
                width: `${item.percentile}%`
              }}></div>
                    </div>
                    <div className="w-12 text-xs text-gray-700 text-right">
                      {item.percentile}%
                    </div>
                  </div>)}
            </div>
            <h4 className="text-xs font-medium text-gray-700 mb-3">
              Competitive Advantages
            </h4>
            <div className="space-y-2">
              {growthArea.comparativeAnalysis.advantages.map((advantage: string, idx: number) => <div key={idx} className="flex items-start">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" />
                    <p className="text-sm text-gray-700">{advantage}</p>
                  </div>)}
            </div>
          </div>
        </div>}
      {/* Industry Breakdown */}
      {growthArea.industryBreakdown && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Industry Breakdown
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-4">
              {growthArea.industryBreakdown.map((segment: any, idx: number) => <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {segment.name}
                    </span>
                    <span className="text-sm text-gray-700">
                      {segment.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${segment.color}`} style={{
                width: `${segment.percentage}%`
              }}></div>
                  </div>
                  {segment.description && <p className="mt-1 text-xs text-gray-600">
                      {segment.description}
                    </p>}
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
  // Render opportunities tab
  const renderOpportunities = () => <div className="px-6 lg:px-8">
      {/* Investment Opportunities */}
      {growthArea.investmentOpportunities && growthArea.investmentOpportunities.length > 0 && <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Investment Opportunities
            </h3>
            <div className="space-y-4">
              {growthArea.investmentOpportunities.map((opportunity: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-md ${opportunity.riskLevel === 'Low' ? 'bg-green-100 text-green-600' : opportunity.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'} mr-3 mt-0.5`}>
                        <CoinsIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-800">
                            {opportunity.title}
                          </h4>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${opportunity.riskLevel === 'Low' ? 'bg-green-100 text-green-800 border border-green-200' : opportunity.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {opportunity.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {opportunity.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">
                              Investment Range:
                            </span>{' '}
                            <span className="font-medium text-gray-700">
                              {opportunity.investmentRange}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Expected ROI:</span>{' '}
                            <span className="font-medium text-gray-700">
                              {opportunity.expectedROI}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Timeframe:</span>{' '}
                            <span className="font-medium text-gray-700">
                              {opportunity.timeframe}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>}
      {/* Strategic Initiatives */}
      {growthArea.strategicInitiatives && growthArea.strategicInitiatives.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Strategic Initiatives
            </h3>
            <div className="space-y-4">
              {growthArea.strategicInitiatives.map((initiative: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start">
                      <div className="p-2 rounded-md bg-indigo-100 text-indigo-600 mr-3 mt-0.5">
                        <TargetIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                          {initiative.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {initiative.description}
                        </p>
                        {initiative.timeline && <div className="mt-3 pt-3 border-t border-gray-100">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">
                              Timeline:
                            </h5>
                            <div className="flex items-center">
                              <CalendarIcon className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                              <span className="text-xs text-gray-700">
                                {initiative.timeline}
                              </span>
                            </div>
                          </div>}
                        {initiative.partners && initiative.partners.length > 0 && <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Key Partners:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {initiative.partners.map((partner: string, idx: number) => <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {partner}
                                    </span>)}
                              </div>
                            </div>}
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>}
      {/* Success Stories */}
      {growthArea.successStories && growthArea.successStories.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Success Stories
          </h3>
          <div className="space-y-4">
            {growthArea.successStories.map((story: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center mb-2">
                  {story.logo ? <div className="h-8 w-8 rounded overflow-hidden border border-gray-200 mr-3 flex-shrink-0">
                      <img src={story.logo} alt={`${story.companyName} logo`} className="h-full w-full object-contain" />
                    </div> : <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                    </div>}
                  <h4 className="text-sm font-medium text-gray-800">
                    {story.companyName}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {story.description}
                </p>
                {story.outcomes && story.outcomes.length > 0 && <div className="mt-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                      Key Outcomes:
                    </h5>
                    <ul className="space-y-1">
                      {story.outcomes.map((outcome: string, idx: number) => <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>)}
                    </ul>
                  </div>}
              </div>)}
          </div>
        </div>}
      {/* Businesses */}
      {growthArea.associatedBusinesses && growthArea.associatedBusinesses.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Businesses in this Sector
            </h3>
            <div className="space-y-4">
              {getBusinessesInArea().map((business: any) => <div key={business.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    {business.logo && <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-100 flex items-center justify-center bg-white">
                        <img src={business.logo} alt={`${business.name} logo`} className="max-h-8 max-w-8 object-contain" />
                      </div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {business.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {business.foundedYear}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {business.industry}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                        ${business.type === 'Government' ? 'bg-blue-100 text-blue-800' : business.type === 'Private' ? 'bg-purple-100 text-purple-800' : business.type === 'Semi-Government' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {business.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {business.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      <span>{business.employees}</span>
                    </div>
                    <a href={`/business-directory?businessId=${business.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
                      View Details
                      <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                    </a>
                  </div>
                </div>)}
            </div>
          </div>}
    </div>;
  // Render support tab
  const renderSupport = () => <div className="px-6 lg:px-8">
      {/* Support Programs */}
      {growthArea.supportPrograms && growthArea.supportPrograms.length > 0 && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Support Programs
          </h3>
          <div className="space-y-4">
            {growthArea.supportPrograms.map((program: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-md ${program.type === 'Financial' ? 'bg-green-100 text-green-600' : program.type === 'Technical' ? 'bg-blue-100 text-blue-600' : program.type === 'Regulatory' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'} mr-3 mt-0.5`}>
                    {program.type === 'Financial' && <DollarSignIcon className="h-4 w-4" />}
                    {program.type === 'Technical' && <LightbulbIcon className="h-4 w-4" />}
                    {program.type === 'Regulatory' && <ShieldIcon className="h-4 w-4" />}
                    {program.type === 'Training' && <UsersIcon className="h-4 w-4" />}
                    {!['Financial', 'Technical', 'Regulatory', 'Training'].includes(program.type) && <TagIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">
                      {program.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {program.description}
                    </p>
                    {program.eligibility && <div className="mt-3 pt-3 border-t border-gray-100">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">
                          Eligibility:
                        </h5>
                        <p className="text-xs text-gray-600">
                          {program.eligibility}
                        </p>
                      </div>}
                    {program.applicationProcess && <div className="mt-2">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">
                          How to Apply:
                        </h5>
                        <p className="text-xs text-gray-600">
                          {program.applicationProcess}
                        </p>
                      </div>}
                    {program.contact && <div className="mt-3 pt-3 border-t border-gray-100">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">
                          Contact:
                        </h5>
                        <div className="flex items-center">
                          <MailIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <a href={`mailto:${program.contact.email}`} className="text-xs text-blue-600 hover:underline">
                            {program.contact.email}
                          </a>
                        </div>
                        {program.contact.phone && <div className="flex items-center mt-1">
                            <PhoneIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <a href={`tel:${program.contact.phone}`} className="text-xs text-blue-600 hover:underline">
                              {program.contact.phone}
                            </a>
                          </div>}
                      </div>}
                    {program.website && <div className="mt-3">
                        <a href={program.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
                          Visit Program Website
                          <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                        </a>
                      </div>}
                  </div>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Incentives */}
      {growthArea.incentives && growthArea.incentives.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Incentives
          </h3>
          <div className="space-y-4">
            {growthArea.incentives.map((incentive: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-md ${incentive.category === 'Tax' ? 'bg-green-100 text-green-600' : incentive.category === 'Land' ? 'bg-amber-100 text-amber-600' : incentive.category === 'Regulatory' ? 'bg-purple-100 text-purple-600' : incentive.category === 'Funding' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} mr-3 mt-0.5`}>
                    {incentive.category === 'Tax' && <DollarSignIcon className="h-4 w-4" />}
                    {incentive.category === 'Land' && <HomeIcon className="h-4 w-4" />}
                    {incentive.category === 'Regulatory' && <ShieldIcon className="h-4 w-4" />}
                    {incentive.category === 'Funding' && <CoinsIcon className="h-4 w-4" />}
                    {!['Tax', 'Land', 'Regulatory', 'Funding'].includes(incentive.category) && <TagIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">
                      {incentive.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {incentive.description}
                    </p>
                    {incentive.eligibility && <div className="mt-3 pt-3 border-t border-gray-100">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">
                          Eligibility:
                        </h5>
                        <p className="text-xs text-gray-600">
                          {incentive.eligibility}
                        </p>
                      </div>}
                  </div>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Resources */}
      {growthArea.resources && growthArea.resources.length > 0 && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Resources
          </h3>
          <div className="space-y-4">
            {growthArea.resources.map((resource: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-gray-100 text-gray-600 mr-3 mt-0.5">
                    {resource.type === 'Guide' && <FileTextIcon className="h-4 w-4" />}
                    {resource.type === 'Report' && <BarChartIcon className="h-4 w-4" />}
                    {resource.type === 'Website' && <GlobeIcon className="h-4 w-4" />}
                    {resource.type === 'Contact' && <UserIcon className="h-4 w-4" />}
                    {!['Guide', 'Report', 'Website', 'Contact'].includes(resource.type) && <LinkIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">
                      {resource.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {resource.description}
                    </p>
                    {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
                        {resource.type === 'Guide' ? 'Download Guide' : resource.type === 'Report' ? 'View Report' : resource.type === 'Website' ? 'Visit Website' : 'Access Resource'}
                        <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                      </a>}
                  </div>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Contact Information */}
      {growthArea.contactInformation && <div className="mb-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Contact Information
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <BuildingIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                {growthArea.contactInformation.department}
              </h4>
            </div>
            <div className="space-y-3">
              {growthArea.contactInformation.email && <div className="flex items-center">
                  <MailIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`mailto:${growthArea.contactInformation.email}`} className="text-sm text-blue-600">
                    {growthArea.contactInformation.email}
                  </a>
                </div>}
              {growthArea.contactInformation.phone && <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`tel:${growthArea.contactInformation.phone}`} className="text-sm text-blue-600">
                    {growthArea.contactInformation.phone}
                  </a>
                </div>}
              {growthArea.contactInformation.website && <div className="flex items-center">
                  <GlobeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={growthArea.contactInformation.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">
                    {growthArea.contactInformation.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>}
              {growthArea.contactInformation.address && <div className="flex items-start">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {growthArea.contactInformation.address}
                  </p>
                </div>}
            </div>
          </div>
        </div>}
    </div>;
  // Determine drawer width based on expanded state and screen size
  const getDrawerWidth = () => {
    // On mobile, always use full width
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
      return '100vw';
    }
    // On tablet, use 60vw or 100vw for expanded
    if (typeof window !== 'undefined' && window.innerWidth <= 1279) {
      return isExpanded ? '100vw' : '60vw';
    }
    // On desktop, use 40vw or 100vw for expanded
    return isExpanded ? '100vw' : '40vw';
  };
  // Define transition classes for reduced motion preference
  const transitionClass = prefersReducedMotion.current ? '' : 'transition-all duration-300 ease-in-out';
  // Determine overlay opacity based on screen size
  const overlayOpacity = typeof window !== 'undefined' && window.innerWidth <= 767 ? 'opacity-50' : 'opacity-30';
  // Render the appropriate tab content based on active tab
  const renderTabContent = () => {
    const activeTabId = getActiveTabId();
    switch (activeTabId) {
      case 'overview':
        return renderOverview();
      case 'statistics':
        return renderStatistics();
      case 'opportunities':
        return renderOpportunities();
      case 'support':
        return renderSupport();
      default:
        return renderOverview();
    }
  };
  return <div className="fixed inset-0 overflow-hidden z-50">
      {/* Background overlay */}
      <div className={`absolute inset-0 bg-black ${transitionClass} ${isOpen ? overlayOpacity : 'opacity-0'}`} onClick={isExpanded ? undefined : handleClose} aria-hidden="true"></div>
      {/* Drawer container */}
      <div className={`fixed inset-y-0 right-0 ${transitionClass}`} style={{
      width: getDrawerWidth(),
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
    }} ref={drawerRef}>
        <div className="h-full bg-white shadow-xl overflow-hidden flex flex-col">
          {/* Content container with smooth scale/fade effect */}
          <div ref={contentRef} className={`flex flex-col h-full ${transitionClass}`} style={{
          opacity: 1,
          transform: 'scale(1)'
        }}>
            {/* Drawer Header - Sticky with white background and shadow */}
            <div ref={headerRef} className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 transition-all duration-300 ease-in-out">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center sm:items-start">
                    <button type="button" className="sm:hidden mr-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" onClick={handleClose}>
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {growthArea.name}
                      </h2>
                      <div className="mt-1 flex flex-col space-y-1">
                        <div className="flex items-center">
                          {renderStatus(growthArea.status)}
                          <span className="ml-2">
                            {renderType(growthArea.type)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-700">
                            {growthArea.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpanded && <>
                        <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={exportPdf} title="Export as PDF">
                          <span className="sr-only">Export as PDF</span>
                          <DownloadIcon className="h-5 w-5" />
                        </button>
                        <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={copyDeepLink} title="Copy Link">
                          <span className="sr-only">Copy Link</span>
                          <CopyIcon className="h-5 w-5" />
                        </button>
                      </>}
                    <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={toggleExpanded} title={isExpanded ? 'Collapse' : 'Expand'}>
                      <span className="sr-only">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? <MinimizeIcon className="h-5 w-5" /> : <MaximizeIcon className="h-5 w-5" />}
                    </button>
                    <button type="button" className="hidden sm:block rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={handleClose}>
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Tabs Navigation */}
            <div ref={tabsRef} className="sticky top-[57px] sm:top-[72px] z-10 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''} px-4 sm:px-6`}>
                <TabsSimple sections={availableTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} data-id="growth-area-details-tabs" />
              </div>
            </div>
            {/* Tab Content - Scrollable area with max height */}
            <div ref={contentAreaRef} className="flex-1 overflow-y-auto" style={{
            maxHeight: 'calc(100vh - 160px)'
          }}>
              <div className={`py-6 ${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                {renderTabContent()}
              </div>
            </div>
            {/* Drawer Footer - Sticky at the bottom */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 shadow-inner">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                  <button type="button" className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={isExpanded ? toggleExpanded : handleClose}>
                    {isExpanded ? 'Collapse' : 'Close'}
                  </button>
                  <div className="flex sm:space-x-3">
                    {growthArea.supportPrograms && growthArea.supportPrograms.length > 0 && <button type="button" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={() => setActiveTabIndex(3)} // Switch to Support tab
                  >
                          View Support Programs
                        </button>}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="hidden sm:inline">
                    Keyboard shortcuts: Esc to close, Shift+Enter to toggle full
                    view
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};