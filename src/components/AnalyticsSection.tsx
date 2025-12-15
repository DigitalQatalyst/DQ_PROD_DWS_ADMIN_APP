import React, { useState } from 'react';
import { TabsWithCompletion } from './TabVariations';
import { TableSection } from './TableSection';
import { StickyActionButton } from './Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// Mock data - to be replaced with actual database calls
const analyticsTabs: any[] = [];
const analyticsData: any[] = [];
const analyticsColumns: any[] = [];
// Mock data for charts
const monthlyTrafficData = [{
  name: 'Jan',
  pageViews: 4000,
  visitors: 2400
}, {
  name: 'Feb',
  pageViews: 3000,
  visitors: 1398
}, {
  name: 'Mar',
  pageViews: 2000,
  visitors: 9800
}, {
  name: 'Apr',
  pageViews: 2780,
  visitors: 3908
}, {
  name: 'May',
  pageViews: 1890,
  visitors: 4800
}, {
  name: 'Jun',
  pageViews: 2390,
  visitors: 3800
}, {
  name: 'Jul',
  pageViews: 3490,
  visitors: 4300
}, {
  name: 'Aug',
  pageViews: 3490,
  visitors: 4300
}, {
  name: 'Sep',
  pageViews: 3490,
  visitors: 4300
}, {
  name: 'Oct',
  pageViews: 3490,
  visitors: 4300
}, {
  name: 'Nov',
  pageViews: 3490,
  visitors: 4300
}, {
  name: 'Dec',
  pageViews: 3490,
  visitors: 4300
}];
const deviceData = [{
  name: 'Desktop',
  value: 45
}, {
  name: 'Mobile',
  value: 40
}, {
  name: 'Tablet',
  value: 15
}];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const conversionData = [{
  name: 'Visits',
  value: 4000
}, {
  name: 'Sign-ups',
  value: 1200
}, {
  name: 'Purchases',
  value: 800
}];
const bounceRateData = [{
  name: 'Jan',
  rate: 40
}, {
  name: 'Feb',
  rate: 38
}, {
  name: 'Mar',
  rate: 45
}, {
  name: 'Apr',
  rate: 42
}, {
  name: 'May',
  rate: 35
}, {
  name: 'Jun',
  rate: 30
}];
export const AnalyticsSection: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // In a real app, you would fetch data for the selected time range
  };
  return <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Analytics & Reporting
        </h1>
        <p className="text-gray-600">
          View platform performance and user engagement metrics
        </p>
      </div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button onClick={() => handleTimeRangeChange('7d')} className={`px-4 py-2 text-sm font-medium ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-l-md`}>
            7 Days
          </button>
          <button onClick={() => handleTimeRangeChange('30d')} className={`px-4 py-2 text-sm font-medium ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300`}>
            30 Days
          </button>
          <button onClick={() => handleTimeRangeChange('90d')} className={`px-4 py-2 text-sm font-medium ${timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-r-md`}>
            90 Days
          </button>
        </div>
      </div>
      <div className="mb-8">
        <TabsWithCompletion sections={analyticsTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
        <div className="mt-6">
          {activeTabIndex === 0 && <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Traffic Overview
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrafficData} margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pageViews" stroke="#8884d8" activeDot={{
                      r: 8
                    }} name="Page Views" />
                        <Line type="monotone" dataKey="visitors" stroke="#82ca9d" name="Unique Visitors" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    User Demographics
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label={({
                      name,
                      percent
                    }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                          {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <TableSection title="Key Metrics" columns={analyticsColumns} data={analyticsData} rowsPerPage={10} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} />
            </div>}
          {activeTabIndex === 1 && <div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Engagement Metrics
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrafficData} margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visitors" name="Unique Visitors" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Bounce Rate
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bounceRateData} margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0
                }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" name="Bounce Rate %" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <TableSection title="User Engagement" columns={analyticsColumns} data={analyticsData.filter(item => ['Unique Visitors', 'Avg. Session Duration', 'Bounce Rate'].includes(item.metric))} rowsPerPage={10} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} />
            </div>}
          {activeTabIndex === 2 && <div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Conversion Funnel
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="vertical" margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <TableSection title="Conversion Metrics" columns={analyticsColumns} data={analyticsData.filter(item => ['Page Views', 'Conversion Rate'].includes(item.metric))} rowsPerPage={10} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} />
            </div>}
        </div>
      </div>
      <StickyActionButton buttonText="Generate Report" description="Create a detailed analytics report" onClick={() => alert('Generating analytics report...')} />
    </div>;
};