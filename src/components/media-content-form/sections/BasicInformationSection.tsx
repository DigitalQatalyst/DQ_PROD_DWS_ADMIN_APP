import { RefreshCcw as RefreshIcon, Type as TypeIcon } from 'lucide-react';
import type React from 'react';

import type { MediaFormData, ValidationErrors } from '../types';

interface BasicInformationSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSlugChange: (value: string) => void;
  onSlugRegenerate: () => void;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  formData,
  errors,
  onChange,
  onSlugChange,
  onSlugRegenerate,
}) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <TypeIcon className="w-5 h-5" /> Basic Information
      </h2>
      <p className="mt-1 text-sm text-gray-500">Title, status and summary</p>
    </div>
    <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
      <div className="sm:col-span-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          id="slug"
          value={formData.slug}
          onChange={(event) => onSlugChange(event.target.value)}
          className={`mt-1 block w-full border rounded-md py-2 px-3 bg-white text-gray-700 ${
            errors.slug ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.slug ? (
            <p className="text-xs text-red-600">{errors.slug}</p>
          ) : (
            <p className="text-xs text-gray-500">Auto-generated from title, but you can edit it.</p>
          )}
          <button
            type="button"
            onClick={onSlugRegenerate}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <RefreshIcon className="w-3 h-3" />
            Regenerate
          </button>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          Summary <span className="text-red-500">*</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          value={formData.summary}
          onChange={onChange}
          required
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.summary ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.summary && <p className="mt-1 text-xs text-red-600">{errors.summary}</p>}
      </div>
    </div>
  </div>
);

export default BasicInformationSection;

