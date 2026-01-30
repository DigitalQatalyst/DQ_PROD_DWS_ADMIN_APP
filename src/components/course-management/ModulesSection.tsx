import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '../ui/Toast';

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration: number;
  item_order: number;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

export const ModulesSection: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadModules();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase.from('lms_courses').select('id, title');
    if (data) setCourses(data);
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { data, error } = await supabase
        .from('lms_modules')
        .select('*')
        .order('item_order', { ascending: true });

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load modules' });
    } finally {
      setLoading(false);
    }
  };

  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || 'Unknown Course';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { error } = await supabase
        .from('lms_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setToast({ type: 'success', message: 'Module deleted successfully' });
      loadModules();
    } catch (error: any) {
      console.error('Error deleting module:', error);
      setToast({ type: 'error', message: error.message || 'Failed to delete module' });
    }
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCourseTitle(module.course_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2E6E] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/course-management/module/new')}
            className="px-4 py-2 bg-[#1A2E6E] hover:bg-[#030F35] text-white rounded-md flex items-center text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Module
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#1A2E6E] focus:border-[#1A2E6E] sm:text-sm"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Course</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredModules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'No modules found matching your search' : 'No modules yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredModules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{module.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getCourseTitle(module.course_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{module.duration} min</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{module.item_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${module.is_locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {module.is_locked ? 'Locked' : 'Unlocked'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/course-management/module/${module.id}`)}
                        className="text-[#1A2E6E] hover:text-[#030F35]"
                        title="Edit"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};



