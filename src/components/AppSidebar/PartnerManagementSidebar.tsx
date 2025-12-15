import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Info, Lock, Home, Users, UserCheck, List, FileEdit, FileText, Target, DollarSign, CreditCard, Receipt, BarChart3, FolderOpen, BookOpen, Image, MessageSquare, Settings, HelpCircle, Plus, Check } from 'lucide-react';
interface Company {
  id: string;
  name: string;
  role: string;
  isActive?: boolean;
  badge?: string;
}
interface PartnerManagementSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  onboardingComplete?: boolean;
  companies?: Company[];
  onCompanyChange?: (companyId: string) => void;
  onAddNewEnterprise?: () => void;
  isLoggedIn?: boolean;
  'data-id'?: string;
}
export const PartnerManagementSidebar: React.FC<PartnerManagementSidebarProps> = ({
  isOpen = true,
  onClose,
  activeSection = 'dashboard',
  onSectionChange,
  onboardingComplete = false,
  companies = [],
  onCompanyChange,
  onAddNewEnterprise,
  isLoggedIn = true,
  'data-id': dataId
}) => {
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  if (!isLoggedIn) {
    return null;
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      const menuItems = getPartnerMenuItems().filter((item: any) => item.category !== 'category');
      switch (event.key) {
        case 'Escape':
          if (companyDropdownOpen) {
            setCompanyDropdownOpen(false);
          } else {
            onClose?.();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedMenuIndex(prev => {
            const next = prev < menuItems.length - 1 ? prev + 1 : 0;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedMenuIndex(prev => {
            const next = prev > 0 ? prev - 1 : menuItems.length - 1;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, companyDropdownOpen, onClose]);
  const getPartnerMenuItems = () => {
    const items: any[] = [];
    if (!onboardingComplete) {
      items.push({
        id: 'onboarding',
        label: 'Partner Onboarding',
        icon: <Users size={20} />
      });
    } else {
      items.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home size={20} />
      });
    }
    items.push({
      id: 'partner-ops',
      label: 'PARTNER OPERATIONS',
      category: 'category'
    }, {
      id: 'partners',
      label: 'All Partners',
      icon: <UserCheck size={20} />
    }, {
      id: 'my-listings',
      label: 'My Listings',
      icon: <List size={20} />
    }, {
      id: 'my-content',
      label: 'My Content',
      icon: <FileEdit size={20} />
    }, {
      id: 'applications',
      label: 'Applications',
      icon: <FileText size={20} />
    }, {
      id: 'recruitment',
      label: 'Recruitment',
      icon: <Target size={20} />
    }, {
      id: 'financials',
      label: 'FINANCIALS',
      category: 'category'
    }, {
      id: 'commissions',
      label: 'Commissions',
      icon: <DollarSign size={20} />
    }, {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard size={20} />
    }, {
      id: 'invoices',
      label: 'Invoices',
      icon: <Receipt size={20} />
    }, {
      id: 'performance',
      label: 'PERFORMANCE',
      category: 'category'
    }, {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />
    }, {
      id: 'reports',
      label: 'Reports',
      icon: <FileText size={20} />
    }, {
      id: 'resources',
      label: 'RESOURCES',
      category: 'category'
    }, {
      id: 'documents',
      label: 'Documents',
      icon: <FolderOpen size={20} />
    }, {
      id: 'training',
      label: 'Training',
      icon: <BookOpen size={20} />
    }, {
      id: 'marketing',
      label: 'Marketing Assets',
      icon: <Image size={20} />
    }, {
      id: 'management',
      label: 'MANAGEMENT',
      category: 'category'
    }, {
      id: 'communications',
      label: 'Communications',
      icon: <MessageSquare size={20} />
    }, {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />
    }, {
      id: 'support',
      label: 'Support',
      icon: <HelpCircle size={20} />
    });
    return items;
  };
  const activeCompany = companies.find((c: any) => c.isActive) || companies[0];
  return <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:w-60 overflow-y-auto`} data-id={dataId}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <button className="lg:hidden text-gray-500" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button className="w-full flex items-center justify-between text-left p-3 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCompanyDropdownOpen(!companyDropdownOpen);
          } else if (e.key === 'Escape') {
            setCompanyDropdownOpen(false);
          }
        }}>
            <div className="flex-1 min-w-0">
              <h2 className="text-blue-800 font-bold text-lg leading-tight truncate">
                {activeCompany?.name || 'Partner Portal'}
              </h2>
              {activeCompany?.badge && <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                  {activeCompany.badge}
                </span>}
            </div>
            <ChevronDown size={18} className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {companyDropdownOpen && <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {companies.map((company: any) => <button key={company.id} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between" onClick={() => {
              onCompanyChange?.(company.id);
              setCompanyDropdownOpen(false);
            }} onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCompanyChange?.(company.id);
                setCompanyDropdownOpen(false);
              }
            }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.role}
                      </div>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      {company.badge && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                          {company.badge}
                        </span>}
                      {company.isActive && <Check size={16} className="text-blue-600" />}
                    </div>
                  </button>)}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600" onClick={() => {
                onAddNewEnterprise?.();
                setCompanyDropdownOpen(false);
              }} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAddNewEnterprise?.();
                  setCompanyDropdownOpen(false);
                }
              }}>
                    <Plus size={16} className="mr-2 flex-shrink-0" />
                    Add New Enterprise
                  </button>
                </div>
              </div>
            </div>}
        </div>
      </div>
      {!onboardingComplete && <div className="bg-amber-50 p-3 m-3 rounded-md border border-amber-200">
          <div className="flex items-start">
            <Info size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Complete the partner onboarding process to unlock all sections of
              the platform.
            </p>
          </div>
        </div>}
      <nav className="py-2">
        {getPartnerMenuItems().map((item: any, index: number) => {
        if (item.category === 'category') {
          return <div key={item.id} className="px-4 pt-6 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
                  {item.label}
                </div>
              </div>;
        }
        const isDisabled = !onboardingComplete && item.id !== 'onboarding';
        const isActive = activeSection === item.id;
        const menuItemIndex = getPartnerMenuItems().filter((i: any) => i.category !== 'category').findIndex((i: any) => i.id === item.id);
        return <div key={item.id} ref={el => menuItemsRef.current[menuItemIndex] = el} className={`flex items-center px-4 py-3 relative transition-colors ${isActive ? 'bg-blue-700 text-white' : isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 cursor-pointer'}`} onClick={() => !isDisabled && onSectionChange?.(item.id)} onMouseEnter={() => isDisabled && setTooltipItem(item.id)} onMouseLeave={() => setTooltipItem(null)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isDisabled && onSectionChange?.(item.id);
          }
        }} tabIndex={0} role="button" aria-label={`Navigate to ${item.label}`} aria-disabled={isDisabled}>
              <span className="w-8 flex items-center justify-center flex-shrink-0">
                {isDisabled && !isActive ? <div className="relative">
                    {item.icon}
                    <Lock size={10} className="absolute -top-1 -right-1 text-gray-400" />
                  </div> : item.icon}
              </span>
              <span className="flex-1 ml-3">{item.label}</span>
              {tooltipItem === item.id && <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs py-2 px-3 rounded-md w-48 z-50">
                  Complete partner onboarding to unlock this section
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                </div>}
            </div>;
      })}
      </nav>
    </div>;
};