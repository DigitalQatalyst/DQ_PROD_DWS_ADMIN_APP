import { User as UserIcon } from 'lucide-react';
import type React from 'react';

import type { MediaFormData, ValidationErrors } from '../types';

interface AuthorDetailsSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AuthorDetailsSection: React.FC<AuthorDetailsSectionProps> = ({ formData, errors, onChange }) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <UserIcon className="w-5 h-5" /> Author Details
      </h2>
      <p className="mt-1 text-sm text-gray-500">All author details</p>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Author Name <span className="text-red-500">*</span>
        </label>
        <input
          name="authorName"
          value={formData.authorName}
          onChange={onChange}
          required
          className={`mt-1 block w-full border rounded-md py-2 px-3 ${
            errors.authorName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.authorName && <p className="mt-1 text-xs text-red-600">{errors.authorName}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700">Author Organization</label>
        <input
          name="authorOrg"
          value={formData.authorOrg}
          onChange={onChange}
          className={`mt-1 block w-full border rounded-md py-2 px-3 ${
            errors.authorOrg ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.authorOrg}
        />
        {errors.authorOrg && <p className="mt-1 text-xs text-red-600">{errors.authorOrg}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700">Author Role/Title</label>
        <input
          name="authorTitle"
          value={formData.authorTitle}
          onChange={onChange}
          className={`mt-1 block w-full border rounded-md py-2 px-3 ${
            errors.authorTitle ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.authorTitle}
        />
        {errors.authorTitle && <p className="mt-1 text-xs text-red-600">{errors.authorTitle}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-700">Author Photo URL</label>
        <input
          name="authorPhotoUrl"
          value={formData.authorPhotoUrl}
          onChange={onChange}
          className={`mt-1 block w-full border rounded-md py-2 px-3 ${
            errors.authorPhotoUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.authorPhotoUrl}
        />
        {errors.authorPhotoUrl && <p className="mt-1 text-xs text-red-600">{errors.authorPhotoUrl}</p>}
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700">Author Bio</label>
        <textarea
          name="authorBio"
          rows={3}
          value={formData.authorBio}
          onChange={onChange}
          className={`mt-1 block w-full border rounded-md py-2 px-3 ${
            errors.authorBio ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!errors.authorBio}
        />
        {errors.authorBio && <p className="mt-1 text-xs text-red-600">{errors.authorBio}</p>}
      </div>
    </div>
  </div>
);

export default AuthorDetailsSection;

