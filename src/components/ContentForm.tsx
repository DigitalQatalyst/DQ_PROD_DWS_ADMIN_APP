import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
// Types for content
type ContentType = 'article' | 'guide' | 'faq' | 'announcement' | 'policy';
type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';
type ContentFormProps = {
  contentId?: string; // Optional for editing existing content
};
export const ContentForm: React.FC<ContentFormProps> = ({
  contentId
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const routeContentId = contentId || (params as any)?.contentId;
  const { create, update: updateContent, loading: crudLoading, error: crudError } = useCRUD<any>('cnt_contents');
  const { user, userSegment } = useAuth();

  const getServiceRoleClient = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;
    return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  };
  // TODO: Replace with actual content data from database
  const mockContent = null;
  // Form state
  const [formData, setFormData] = useState({
    title: mockContent?.title || '',
    type: mockContent?.type || 'article',
    status: mockContent?.status || 'draft',
    summary: mockContent?.summary || '',
    content: mockContent?.content || '',
    author: mockContent?.author || '',
    department: mockContent?.department || '',
    tags: mockContent?.tags?.join(', ') || '',
    publishDate: mockContent?.publishDate || '',
    featuredImage: mockContent?.featuredImage || '',
    attachments: mockContent?.attachments?.map(a => a.name).join(', ') || ''
  });

  // Prefill when editing
  useEffect(() => {
    const prefillFromState = (stateContent: any) => {
      if (!stateContent) return false;
      setFormData({
        title: stateContent.title || '',
        type: stateContent.type || 'article',
        status: (stateContent.status || 'draft').toLowerCase(),
        summary: stateContent.summary || '',
        content: stateContent.content || '',
        author: stateContent.author || '',
        department: stateContent.department || '',
        tags: Array.isArray(stateContent.tags) ? stateContent.tags.join(', ') : (stateContent.tags || ''),
        publishDate: stateContent.published_at ? new Date(stateContent.published_at).toISOString().slice(0,10) : '',
        featuredImage: stateContent.featuredImage || '',
        attachments: ''
      });
      return true;
    };

    // Try prefill from navigation state first
    const stateContent = (location.state as any)?.content;
    if (prefillFromState(stateContent)) return;

    // Then fetch from DB if we have an ID
    const loadById = async () => {
      if (!routeContentId) return;
      const supabase = getServiceRoleClient();
      if (!supabase) return;
      const { data, error } = await supabase
        .from('cnt_contents')
        .select('*')
        .eq('id', routeContentId)
        .maybeSingle();
      if (error || !data) return;
      prefillFromState({
        title: data.title,
        type: data.content_type?.toLowerCase() || 'article',
        status: data.status?.toLowerCase() || 'draft',
        summary: data.summary || '',
        content: data.content || '',
        author: data.author_name || '',
        department: '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        published_at: data.published_at
      });
    };

    loadById();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeContentId]);
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Map form data to database schema
      const dbData: any = {
        title: formData.title,
        content_type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1), // Capitalize first letter
        status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1), // Capitalize first letter
        summary: formData.summary || null,
        content: formData.content || null,
        author_name: formData.author || null,
        description: formData.summary || null, // Use summary as description if needed
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        featured_image_url: formData.featuredImage || null,
        thumbnail_url: formData.featuredImage || null, // Use featured image as thumbnail if provided
      };

      // Add published_at if status is published and publishDate is set
      if (formData.status === 'published' && formData.publishDate) {
        dbData.published_at = new Date(formData.publishDate).toISOString();
      } else if (formData.status === 'published' && !formData.publishDate) {
        // If publishing but no date set, use current date
        dbData.published_at = new Date().toISOString();
      }

      // Add organization_id and created_by will be set by useCRUD hook

      let result;
      if (routeContentId) {
        // Update existing content
        result = await updateContent(routeContentId, dbData);
        if (result) {
          alert('Content updated successfully!');
        } else {
          alert(`Failed to update content: ${crudError?.message || 'Unknown error'}`);
          return;
        }
      } else {
        // Create new content
        result = await create(dbData);
        if (result) {
          alert('Content created successfully!');
        } else {
          alert(`Failed to create content: ${crudError?.message || 'Unknown error'}`);
          return;
        }
      }

      // Navigate back to content management
      navigate('/content-management');
    } catch (error) {
      console.error('Error saving content:', error);
      alert(`Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  return <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {routeContentId ? 'Edit Content' : 'Create New Content'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {routeContentId ? 'Update existing content' : 'Create new content for the platform'}
          </p>
          {crudError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{crudError.message}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Essential details about the content.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Content Type *
                </label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="article">Article</option>
                  <option value="guide">Guide</option>
                  <option value="faq">FAQ</option>
                  <option value="announcement">Announcement</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                  Summary *
                </label>
                <textarea id="summary" name="summary" rows={2} value={formData.summary} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <textarea id="content" name="content" rows={12} value={formData.content} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p className="mt-2 text-sm text-gray-500">
                  Use plain text format. For a new paragraph, add an empty line.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Additional Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                More information about the content.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. business, license, registration" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                  Featured Image URL
                </label>
                <input type="url" id="featuredImage" name="featuredImage" value={formData.featuredImage} onChange={handleChange} placeholder="https://example.com/images/image.jpg" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                  Attachments (comma-separated names)
                </label>
                <input type="text" id="attachments" name="attachments" value={formData.attachments} onChange={handleChange} placeholder="e.g. Registration Form, Guidelines Document" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p className="mt-2 text-sm text-gray-500">
                  In a real application, this would be a file upload field.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/content-management')} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={crudLoading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {crudLoading ? 'Saving...' : (routeContentId ? 'Update Content' : 'Create Content')}
            </button>
          </div>
        </form>
      </div>
    </div>;
};