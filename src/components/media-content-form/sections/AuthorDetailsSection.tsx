import { User as UserIcon } from 'lucide-react';
import type React from 'react';

import type { MediaFormData, ValidationErrors } from '../types';

interface AuthorDetailsSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AuthorDetailsSection: React.FC<AuthorDetailsSectionProps> = ({ formData, errors, onChange }) => (
  <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden border border-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
    <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200">
            <UserIcon className="w-5 h-5" />
          </div>
          Attribution
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-medium ml-12">Identify the voices behind the content</p>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
        <span>Step 02</span>
        <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-amber-500"></div>
        </div>
      </div>
    </div>

    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-amber-600">
            Author Name <span className="text-red-500">*</span>
          </label>
          <input
            name="authorName"
            value={formData.authorName}
            onChange={onChange}
            required
            placeholder="e.g. John Doe"
            className={`block w-full border rounded-xl py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold ${errors.authorName ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}
          />
          {errors.authorName && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.authorName}</p>}
        </div>

        <div className="group">
          <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-amber-600">
            Organization or Source
          </label>
          <input
            name="authorOrg"
            value={formData.authorOrg}
            onChange={onChange}
            placeholder="e.g. DigitalQatalyst"
            className={`block w-full border border-slate-200 rounded-xl py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold hover:border-slate-300 ${errors.authorOrg ? 'border-red-500 bg-red-50/50' : ''
              }`}
          />
          {errors.authorOrg && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.authorOrg}</p>}
        </div>
      </div>

      {formData.activeTab !== 'Guide' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-amber-600">
                Professional Title
              </label>
              <input
                name="authorTitle"
                value={formData.authorTitle}
                onChange={onChange}
                placeholder="e.g. Strategy Lead"
                className={`block w-full border border-slate-200 rounded-xl py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold hover:border-slate-300 ${errors.authorTitle ? 'border-red-500 bg-red-50/50' : ''
                  }`}
              />
              {errors.authorTitle && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.authorTitle}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-amber-600">
                Author Headshot URL
              </label>
              <input
                name="authorPhotoUrl"
                value={formData.authorPhotoUrl}
                onChange={onChange}
                placeholder="https://..."
                className={`block w-full border border-slate-200 rounded-xl py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold hover:border-slate-300 ${errors.authorPhotoUrl ? 'border-red-500 bg-red-50/50' : ''
                  }`}
              />
              {errors.authorPhotoUrl && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.authorPhotoUrl}</p>}
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-amber-600">
              Author Biography
            </label>
            <textarea
              name="authorBio"
              rows={2}
              value={formData.authorBio}
              onChange={onChange}
              placeholder="A few words about the author's expertise..."
              className={`block w-full border border-slate-200 rounded-xl py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium leading-relaxed hover:border-slate-300 ${errors.authorBio ? 'border-red-500 bg-red-50/50' : ''
                } min-h-[80px]`}
            />
            {errors.authorBio && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.authorBio}</p>}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default AuthorDetailsSection;

