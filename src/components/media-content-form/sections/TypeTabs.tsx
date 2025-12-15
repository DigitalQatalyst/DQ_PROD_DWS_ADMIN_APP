import { FileText as FileTextIcon, Folder as FolderIcon, Mic as MicIcon, Video as VideoIcon } from 'lucide-react';
import type React from 'react';

import type { TabKey } from '../types';

type TabConfig = {
  key: TabKey;
  label: string;
  description: string;
};

interface TypeTabsProps {
  tabs: TabConfig[];
  activeTab: TabKey;
  onTabSelect: (key: TabKey) => void;
}

const tabIcons: Record<TabKey, React.ReactNode> = {
  Article: <FileTextIcon className="w-4 h-4" />,
  News: <FileTextIcon className="w-4 h-4" />,
  Guide: <FileTextIcon className="w-4 h-4" />,
  Video: <VideoIcon className="w-4 h-4" />,
  Podcast: <MicIcon className="w-4 h-4" />,
  Report: <FolderIcon className="w-4 h-4" />,
  Toolkit: <FolderIcon className="w-4 h-4" />,
};

export const TypeTabs: React.FC<TypeTabsProps> = ({ tabs, activeTab, onTabSelect }) => (
  <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-6">
    <div className="flex flex-wrap gap-2 p-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabSelect(tab.key)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors ${
            activeTab === tab.key
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          aria-pressed={activeTab === tab.key}
        >
          {tabIcons[tab.key]}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default TypeTabs;

