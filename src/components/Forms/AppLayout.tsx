import React, { useState } from 'react';
import { Header, AuthProvider } from '../Header';
import { Footer } from '../Footer';
import { AdminSidebar as Sidebar } from '../AppSidebar';
import { PageLayout, PageSection, SectionContent } from '../PageLayout';
import { ServiceRequestForm, FormSchema } from './ServiceRequestForm';
interface AppLayoutProps {
  schema: FormSchema;
  onSubmit?: (data: any) => Promise<void>;
  onSave?: (data: any) => Promise<void>;
  initialData?: any;
  'data-id'?: string;
}
export const AppLayout: React.FC<AppLayoutProps> = ({
  schema,
  onSubmit,
  onSave,
  initialData,
  'data-id': dataId
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('services');
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };
  return <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} data-id="app-header" />
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSection={activeSection} onSectionChange={handleSectionChange} onboardingComplete={true} companyName="Khalifa Fund" data-id="app-sidebar" />
          {/* Main Content - Removing unnecessary padding */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1">
              <ServiceRequestForm schema={schema} onSubmit={onSubmit} onSave={onSave} initialData={initialData} data-id={dataId} />
            </main>
            {/* Footer */}
            <Footer isLoggedIn={true} data-id="app-footer" />
          </div>
        </div>
      </div>
    </AuthProvider>;
};