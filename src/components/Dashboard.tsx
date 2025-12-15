import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowRightIcon, BarChartIcon, UsersIcon, BuildingIcon } from 'lucide-react';
import { PageLayout, PageSection, SectionHeader, SectionContent } from './PageLayout';
export const Dashboard: React.FC = () => {
  // Summary data for KPI cards
  const summaryData = [{
    id: 'listings',
    title: 'Total Listings',
    count: 247,
    change: '+12% from last month',
    icon: BarChartIcon,
    color: 'border-blue-500'
  }, {
    id: 'approval',
    title: 'Approval Rate',
    count: '82%',
    change: '+3% from last month',
    icon: CheckCircleIcon,
    color: 'border-green-500'
  }, {
    id: 'partners',
    title: 'Active Partners',
    count: 36,
    change: '+4 new this month',
    icon: BuildingIcon,
    color: 'border-purple-500'
  }];
  // Recent activity data
  const recentActivity = [{
    id: '1',
    type: 'approved',
    message: 'Jessica Lee approved "Professional Photography Services"',
    time: 'Today at 10:45 AM',
    icon: CheckCircleIcon,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  }, {
    id: '2',
    type: 'commented',
    message: 'Michael Brown commented on "Tech Startup Conference 2023"',
    time: 'Yesterday at 2:20 PM',
    icon: ArrowRightIcon,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  }, {
    id: '3',
    type: 'rejected',
    message: 'John Smith rejected "Comprehensive Business Plan Template"',
    time: 'Yesterday at 11:30 AM',
    icon: XCircleIcon,
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  }, {
    id: '4',
    type: 'sent-back',
    message: 'Sarah Johnson sent back "Wellness Retreat Weekend" for revisions',
    time: 'June 10, 2023',
    icon: ClockIcon,
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  }];
  // Quick links
  const quickLinks = [{
    id: '1',
    title: 'View Pending Approvals',
    url: '#'
  }, {
    id: '2',
    title: 'Manage Partner Accounts',
    url: '#'
  }, {
    id: '3',
    title: 'Generate Reports',
    url: '#'
  }, {
    id: '4',
    title: 'System Settings',
    url: '#'
  }];
  return <PageLayout title="Dashboard">
      <SectionContent className="px-0 pt-3 pb-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summaryData.map(item => <div key={item.id} className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${item.color} hover:shadow-lg transition-all duration-200`}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800">{item.count}</p>
              <p className="text-sm text-gray-500 mt-2">{item.change}</p>
            </div>)}
        </div>
        {/* Recent Activity Section */}
        <PageSection className="mb-6">
          <SectionHeader title="Recent Activity" />
          <SectionContent>
            <div className="space-y-3">
              {recentActivity.map(activity => <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`flex-shrink-0 ${activity.iconBgColor} rounded-full p-2 mr-3`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>)}
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                View All Activity
              </button>
            </div>
          </SectionContent>
        </PageSection>
        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map(link => <li key={link.id}>
                <a href={link.url} className="text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  {link.title}
                </a>
              </li>)}
          </ul>
        </div>
      </SectionContent>
    </PageLayout>;
};