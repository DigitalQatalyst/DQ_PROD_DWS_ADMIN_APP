import React, { useEffect, useState } from 'react';
import { TabsWithCompletion } from './TabVariations';
import { TableSection } from './TableSection';
import { StickyActionButton } from './Button';
import { useNavigate } from 'react-router-dom';

// Mock data - to be replaced with actual database calls
const contentTabs: any[] = [];
const contentData: any[] = [];
const contentColumns: any[] = [];

export const ContentSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [filteredContent, setFilteredContent] = useState(contentData);
  // Filter content based on active tab
  useEffect(() => {
    if (activeTabIndex === 0) {
      // All content
      setFilteredContent(contentData);
    } else if (activeTabIndex === 1) {
      // Published content
      setFilteredContent(contentData.filter(item => item.status === 'Published'));
    } else if (activeTabIndex === 2) {
      // Draft content
      setFilteredContent(contentData.filter(item => item.status === 'Draft'));
    } else if (activeTabIndex === 3) {
      // Archived content (none in our mock data, so showing empty)
      setFilteredContent([]);
    }
  }, [activeTabIndex]);
  const handleAddContent = (newContent: Omit<(typeof contentData)[0], 'id'>) => {
    // In a real app, you would make an API call here
    console.log('Adding new content:', newContent);
    alert('Content added successfully!');
  };
  const handleEditContent = (id: string | number, updatedContent: (typeof contentData)[0]) => {
    // In a real app, you would make an API call here
    console.log('Editing content:', id, updatedContent);
    navigate(`/content-form/${id}`);
  };
  const handleDeleteContent = (id: string | number) => {
    // In a real app, you would make an API call here
    console.log('Deleting content:', id);
    alert('Content deleted successfully!');
  };
  return <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Content Management
        </h1>
        <p className="text-gray-600">
          Manage platform content, pages, and media
        </p>
      </div>
      <div className="mb-6">
        <TabsWithCompletion sections={contentTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
        <div className="mt-4">
          <TableSection title={`${contentTabs[activeTabIndex].title} (${filteredContent.length})`} columns={contentColumns} data={filteredContent} rowsPerPage={10} onAdd={handleAddContent} onEdit={handleEditContent} onDelete={handleDeleteContent} />
        </div>
      </div>
      <StickyActionButton buttonText="Create New Content" description="Add a new page, post, or media item" onClick={() => navigate('/content-form')} />
    </div>;
};