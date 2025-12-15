import React, { useState } from 'react';
import { PlusIcon, XIcon, UserPlusIcon, FileTextIcon, BarChartIcon, ClipboardListIcon } from 'lucide-react';
type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};
export const QuickActionsMenu: React.FC = () => {
  // Quick Actions Menu is disabled
  return null;
  // Keeping the original code commented out for reference
  /*
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  const quickActions: QuickAction[] = [
    {
      id: 'add-user',
      label: 'Add User',
      icon: <UserPlusIcon className="w-5 h-5" />,
      onClick: () => {
        alert('Opening add user form')
        setIsOpen(false)
      },
    },
    {
      id: 'create-content',
      label: 'Create Content',
      icon: <FileTextIcon className="w-5 h-5" />,
      onClick: () => {
        alert('Opening create content form')
        setIsOpen(false)
      },
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: <BarChartIcon className="w-5 h-5" />,
      onClick: () => {
        alert('Opening report generator')
        setIsOpen(false)
      },
    },
    {
      id: 'view-tasks',
      label: 'View Tasks',
      icon: <ClipboardListIcon className="w-5 h-5" />,
      onClick: () => {
        alert('Opening task list')
        setIsOpen(false)
      },
    },
  ]
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg overflow-hidden mb-2 w-48">
          <div className="p-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={action.onClick}
              >
                <span className="mr-2 text-gray-500">{action.icon}</span>
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className={`p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-colors ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        {isOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <PlusIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  )
  */
};