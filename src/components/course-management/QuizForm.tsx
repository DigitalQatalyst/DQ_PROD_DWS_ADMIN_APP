import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '../ui/Toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // Index of correct answer (0-3)
  explanation?: string; // Explanation for the correct answer
}

export const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState({
    course_id: '',
    lesson_id: '',
    title: '',
    description: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadCourses();
    if (isEditing && id) {
      loadQuiz(id);
    } else {
      // Add one empty question for new quiz
      setQuestions([{
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
      }]);
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Load lessons when course is selected
    if (formData.course_id) {
      loadLessons(formData.course_id);
      const course = courses.find(c => c.id === formData.course_id);
      if (course) setSelectedCourse(course);
    } else {
      setLessons([]);
      setSelectedCourse(null);
    }
  }, [formData.course_id]);

  const loadCourses = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data } = await supabase.from('lms_courses').select('id, title').order('title');
    if (data) setCourses(data);
  };

  const loadLessons = async (courseId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data } = await supabase
      .from('lms_lessons')
      .select('id, title, item_order')
      .eq('course_id', courseId)
      .order('item_order');
    
    if (data) {
      setLessons(data);
    }
  };

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const { data, error } = await supabase
        .from('lms_quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          course_id: data.course_id,
          lesson_id: (data as any).lesson_id || '',
          title: data.title,
          description: data.description || '',
        });
        
        // Load lessons for the course
        if (data.course_id) {
          await loadLessons(data.course_id);
          const course = courses.find(c => c.id === data.course_id);
          if (course) setSelectedCourse(course);
        }
        
        // Parse questions from JSON or use empty array
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions.map((q: any, index: number) => ({
            id: q.id || `q-${index}`,
            question: q.question || '',
            options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
            correct_answer: q.correct_answer !== undefined ? q.correct_answer : 0,
            explanation: q.explanation || '',
          })));
        } else {
          setQuestions([{
            id: Date.now().toString(),
            question: '',
            options: ['', '', '', ''],
            correct_answer: 0,
            explanation: '',
          }]);
        }
      }
    } catch (error: any) {
      console.error('Error loading quiz:', error);
      setToast({ type: 'error', message: error.message || 'Failed to load quiz' });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
    }]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate questions
    const invalidQuestions = questions.filter(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim()) || q.options.length !== 4
    );
    
    if (invalidQuestions.length > 0) {
      setToast({ type: 'error', message: 'Please fill in all questions and options' });
      return;
    }

    setSaving(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Database connection unavailable');
      }

      const dataToSave: any = {
        ...formData,
        questions: questions,
      };
      
      // Only include lesson_id if it has a value
      if (formData.lesson_id) {
        dataToSave.lesson_id = formData.lesson_id;
      } else {
        dataToSave.lesson_id = null;
      }

      if (isEditing && id) {
        const { error } = await supabase
          .from('lms_quizzes')
          .update(dataToSave)
          .eq('id', id);

        // If error is about missing column, retry without lesson_id
        if (error && error.message?.includes('lesson_id')) {
          console.warn('lesson_id column not found, retrying without it');
          const { lesson_id, ...dataWithoutLessonId } = dataToSave;
          const { error: retryError } = await supabase
            .from('lms_quizzes')
            .update(dataWithoutLessonId)
            .eq('id', id);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('lms_quizzes')
          .insert([dataToSave]);

        // If error is about missing column, retry without lesson_id
        if (error && error.message?.includes('lesson_id')) {
          console.warn('lesson_id column not found, retrying without it');
          const { lesson_id, ...dataWithoutLessonId } = dataToSave;
          const { error: retryError } = await supabase
            .from('lms_quizzes')
            .insert([dataWithoutLessonId]);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      }

      setToast({ type: 'success', message: `Quiz ${isEditing ? 'updated' : 'created'} successfully` });
      setTimeout(() => {
        navigate('/course-management?tab=quizzes');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save quiz' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/course-management?tab=quizzes')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Quizzes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Quiz' : 'Create Quiz'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Quiz Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.course_id}
                onChange={(e) => {
                  setFormData({ ...formData, course_id: e.target.value, lesson_id: '' });
                  const course = courses.find(c => c.id === e.target.value);
                  setSelectedCourse(course || null);
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson (Optional)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.lesson_id}
                onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value || '' })}
                disabled={!formData.course_id || lessons.length === 0}
              >
                <option value="">None (General course quiz)</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.item_order ? `${String(lesson.item_order).padStart(2, '0')}. ` : ''}{lesson.title}
                  </option>
                ))}
              </select>
              {formData.course_id && lessons.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  No lessons found for this course. Quiz will be a general course quiz.
                </p>
              )}
              {formData.lesson_id && (
                <p className="mt-1 text-xs text-blue-600">
                  This quiz will be shown at the end of the selected lesson.
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
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Enter your question here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct_answer === optIndex}
                          onChange={() => updateQuestion(question.id, 'correct_answer', optIndex)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={option}
                          onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        {question.correct_answer === optIndex && (
                          <span className="text-xs text-green-600 font-medium">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    placeholder="Explain why this answer is correct (shown to users after they answer)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This explanation will be shown to users after they answer the question.
                  </p>
                </div>
              </div>
            ))}

            {/* Add Question button below the last question */}
            {questions.length > 0 && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Another Question
                </button>
              </div>
            )}

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No questions yet. Click "Add Question" to get started.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/course-management?tab=quizzes')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || questions.length === 0}
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

