import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '../ui/Toast';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration: number;
  item_order: number;
  is_locked: boolean;
  content?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const LessonsSection: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadLessons();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data } = await supabase.from('lms_courses').select('id, title');
    if (data) setCourses(data);
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { data, error } = await supabase
        .from('lms_lessons')
        .select('*')
        .order('item_order', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error('Error loading lessons:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load lessons' });
    } finally {
      setLoading(false);
    }
  };

  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || 'Unknown Course';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { error } = await supabase
        .from('lms_lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setToast({ type: 'success', message: 'Lesson deleted successfully' });
      loadLessons();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      setToast({ type: 'error', message: error.message || 'Failed to delete lesson' });
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCourseTitle(lesson.course_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Lessons</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/course-management/lesson/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lesson
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search lessons..."
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? 'No lessons found matching your search' : 'No lessons yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{lesson.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getCourseTitle(lesson.course_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lesson.duration} min</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lesson.item_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      lesson.video_url ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lesson.video_url ? 'Video' : 'Content'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/course-management/lesson/${lesson.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
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



