import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AdminSidebar } from './AppSidebar';
import { SearchBar } from './SearchBar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { QuickActionsMenu } from './QuickActionsMenu';
import { useAuth } from '../context/AuthContext';

// Mock data - to be replaced with actual database calls
const companies: any[] = [];
type AppLayoutProps = {
  children: React.ReactNode;
  activeSection: string;
};
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeSection
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    // Handle taxonomy manager sections with scope filtering
    if (sectionId === 'content-taxonomy') {
      navigate('/taxonomy-manager?scope=Content');
    } else if (sectionId === 'marketplace-taxonomy') {
      navigate('/taxonomy-manager?scope=Marketplace');
    } else {
      // Get the menu item path from AdminSidebar
      // For now, handle known routes directly
      const routeMap: Record<string, string> = {
        'course-management': '/course-management',
        'content-management': '/content-management',
        'service-management': '/service-management',
      };

      if (routeMap[sectionId]) {
        navigate(routeMap[sectionId]);
      } else {
        console.log('Navigate to:', sectionId);
      }
    }
  };

  const { user } = useAuth();
  return <div className="flex flex-col min-h-screen bg-gray-100">
    <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
      <div className="flex items-center space-x-4">
        <SearchBar />
        <NotificationsDropdown />
        <UserProfileDropdown user={user} />
      </div>
    </Header>
    <div className="flex flex-1">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSection={activeSection} onSectionChange={handleSectionChange} onboardingComplete={true} companies={companies} onCompanyChange={id => console.log('Company changed:', id)} onAddNewEnterprise={() => console.log('Add new enterprise')} isLoggedIn={true} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
    <Footer isLoggedIn={true} />
    <QuickActionsMenu />
  </div>;
};