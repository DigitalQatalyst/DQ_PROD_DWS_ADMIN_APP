import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { uploadLMSFileSupabase } from '../../lib/lmsStorageProviderSupabase';
import { Toast } from '../ui/Toast';
import MarkdownEditor from '../MarkdownEditor';

export const LessonForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState({
    course_id: '',
    module_id: '',
    title: '',
    description: '',
    duration: 0,
    item_order: 1,
    is_locked: false,
    content: '',
    video_url: '',
    lesson_type: 'text' as 'text' | 'video' | 'quiz',
    quiz_id: '',
    is_final_assessment: false,
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [contentType, setContentType] = useState<'text' | 'video' | 'quiz'>('text');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadCourses();
    if (isEditing && id) {
      loadLesson(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Load modules and quizzes when course is selected
    if (formData.course_id) {
      loadModules(formData.course_id);
      loadQuizzes(formData.course_id);
    } else {
      setModules([]);
      setQuizzes([]);
      setSelectedModule(null);
    }
  }, [formData.course_id]);

  useEffect(() => {
    // Set content type based on video_url or quiz_id
    if (formData.lesson_type === 'quiz') {
      setContentType('quiz');
    } else if (formData.video_url) {
      setContentType('video');
    } else {
      setContentType('text');
    }
  }, [formData.video_url, formData.lesson_type, formData.quiz_id]);

  const loadCourses = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase.from('lms_courses').select('id, title, slug').order('title');
    if (data) {
      setCourses(data);
      // Set selected course if editing
      if (isEditing && formData.course_id) {
        const course = data.find(c => c.id === formData.course_id);
        if (course) setSelectedCourse(course);
      }
    }
  };

  const loadModules = async (courseId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase
      .from('lms_modules')
      .select('id, title, item_order')
      .eq('course_id', courseId)
      .order('item_order');

    if (data) {
      setModules(data);
      // Set selected module if editing
      if (isEditing && formData.module_id) {
        const module = data.find(m => m.id === formData.module_id);
        if (module) setSelectedModule(module);
      }
    }
  };

  const loadQuizzes = async (courseId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase
      .from('lms_quizzes')
      .select('id, title')
      .eq('course_id', courseId)
      .order('title');

    if (data) setQuizzes(data);
  };

  const loadLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      // Select all columns, but handle module_id gracefully if it doesn't exist
      const { data, error } = await supabase
        .from('lms_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      if (data) {
        // Handle module_id gracefully - it might not exist in schema yet
        const moduleId = (data as any).module_id || '';
        setFormData({
          ...data,
          module_id: moduleId,
        });
        // Load course info for slug
        if (data.course_id) {
          const { data: courseData } = await supabase
            .from('lms_courses')
            .select('id, title, slug')
            .eq('id', data.course_id)
            .single();
          if (courseData) setSelectedCourse(courseData);

          // Load modules and quizzes for the course
          await loadModules(data.course_id);
          await loadQuizzes(data.course_id);

          // Set selected module if module_id exists
          if (data.module_id) {
            const { data: moduleData } = await supabase
              .from('lms_modules')
              .select('id, title, item_order')
              .eq('id', data.module_id)
              .single();
            if (moduleData) setSelectedModule(moduleData);
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading lesson:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load lesson' });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.course_id || !selectedCourse) {
      setToast({ type: 'error', message: 'Please select a course first' });
      return;
    }

    if (!formData.title) {
      setToast({ type: 'error', message: 'Please enter a lesson title first' });
      return;
    }

    try {
      setUploadingVideo(true);
      setUploadProgress(0);

      const result = await uploadLMSFileSupabase({
        file,
        courseSlug: selectedCourse.slug,
        moduleOrder: selectedModule?.item_order,
        moduleTitle: selectedModule?.title,
        lessonOrder: formData.item_order || 1,
        lessonTitle: formData.title,
        itemType: 'video',
        itemId: id,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      setFormData({ ...formData, video_url: result.publicUrl });
      setContentType('video');
      setUploadProgress(100);
      setToast({ type: 'success', message: `Video uploaded successfully (${(result.fileSize / 1024 / 1024).toFixed(2)}MB)` });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      setToast({ type: 'error', message: error.message || 'Failed to upload video' });
      setUploadProgress(0);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      // Clear content or video_url based on selected type
      const dataToSave: any = {
        ...formData,
        lesson_type: contentType,
        content: contentType === 'text' ? formData.content : '',
        video_url: contentType === 'video' ? formData.video_url : '',
        quiz_id: contentType === 'quiz' ? formData.quiz_id : null,
      };

      // Include module_id if it has a value
      if (formData.module_id) {
        dataToSave.module_id = formData.module_id;
      } else {
        dataToSave.module_id = null;
      }

      if (isEditing && id) {
        const { error } = await supabase
          .from('lms_lessons')
          .update(dataToSave)
          .eq('id', id);

        // If error is about missing column, retry without module_id
        if (error && error.message?.includes('module_id')) {
          console.warn('module_id column not found, retrying without it');
          const { module_id, ...dataWithoutModuleId } = dataToSave;
          const { error: retryError } = await supabase
            .from('lms_lessons')
            .update(dataWithoutModuleId)
            .eq('id', id);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('lms_lessons')
          .insert([dataToSave]);

        // If error is about missing column, retry without module_id
        if (error && error.message?.includes('module_id')) {
          console.warn('module_id column not found, retrying without it');
          const { module_id, ...dataWithoutModuleId } = dataToSave;
          const { error: retryError } = await supabase
            .from('lms_lessons')
            .insert([dataWithoutModuleId]);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      }

      setToast({ type: 'success', message: `Lesson ${isEditing ? 'updated' : 'created'} successfully` });
      setTimeout(() => {
        navigate('/course-management?tab=lessons');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save lesson' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/course-management?tab=lessons')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Lessons
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Lesson' : 'Create Lesson'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Lesson Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.course_id}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  setSelectedCourse(course || null);
                  setFormData({ ...formData, course_id: e.target.value, module_id: '' });
                  setSelectedModule(null);
                }}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module (Optional)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.module_id}
                onChange={(e) => {
                  const module = modules.find(m => m.id === e.target.value);
                  setSelectedModule(module || null);
                  setFormData({ ...formData, module_id: e.target.value || '' });
                }}
                disabled={!formData.course_id || modules.length === 0}
              >
                <option value="">None (Lesson belongs directly to course)</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.item_order ? `${String(module.item_order).padStart(2, '0')}. ` : ''}{module.title}
                  </option>
                ))}
              </select>
              {formData.course_id && modules.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  No modules found for this course. Lesson will be created directly under the course.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.item_order}
                  onChange={(e) => setFormData({ ...formData, item_order: parseInt(e.target.value) || 1 })}
                  disabled={formData.is_final_assessment}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_locked"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.is_locked}
                  onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                />
                <label htmlFor="is_locked" className="ml-2 block text-sm text-gray-700">
                  Locked (requires completion of previous lessons)
                </label>
              </div>

              {contentType === 'quiz' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_final_assessment"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.is_final_assessment}
                    onChange={async (e) => {
                      const isFinal = e.target.checked;
                      let newOrder = formData.item_order;

                      if (isFinal && formData.course_id) {
                        // Logic to set last order
                        const supabase = getSupabaseClient();
                        if (supabase) {
                          const { data } = await supabase
                            .from('lms_lessons')
                            .select('item_order')
                            .eq('course_id', formData.course_id)
                            .order('item_order', { ascending: false })
                            .limit(1);

                          newOrder = data && data.length > 0 ? data[0].item_order + 1 : 1;
                        }
                      }

                      setFormData({
                        ...formData,
                        is_final_assessment: isFinal,
                        item_order: newOrder
                      });
                    }}
                  />
                  <label htmlFor="is_final_assessment" className="ml-2 block text-sm text-gray-700">
                    Final Assessment (Will be placed at the end of the course)
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Content</h2>

            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setContentType('text')}
                className={`px-4 py-2 rounded-lg ${contentType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Text Content (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setContentType('video')}
                className={`px-4 py-2 rounded-lg ${contentType === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setContentType('quiz')}
                className={`px-4 py-2 rounded-lg ${contentType === 'quiz'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Quiz
              </button>
            </div>

            {contentType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <MarkdownEditor
                  value={formData.content || ''}
                  onChange={(markdown) => setFormData({ ...formData, content: markdown })}
                  placeholder="Write your lesson content... Use the toolbar to format text, add headings, lists, etc."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use the toolbar to format your content. Content is saved as Markdown format.
                </p>
              </div>
            )}

            {contentType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    required={contentType === 'video'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="Video URL or upload a file"
                  />
                  <label className={`px-4 py-2 rounded-lg cursor-pointer ${uploadingVideo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}>
                    <UploadIcon className="h-4 w-4 inline mr-2" />
                    {uploadingVideo ? `Uploading... ${uploadProgress}%` : 'Upload'}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                  </label>
                </div>
                {uploadingVideo && uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{uploadProgress}% uploaded</p>
                  </div>
                )}
                {formData.video_url && !uploadingVideo && (
                  <div className="mt-4">
                    <video
                      src={formData.video_url}
                      controls
                      className="w-full max-w-2xl rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}

            {contentType === 'quiz' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Quiz *</label>
                <select
                  required={contentType === 'quiz'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.quiz_id}
                  onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
                {!formData.course_id && (
                  <p className="mt-2 text-sm text-yellow-600">Please select a course first to see available quizzes.</p>
                )}
                {formData.course_id && quizzes.length === 0 && (
                  <p className="mt-2 text-sm text-gray-600">No quizzes found for this course. <button type="button" onClick={() => navigate('/course-management/quiz/new')} className="text-blue-600 hover:underline">Create a quiz</button></p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/course-management?tab=lessons')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
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

