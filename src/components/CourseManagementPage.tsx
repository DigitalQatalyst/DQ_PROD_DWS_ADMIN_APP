import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, GraduationCapIcon, FileTextIcon, PlayCircleIcon, HelpCircleIcon, PlusIcon } from 'lucide-react';
import { LearningPathsSection } from './course-management/LearningPathsSection';
import { CoursesSection } from './course-management/CoursesSection';
import { ModulesSection } from './course-management/ModulesSection';
import { LessonsSection } from './course-management/LessonsSection';
import { QuizzesSection } from './course-management/QuizzesSection';

interface Tab {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'learning-paths', title: 'Learning Paths', icon: BookOpenIcon },
  { id: 'courses', title: 'Courses', icon: GraduationCapIcon },
  { id: 'modules', title: 'Modules', icon: FileTextIcon },
  { id: 'lessons', title: 'Lessons', icon: PlayCircleIcon },
  { id: 'quizzes', title: 'Quizzes', icon: HelpCircleIcon },
];

export const CourseManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Get tab from URL params or default to learning-paths
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab') || 'learning-paths';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [loading, setLoading] = useState(false);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url.toString());
  };

  const handleAddNew = () => {
    switch (activeTab) {
      case 'learning-paths':
        navigate('/course-management/learning-path/new');
        break;
      case 'courses':
        navigate('/course-management/course/new');
        break;
      case 'modules':
        navigate('/course-management/module/new');
        break;
      case 'lessons':
        navigate('/course-management/lesson/new');
        break;
      case 'quizzes':
        navigate('/course-management/quiz/new');
        break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'learning-paths':
        return <LearningPathsSection />;
      case 'courses':
        return <CoursesSection />;
      case 'modules':
        return <ModulesSection />;
      case 'lessons':
        return <LessonsSection />;
      case 'quizzes':
        return <QuizzesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Course Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage learning paths, courses, modules, lessons, and quizzes
            </p>
          </div>
          <button
            className="px-4 py-2 bg-[#1A2E6E] hover:bg-[#030F35] text-white rounded-md shadow-sm flex items-center justify-center text-sm font-medium transition-colors"
            onClick={handleAddNew}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${isActive
                    ? 'bg-[#1A2E6E] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

