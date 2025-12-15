import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { uploadLMSFileSupabase } from '../../lib/lmsStorageProviderSupabase';
import { Toast } from '../ui/Toast';
import { DEPARTMENTS, COURSE_CATEGORIES, LMS_ITEM_PROVIDERS, COURSE_TYPES, SFIA_LEVEL_CODES, AUDIENCE_OPTIONS } from '../../constants/courseConstants';

export const CourseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    provider: '',
    description: '',
    category: '',
    delivery_mode: '',
    duration: 0,
    level_code: '',
    department: '',
    audience: '',
    status: 'draft',
    highlights: [] as string[],
    outcomes: [] as string[],
    course_type: '',
    track: '',
    rating: 0,
    review_count: 0,
    image_url: '',
    faq: [] as any[],
  });

  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [selectedLearningPath, setSelectedLearningPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [highlightInput, setHighlightInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isEditing && id) {
      loadCourse(id);
    }
    loadLearningPaths();
  }, [id, isEditing]);

  const loadLearningPaths = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data } = await supabase.from('lms_learning_paths').select('id, title');
    if (data) setLearningPaths(data);
  };

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { data, error } = await supabase
        .from('lms_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          outcomes: Array.isArray(data.outcomes) ? data.outcomes : [],
          faq: Array.isArray(data.faq) ? data.faq : [],
        });
        
        // Load associated learning path
        const { data: pathData } = await supabase
          .from('lms_path_items')
          .select('path_id')
          .eq('course_id', courseId)
          .single();
        
        if (pathData) {
          setSelectedLearningPath(pathData.path_id);
        }
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load course' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use slug or generate a temporary one for new courses
    const courseSlug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-') || 'temp';

    if (!courseSlug || courseSlug === 'temp') {
      setToast({ type: 'error', message: 'Please enter a course title or slug first' });
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);
      
      const result = await uploadLMSFileSupabase({
        file,
        courseSlug,
        itemType: 'thumbnail',
        itemId: id,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      setFormData({ ...formData, image_url: result.publicUrl });
      setUploadProgress(100);
      setToast({ type: 'success', message: 'Thumbnail uploaded successfully' });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setToast({ type: 'error', message: error.message || 'Failed to upload image' });
      setUploadProgress(0);
    } finally {
      setUploadingImage(false);
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, highlightInput.trim()],
      });
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      setFormData({
        ...formData,
        outcomes: [...formData.outcomes, outcomeInput.trim()],
      });
      setOutcomeInput('');
    }
  };

  const removeOutcome = (index: number) => {
    setFormData({
      ...formData,
      outcomes: formData.outcomes.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const dataToSave = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      };

      let courseId: string;
      if (isEditing && id) {
        const { data, error } = await supabase
          .from('lms_courses')
          .update(dataToSave)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        courseId = data.id;
      } else {
        const { data, error } = await supabase
          .from('lms_courses')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        courseId = data.id;
      }

      // Handle learning path association
      if (selectedLearningPath) {
        // Remove existing associations
        await supabase
          .from('lms_path_items')
          .delete()
          .eq('course_id', courseId);

        // Add new association
        const { error: pathError } = await supabase
          .from('lms_path_items')
          .insert({
            path_id: selectedLearningPath,
            course_id: courseId,
            position: 0, // You might want to calculate this based on existing items
          });

        if (pathError) {
          console.warn('Failed to associate with learning path:', pathError);
        }
      }

      setToast({ type: 'success', message: `Course ${isEditing ? 'updated' : 'created'} successfully` });
      setTimeout(() => {
        navigate('/course-management?tab=courses');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving course:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save course' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/course-management?tab=courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Course' : 'Create Course'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated from title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                >
                  <option value="">Select provider</option>
                  {LMS_ITEM_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {COURSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.delivery_mode}
                  onChange={(e) => setFormData({ ...formData, delivery_mode: e.target.value })}
                >
                  <option value="">Select delivery mode</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.course_type}
                  onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                >
                  <option value="">Select course type</option>
                  {COURSE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating - SFIA (Level Code)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.level_code}
                  onChange={(e) => setFormData({ ...formData, level_code: e.target.value })}
                >
                  <option value="">Select SFIA level</option>
                  {SFIA_LEVEL_CODES.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                >
                  <option value="">Select audience</option>
                  {AUDIENCE_OPTIONS.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Learning Path (Optional)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedLearningPath}
                onChange={(e) => setSelectedLearningPath(e.target.value)}
              >
                <option value="">None</option>
                {learningPaths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Image</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Image URL"
                />
                <label className={`px-4 py-2 rounded-lg cursor-pointer ${
                  uploadingImage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <UploadIcon className="h-4 w-4 inline mr-2" />
                  {uploadingImage ? `Uploading... ${uploadProgress}%` : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {uploadingImage && uploadProgress > 0 && (
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
              {formData.image_url && !uploadingImage && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Highlights</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                placeholder="Add a highlight"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{highlight}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Learning Outcomes</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                placeholder="Add a learning outcome"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.outcomes.map((outcome, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{outcome}</span>
                  <button
                    type="button"
                    onClick={() => removeOutcome(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/course-management?tab=courses')}
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

