import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
export interface SimpleSection {
  id: string;
  title: string;
}
interface TabsSimpleProps {
  sections: SimpleSection[];
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
  'data-id'?: string;
}
export function TabsSimple({
  sections,
  activeTabIndex = 0,
  onTabChange,
  'data-id': dataId
}: TabsSimpleProps) {
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTabIndex);
  const [showTabsMenu, setShowTabsMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleTabClick = (index: number) => {
    setCurrentActiveTab(index);
    onTabChange?.(index);
  };
  const checkOverflow = () => {
    if (tabsRef.current && containerRef.current) {
      const tabsWidth = tabsRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShowNavigation(tabsWidth > containerWidth);
    }
  };
  useEffect(() => {
    checkOverflow();
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [sections]);
  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };
  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };
  return <div ref={containerRef} className="flex items-center w-full bg-gray-50 border-b border-gray-200" data-id={dataId}>
      {showNavigation && <button className="px-2 py-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors" onClick={scrollLeft} aria-label="Scroll tabs left">
          <ChevronLeft size={16} />
        </button>}
      <div ref={tabsRef} className="flex overflow-x-auto scrollbar-hide flex-1" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
        {sections.map((section, index) => <button key={section.id} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${currentActiveTab === index ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} onClick={() => handleTabClick(index)} role="tab" aria-selected={currentActiveTab === index} aria-controls={`tabpanel-${section.id}`}>
            {section.title}
          </button>)}
      </div>
      {showNavigation && <>
          <button className="px-2 py-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors" onClick={scrollRight} aria-label="Scroll tabs right">
            <ChevronRight size={16} />
          </button>
          <div className="relative">
            <button className="px-2 py-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors" onClick={() => setShowTabsMenu(!showTabsMenu)} aria-label="Show all tabs menu" aria-expanded={showTabsMenu}>
              <MoreHorizontal size={16} />
            </button>
            {showTabsMenu && <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTabsMenu(false)} aria-hidden="true" />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {sections.map((section, index) => <button key={section.id} className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentActiveTab === index ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => {
                handleTabClick(index);
                setShowTabsMenu(false);
              }} role="menuitem">
                        {section.title}
                      </button>)}
                  </div>
                </div>
              </>}
          </div>
        </>}
    </div>;
}