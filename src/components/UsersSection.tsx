import React, { useEffect, useState } from 'react';
import { TabsWithCompletion } from './TabVariations';
import { StickyActionButton } from './Button';
import { EnhancedTableSection } from './EnhancedTableSection';
import { UserIcon, MailIcon, CalendarIcon, ClockIcon, ShieldIcon } from 'lucide-react';

// Mock data - to be replaced with actual database calls
const userData: any[] = [];
const userColumns: any[] = [];
const usersTabs: any[] = [];

export const UsersSection: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState(userData);
  // Filter users based on active tab
  useEffect(() => {
    if (activeTabIndex === 0) {
      // All users
      setFilteredUsers(userData);
    } else if (activeTabIndex === 1) {
      // Only admins
      setFilteredUsers(userData.filter(user => user.role === 'Admin'));
    } else if (activeTabIndex === 2) {
      // Pending approvals (using inactive status as proxy)
      setFilteredUsers(userData.filter(user => user.status === 'Inactive'));
    }
  }, [activeTabIndex]);
  const handleAddUser = (newUser: Omit<(typeof userData)[0], 'id'>) => {
    // In a real app, you would make an API call here
    console.log('Adding new user:', newUser);
    alert('User added successfully!');
  };
  const handleEditUser = (id: string | number, updatedUser: (typeof userData)[0]) => {
    // In a real app, you would make an API call here
    console.log('Editing user:', id, updatedUser);
    alert('User updated successfully!');
  };
  const handleDeleteUser = (id: string | number) => {
    // In a real app, you would make an API call here
    console.log('Deleting user:', id);
    alert('User deleted successfully!');
  };
  const renderExpandedContent = (user: (typeof userData)[0]) => {
    // Additional user details to show when row is expanded
    return <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-lg mb-3 text-gray-800">
              User Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MailIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ShieldIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-lg mb-3 text-gray-800">
              Activity Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{user.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 mr-2" onClick={() => handleEditUser(user.id, user)}>
                  Edit User
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300" onClick={() => alert(`Sending password reset to ${user.email}`)}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  };
  return <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage platform users, roles, and permissions
        </p>
      </div>
      <div className="mb-8">
        <TabsWithCompletion sections={usersTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
        <div className="mt-6">
          <EnhancedTableSection title={`${usersTabs[activeTabIndex].title} (${filteredUsers.length})`} columns={userColumns.map(col => ({
          ...col,
          filterable: true
        }))} data={filteredUsers} rowsPerPage={10} onAdd={handleAddUser} onEdit={handleEditUser} onDelete={handleDeleteUser} renderExpandedContent={renderExpandedContent} />
        </div>
      </div>
      <StickyActionButton buttonText="Add New User" description="Create a new user account with custom permissions" onClick={() => alert('Opening user creation form...')} />
    </div>;
};