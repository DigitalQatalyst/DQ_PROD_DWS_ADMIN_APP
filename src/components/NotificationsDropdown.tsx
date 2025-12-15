import React, { useState } from 'react';
import { BellIcon, CheckIcon } from 'lucide-react';
type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
};
const mockNotifications: Notification[] = [{
  id: '1',
  title: 'New User Registration',
  message: 'Sarah Johnson has registered as a new editor',
  time: '10 minutes ago',
  read: false,
  type: 'info'
}, {
  id: '2',
  title: 'System Update Scheduled',
  message: 'System maintenance planned for tonight at 2 AM EST',
  time: '1 hour ago',
  read: false,
  type: 'warning'
}, {
  id: '3',
  title: 'Content Approval Required',
  message: "New draft 'Summer Campaign' needs your approval",
  time: '3 hours ago',
  read: true,
  type: 'info'
}, {
  id: '4',
  title: 'API Limit Reached',
  message: 'Monthly API request limit has been reached',
  time: 'Yesterday',
  read: true,
  type: 'error'
}, {
  id: '5',
  title: 'Backup Completed',
  message: 'Weekly system backup completed successfully',
  time: '2 days ago',
  read: true,
  type: 'success'
}];
export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
  };
  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  return <div className="relative">
      <button className="p-2 rounded-full hover:bg-gray-200 transition-colors relative" onClick={toggleDropdown} aria-label="Notifications">
        <BellIcon className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
            {unreadCount}
          </span>}
      </button>
      {isOpen && <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && <button className="text-sm text-blue-600 hover:text-blue-800" onClick={markAllAsRead}>
                Mark all as read
              </button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? <div className="p-4 text-center text-gray-500">
                No notifications
              </div> : <div>
                {notifications.map(notification => <div key={notification.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`w-2 h-2 rounded-full mr-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                          <h4 className="font-medium text-gray-800">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeStyles(notification.type)}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      {!notification.read && <button className="ml-2 p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50" onClick={() => markAsRead(notification.id)} title="Mark as read">
                          <CheckIcon className="w-4 h-4" />
                        </button>}
                    </div>
                  </div>)}
              </div>}
          </div>
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <button className="w-full py-2 text-sm text-center text-blue-600 hover:text-blue-800 transition-colors" onClick={() => setIsOpen(false)}>
              View all notifications
            </button>
          </div>
        </div>}
    </div>;
};