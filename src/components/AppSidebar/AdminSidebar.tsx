import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ChevronDown, Info, Lock, Home, Users, FolderOpen, MapPin, TrendingUp, CheckCircle, FileCheck, Flag, Shield, BarChart3, Activity, FileText, MessageSquare, HelpCircle, Settings, Check, Bell, Tags, BookOpen, Briefcase } from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  onboardingComplete?: boolean;
  isLoggedIn?: boolean;
  'data-id'?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen = true,
  onClose,
  activeSection = 'dashboard',
  onSectionChange,
  onboardingComplete = false,
  isLoggedIn = true,
  'data-id': dataId,
}) => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAdminMenuItems = () => {
    const items: any[] = [];

    // Dashboard Segment
    if (onboardingComplete) {
      items.push({ id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, path: '/' });
    } else {
      items.push({ id: 'onboarding', label: 'Platform Setup', icon: <Settings size={20} />, path: '/onboarding' });
    }

    // Role-based visibility flags
    const isAdminMode = role === 'admin' || role === 'hr_admin' || role === 'content_admin';
    const canSeeHR = role === 'admin' || role === 'hr_admin' || role === 'hr_member';
    const canSeeContent = role === 'admin' || role === 'content_admin' || role === 'content_member';

    // 1. USER MANAGEMENT (Now above everything else as requested)
    if (isAdminMode) {
      items.push({
        id: 'user-management-cat',
        label: 'USER MANAGEMENT',
        category: 'category'
      }, {
        id: 'users',
        label: 'Users & Roles',
        icon: <Users size={20} />,
        path: '/users'
      });

      if (role === 'admin') {
        items.push({
          id: 'departments',
          label: 'Departments',
          icon: <FolderOpen size={20} />,
          path: '/departments'
        });
      }
    }

    // 2. SERVICE REQUESTS
    if (canSeeHR) {
      items.push({
        id: 'services-category',
        label: 'SERVICE REQUESTS',
        category: 'category'
      }, {
        id: 'service-management',
        label: 'Service Management',
        icon: <Briefcase size={20} />,
        path: '/service-management'
      });
    }

    // 3. MARKETPLACE HUB
    if (canSeeContent) {
      items.push({
        id: 'marketplace-hub',
        label: 'MARKETPLACE HUB',
        category: 'category'
      }, {
        id: 'media-management',
        label: 'Media Management',
        icon: <FileCheck size={20} />,
        path: '/media-management'
      }, {
        id: 'knowledgehub-management',
        label: 'Knowledge Hub',
        icon: <BookOpen size={20} />,
        path: '/knowledgehub-management'
      }, {
        id: 'course-management',
        label: 'Course Management',
        icon: <BookOpen size={20} />,
        path: '/course-management'
      });
    }

    // 4. ANALYTICS (Super Admin only)
    if (role === 'admin') {
      items.push({
        id: 'analytics-cat',
        label: 'SYSTEM & ANALYTICS',
        category: 'category'
      }, {
        id: 'experience-analytics',
        label: 'Experience Analytics',
        icon: <BarChart3 size={20} />,
        path: '/ejp-transaction-dashboard'
      }, {
        id: 'activity-logs',
        label: 'Activity Logs',
        icon: <Activity size={20} />,
        path: '/activity-logs'
      });
    }

    // Support
    items.push({
      id: 'support-cat',
      label: 'SUPPORT',
      category: 'category'
    }, {
      id: 'help-center',
      label: 'Help Center',
      icon: <HelpCircle size={20} />,
      path: '/help-center'
    });

    return items;
  };

  if (!isLoggedIn) return null;

  const roleLabels: Record<string, string> = {
    admin: 'Super Admin',
    hr_admin: 'HR Admin',
    hr_member: 'HR Team Member',
    content_admin: 'Content Admin',
    content_member: 'Content Team Member',
    viewer: 'Guest Viewer'
  };

  return (
    <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:w-60 overflow-y-auto`} data-id={dataId}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <button className="lg:hidden text-gray-500" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button className="w-full flex items-center justify-between text-left p-2 rounded-xl hover:bg-gray-100 transition-all" onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}>
            <div className="flex-1 min-w-0">
              <h2 className="text-slate-900 font-bold text-base leading-tight truncate">
                {user?.name || 'User'}
              </h2>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5 block">
                {roleLabels[role] || role}
              </span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ml-2 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {companyDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Profile Settings
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => { /* logout is handled in AuthContext */ }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="py-4">
        {getAdminMenuItems().map((item: any) => {
          if (item.category === 'category') {
            return (
              <div key={item.id} className="px-5 pt-6 pb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {item.label}
                </div>
              </div>
            );
          }

          const isActive = activeSection === item.id;
          const isDisabled = !onboardingComplete && item.id !== 'onboarding';

          return (
            <div
              key={item.id}
              className={`flex items-center mx-3 py-2.5 px-3 rounded-lg relative transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : isDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}`}
              onClick={() => {
                if (!isDisabled) {
                  if (item.path) navigate(item.path);
                  onSectionChange?.(item.id);
                }
              }}
              onMouseEnter={() => isDisabled && setTooltipItem(item.id)}
              onMouseLeave={() => setTooltipItem(null)}
            >
              <span className={`w-8 flex items-center justify-center flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                {item.icon}
              </span>
              <span className="flex-1 ml-2 font-medium text-sm">{item.label}</span>
              {tooltipItem === item.id && (
                <div className="absolute left-full ml-2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded shadow-xl whitespace-nowrap z-50">
                  Complete setup to unlock
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};