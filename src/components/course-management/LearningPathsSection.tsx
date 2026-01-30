import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '../ui/Toast';

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  provider: string;
  description: string;
  excerpt: string;
  category: string;
  duration: number;
  level_code: string;
  department: string;
  audience: string;
  status: string;
  highlights: string[];
  outcomes: string[];
  rating: number;
  review_count: number;
  image_url: string;
  faq: any;
  created_at?: string;
  updated_at?: string;
}

export const LearningPathsSection: React.FC = () => {
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { data, error } = await supabase
        .from('lms_learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLearningPaths(data || []);
    } catch (error: any) {
      console.error('Error loading learning paths:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load learning paths' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning path?')) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { error } = await supabase
        .from('lms_learning_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setToast({ type: 'success', message: 'Learning path deleted successfully' });
      loadLearningPaths();
    } catch (error: any) {
      console.error('Error deleting learning path:', error);
      setToast({ type: 'error', message: error.message || 'Failed to delete learning path' });
    }
  };

  const filteredPaths = learningPaths.filter(path =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    path.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2E6E] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Learning Paths</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPaths.length} learning path{filteredPaths.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/course-management/learning-path/new')}
            className="px-4 py-2 bg-[#1A2E6E] hover:bg-[#030F35] text-white rounded-md flex items-center text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Learning Path
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#1A2E6E] focus:border-[#1A2E6E] sm:text-sm"
            placeholder="Search learning paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Rating</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPaths.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'No learning paths found matching your search' : 'No learning paths yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredPaths.map((path) => (
                <tr key={path.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {path.image_url && (
                        <img
                          src={path.image_url}
                          alt={path.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{path.title}</div>
                        <div className="text-xs text-gray-500">{path.provider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{path.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{path.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${path.status === 'published' ? 'bg-green-100 text-green-800' :
                      path.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {path.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {path.rating > 0 ? `${path.rating.toFixed(1)} ⭐ (${path.review_count})` : 'No ratings'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/course-management/learning-path/${path.id}`)}
                        className="text-[#1A2E6E] hover:text-[#030F35]"
                        title="Edit"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(path.id)}
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



