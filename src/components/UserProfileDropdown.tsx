import React, { useState } from 'react';
import { UserIcon, SettingsIcon, HelpCircleIcon, LogOutIcon, BellIcon } from 'lucide-react';
type UserProfileDropdownProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
};
export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return <div className="relative">
      <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-200 transition-colors" onClick={toggleDropdown} aria-label="User profile">
        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>}
        <span className="hidden md:inline text-sm font-medium text-gray-700">
          {user.name}
        </span>
      </button>
      {isOpen && <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>}
              <div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="py-1">
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" onClick={() => {
          alert('Navigate to profile settings');
          setIsOpen(false);
        }}>
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>Your Profile</span>
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" onClick={() => {
          alert('Navigate to account settings');
          setIsOpen(false);
        }}>
              <SettingsIcon className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" onClick={() => {
          alert('Navigate to notifications settings');
          setIsOpen(false);
        }}>
              <BellIcon className="w-4 h-4 text-gray-500" />
              <span>Notification Preferences</span>
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" onClick={() => {
          alert('Navigate to help center');
          setIsOpen(false);
        }}>
              <HelpCircleIcon className="w-4 h-4 text-gray-500" />
              <span>Help & Support</span>
            </button>
          </div>
          <div className="py-1 border-t border-gray-200">
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2" onClick={() => {
          alert('Logging out...');
          setIsOpen(false);
        }}>
              <LogOutIcon className="w-4 h-4 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>
        </div>}
    </div>;
};