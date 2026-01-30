import React from 'react';
import { CheckCircleIcon, ArrowRightIcon, FileText, BookOpen, Briefcase, Users, Activity } from 'lucide-react';
import { PageLayout, PageSection, SectionHeader, SectionContent } from './PageLayout';

export const Dashboard: React.FC = () => {
  // Summary data for KPI cards relative to DQ DWS Platform
  const summaryData = [{
    id: 'media',
    title: 'Media Content',
    count: 124,
    change: '+8 this week',
    icon: FileText,
    color: 'border-[#1A2E6E]'
  }, {
    id: 'guides',
    title: 'Knowledge Guides',
    count: 42,
    change: '+3 new categories',
    icon: BookOpen,
    color: 'border-[#FB5535]'
  }, {
    id: 'requests',
    title: 'Service Requests',
    count: 18,
    change: '5 pending approval',
    icon: Briefcase,
    color: 'border-[#030F35]'
  }];

  // Recent activity data relevant to platform
  const recentActivity = [{
    id: '1',
    type: 'content',
    message: 'New Article: "2024 Digital Strategy" submitted for review',
    time: '2 hours ago',
    icon: FileText,
    iconBgColor: 'bg-slate-50',
    iconColor: 'text-[#1A2E6E]'
  }, {
    id: '2',
    type: 'guide',
    message: 'Sarah updated "HR Policy Guide" in Knowledge Hub',
    time: '4 hours ago',
    icon: BookOpen,
    iconBgColor: 'bg-orange-50',
    iconColor: 'text-[#FB5535]'
  }, {
    id: '3',
    type: 'request',
    message: 'Tech support request #842 was marked as resolved',
    time: 'Yesterday',
    icon: CheckCircleIcon,
    iconBgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  }, {
    id: '4',
    type: 'user',
    message: 'John Doe joined the Content Management team',
    time: 'Yesterday',
    icon: Users,
    iconBgColor: 'bg-slate-50',
    iconColor: 'text-slate-600'
  }];

  // Quick links to actual management pages
  const quickLinks = [{
    id: '1',
    title: 'Media Center',
    url: '/media-management'
  }, {
    id: '2',
    title: 'Knowledge Hub',
    url: '/knowledgehub-management'
  }, {
    id: '3',
    title: 'Service Management',
    url: '/service-management'
  }, {
    id: '4',
    title: 'System Analytics',
    url: '/ejp-transaction-dashboard'
  }];

  return <PageLayout title="Platform Overview">
    <SectionContent className="px-0 pt-3 pb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summaryData.map(item => <div key={item.id} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${item.color} hover:shadow-md transition-all duration-200`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {item.title}
            </h3>
            <item.icon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-slate-900">{item.count}</p>
            <span className="text-xs font-medium text-slate-400">{item.change}</span>
          </div>
        </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2">
          <PageSection className="mb-6">
            <SectionHeader title="System Activity" />
            <SectionContent>
              <div className="space-y-4">
                {recentActivity.map(activity => <div key={activity.id} className="flex items-start p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className={`flex-shrink-0 ${activity.iconBgColor} rounded-lg p-2.5 mr-4`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>)}
              </div>
              <div className="mt-6 text-center">
                <button className="inline-flex items-center text-sm font-semibold text-[#1A2E6E] hover:text-[#030F35] transition-colors">
                  View full log
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
            </SectionContent>
          </PageSection>
        </div>

        {/* Quick Access Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#FB5535]" />
              Quick Actions
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(link => <li key={link.id}>
                <a href={link.url} className="w-full flex items-center justify-between p-3 rounded-lg text-slate-600 hover:bg-[#1A2E6E] hover:text-white transition-all group">
                  <span className="text-sm font-medium">{link.title}</span>
                  <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>)}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#1A2E6E] to-[#030F35] rounded-xl shadow-md p-6 text-white">
            <h4 className="font-bold mb-2">Platform Setup</h4>
            <p className="text-sm text-slate-100 mb-4">Complete your enterprise settings to unblock all features.</p>
            <button className="w-full py-2 bg-[#FB5535] hover:bg-[#e04a2d] text-white rounded-lg text-sm font-bold transition-colors">
              Setup Wizard
            </button>
          </div>
        </div>
      </div>
    </SectionContent>
  </PageLayout>;
};