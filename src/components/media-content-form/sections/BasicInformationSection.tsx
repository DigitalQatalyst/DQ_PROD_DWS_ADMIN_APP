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
  <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden border border-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
    <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <TypeIcon className="w-5 h-5" />
          </div>
          Core Identity
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-medium ml-12">Essential identifiers and visibility settings</p>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
        <span>Step 01</span>
        <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500"></div>
        </div>
      </div>
    </div>

    <div className="p-8 space-y-8">
      {/* Title Block */}
      <div className="group">
        <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-indigo-600">
          Content Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          placeholder="Enter a compelling title..."
          className={`block w-full border rounded-xl py-3.5 px-4 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg font-bold placeholder:font-medium placeholder:text-slate-300 ${errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
            }`}
        />
        {errors.title && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Slug Block */}
        <div className="group">
          <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-indigo-600 flex items-center justify-between">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className={`flex items-center border rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 overflow-hidden ${errors.slug ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}>
            <span className="pl-4 text-slate-400 text-xs font-bold uppercase tracking-widest border-r border-slate-100 pr-3 mr-3 py-3 bg-slate-50/50">/content/</span>
            <input
              id="slug"
              value={formData.slug}
              onChange={(event) => onSlugChange(event.target.value)}
              className="flex-1 py-3 px-2 text-sm font-bold text-indigo-700 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={onSlugRegenerate}
              className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"
              title="Regenerate slug"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          </div>
          {errors.slug ? (
            <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.slug}</p>
          ) : (
            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Unique resource identifier</p>
          )}
        </div>

        {/* Status Block */}
        <div className="group">
          <label htmlFor="status" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-indigo-600">
            Lifecycle Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onChange}
            required
            className="block w-full border border-slate-200 rounded-xl shadow-sm py-3.5 px-4 outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
          >
            {formData.activeTab === 'Guide' ? (
              <>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Archived">Archived</option>
                <option value="Published">Published</option>
              </>
            ) : (
              <>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </>
            )}
          </select>
          {errors.status && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.status}</p>}
        </div>
      </div>

      {/* Summary Block */}
      {formData.activeTab !== 'Guide' && (
        <div className="group">
          <label htmlFor="summary" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-hover:text-indigo-600">
            Executive Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={1}
            value={formData.summary}
            onChange={onChange}
            required
            placeholder="Brief overview for cards and SEO..."
            className={`block w-full border rounded-xl shadow-sm py-4 px-4 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium leading-relaxed ${errors.summary ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
              } min-h-[60px]`}
          />
          {errors.summary && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.summary}</p>}
        </div>
      )}
    </div>
  </div>
);

export default BasicInformationSection;

