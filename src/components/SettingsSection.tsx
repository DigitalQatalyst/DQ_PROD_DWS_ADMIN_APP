import React, { useState } from 'react';
import { TabsWithCompletion } from './TabVariations';
import { TableSection } from './TableSection';
import { StickyActionButton } from './Button';

// Mock data - to be replaced with actual database calls
const settingsTabs: any[] = [];
const settingsData: any[] = [];
const settingsColumns: any[] = [];

export const SettingsSection: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const handleUpdateSetting = (id: string | number, updatedSetting: (typeof settingsData)[0]) => {
    // In a real app, you would make an API call here
    console.log('Updating setting:', id, updatedSetting);
    alert('Setting updated successfully!');
  };
  return <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          System Settings
        </h1>
        <p className="text-gray-600">
          Configure platform settings and preferences
        </p>
      </div>
      <div className="mb-8">
        <TabsWithCompletion sections={settingsTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
        <div className="mt-6">
          {activeTabIndex === 0 && <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md" defaultValue="Admin Processing Center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <input type="email" className="w-full p-2 border border-gray-300 rounded-md" defaultValue="support@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Language
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="utc">UTC</option>
                    <option value="est">Eastern Standard Time</option>
                    <option value="pst">Pacific Standard Time</option>
                    <option value="gmt">Greenwich Mean Time</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="maintenanceMode" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                    Enable Maintenance Mode
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>}
          {activeTabIndex === 1 && <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600">
                      Require 2FA for all admin users
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Session Timeout
                    </h4>
                    <p className="text-sm text-gray-600">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Password Policy
                    </h4>
                    <p className="text-sm text-gray-600">
                      Set minimum requirements for passwords
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                    Configure
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>}
          {activeTabIndex === 2 && <TableSection title="Integration Settings" columns={settingsColumns} data={settingsData.filter(item => ['API Access', 'Data Retention'].includes(item.setting))} rowsPerPage={10} onAdd={() => {}} onEdit={handleUpdateSetting} onDelete={() => {}} />}
          {activeTabIndex === 3 && <TableSection title="Notification Settings" columns={settingsColumns} data={settingsData.filter(item => ['Email Notifications', 'User Registration'].includes(item.setting))} rowsPerPage={10} onAdd={() => {}} onEdit={handleUpdateSetting} onDelete={() => {}} />}
        </div>
      </div>
      <StickyActionButton buttonText="Apply All Settings" description="Save and apply all configuration changes" onClick={() => alert('Applying settings...')} />
    </div>;
};