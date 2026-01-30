import React, { useEffect, useState, useRef, ComponentType } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { BuildingIcon, NewspaperIcon, UsersIcon, GraduationCapIcon, CalendarIcon, SparklesIcon } from 'lucide-react';
interface Marketplace {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  href: string;
}
const marketplaces: Marketplace[] = [
  {
    id: 'learning-center',
    name: 'DQ Learning Center',
    description: 'Explore LMS courses, onboarding tracks, and learning resources across GHC and 6xD.',
    icon: GraduationCapIcon,
    href: '/marketplace/courses'
  },
  {
    id: 'services-center',
    name: 'DQ Services Center',
    description: 'Business services, technology services, and digital worker tools.',
    icon: BuildingIcon,
    href: '/marketplace/non-financial'
  },
  {
    id: 'work-center',
    name: 'DQ Work Center',
    description: 'Daily sessions, project work, and execution trackers.',
    icon: CalendarIcon,
    href: '/marketplace/calendar'
  },
  {
    id: 'work-directory',
    name: 'DQ Work Directory',
    description: 'Units, positions, and associate profiles.',
    icon: UsersIcon,
    href: '/marketplace/community'
  },
  {
    id: 'media-center',
    name: 'DQ Media Center',
    description: 'View DQ updates, corporate news, blogs, job openings, and essential announcements.',
    icon: NewspaperIcon,
    href: '/marketplace/media'
  },
  {
    id: 'work-communities',
    name: 'DQ Work Communities',
    description: 'Discussion rooms, pulse updates, and events.',
    icon: SparklesIcon,
    href: '/marketplace/opportunities'
  }
];
interface ExploreDropdownProps {
  isCompact?: boolean;
}
export function ExploreDropdown({
  isCompact = false
}: ExploreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % marketplaces.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? marketplaces.length - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
          itemRefs.current[focusedIndex]?.click();
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };
  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);
  const handleItemClick = (href: string) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    // Handle navigation - for now just log
    console.log('Navigate to:', href);
  };
  return <div className="relative" ref={dropdownRef}>
    <button ref={buttonRef} className={`flex items-center text-white hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1 ${isCompact ? 'text-sm' : ''}`} onClick={() => setIsOpen(!isOpen)} onKeyDown={handleKeyDown} aria-expanded={isOpen} aria-haspopup="true" aria-label="Explore marketplaces menu">
      <span>Explore</span>
      <ChevronDownIcon size={isCompact ? 14 : 16} className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2" role="menu" aria-orientation="vertical" aria-labelledby="explore-menu">
      <div className="max-h-96 overflow-y-auto">
        {marketplaces.map((marketplace, index) => {
          const Icon = marketplace.icon;
          return <a key={marketplace.id} ref={el => itemRefs.current[index] = el} href={marketplace.href} className={`flex items-start px-4 py-3 text-left hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors duration-150 ${focusedIndex === index ? 'bg-red-50' : ''}`} role="menuitem" tabIndex={-1} onClick={e => {
            e.preventDefault();
            handleItemClick(marketplace.href);
          }} onMouseEnter={() => setFocusedIndex(index)} onFocus={() => setFocusedIndex(index)}>
            <div className="flex-shrink-0 mt-0.5">
              <Icon size={20} className="text-[#FF6B6B]" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {marketplace.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {marketplace.description}
              </p>
            </div>
          </a>;
        })}
      </div>
    </div>}
  </div>;
}