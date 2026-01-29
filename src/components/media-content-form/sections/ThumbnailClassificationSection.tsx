import { useState } from 'react';
import type { FC } from 'react';
import { Image as ImageIcon, Layers as LayersIcon, Plus as PlusIcon, Tag as TagIcon, X as XIcon } from 'lucide-react';

import type { MediaFormData, UploadState, ValidationErrors } from '../types';

interface ThumbnailClassificationSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  categories: string[];
  catError: string;
  selectedBusinessStages: string[];
  onBusinessStageToggle: (stage: string) => void;
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
  availableFormats: string[];
  stageTags: string[];
  onFieldChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isEditing: boolean;
  isToolkit: boolean;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  thumbnailUpload: UploadState;
  onThumbnailUpload: (file: File | null | undefined) => Promise<void>;
  onThumbnailRemove: () => void;
  thumbnailFileInputRef: React.RefObject<HTMLInputElement>;
}

export const ThumbnailClassificationSection: FC<ThumbnailClassificationSectionProps> = ({
  formData,
  errors,
  categories,
  catError,
  selectedBusinessStages,
  onBusinessStageToggle,
  selectedFormat,
  onFormatSelect,
  availableFormats,
  stageTags,
  onFieldChange,
  isEditing,
  isToolkit,
  selectedCategories,
  onCategoriesChange,
  tags,
  onTagsChange,
  thumbnailUpload,
  onThumbnailUpload,
  onThumbnailRemove,
  thumbnailFileInputRef,
}) => {
  const [tagDraft, setTagDraft] = useState('');

  const handleCategoryToggle = (category: string) => {
    if (!isToolkit) {
      onCategoriesChange(selectedCategories[0] === category ? [] : [category]);
      return;
    }
    const exists = selectedCategories.includes(category);
    onCategoriesChange(exists ? selectedCategories.filter((item) => item !== category) : [...selectedCategories, category]);
  };

  const handleTagAdd = () => {
    const value = tagDraft.trim();
    if (!value) return;
    if (!tags.includes(value)) {
      onTagsChange([...tags, value]);
    }
    setTagDraft('');
  };

  return (
    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden border border-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
      <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            Curation & Assets
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium ml-12">Visual representation and discovery classification</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
          <span>Step 03</span>
          <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-blue-500 opacity-50"></div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Thumbnail Section */}
        <div className="group">
          <label htmlFor="featuredImage" className="block text-sm font-bold text-slate-700 mb-4 transition-colors group-hover:text-blue-600">
            Featured Image URL <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-1 relative">
              <input
                type="url"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={onFieldChange}
                placeholder="https://images.unsplash.com/..."
                className={`block w-full border rounded-xl py-3.5 px-4 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold ${errors.featuredImage ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={thumbnailFileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0] || null;
                  await onThumbnailUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => thumbnailFileInputRef.current?.click()}
                className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all shadow-sm hover:border-blue-500 hover:text-blue-600 active:scale-95 flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Upload New
              </button>
            </div>
          </div>
          {thumbnailUpload.uploading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-bold animate-pulse">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              Processing visual asset…
            </div>
          )}
          {thumbnailUpload.uploadedUrl && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 animate-in slide-in-from-top-2">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Asset Uploaded
              </span>
              <button type="button" onClick={onThumbnailRemove} className="text-[10px] font-black text-red-600 uppercase hover:text-red-700">Delete</button>
            </div>
          )}
          {formData.featuredImage ? (
            <div className="mt-8 relative group/img w-full max-w-md aspect-video rounded-3xl overflow-hidden border-8 border-white shadow-2xl transition-all hover:scale-[1.01]">
              <img
                src={formData.featuredImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-6">
                <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-800 tracking-widest shadow-lg">Live Preview</span>
              </div>
            </div>
          ) : null}
        </div>

        {formData.activeTab !== 'Guide' && (
          <div className="space-y-12 pt-12 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Category selection */}
            <div className="group">
              <span id="category-group" className="block text-sm font-bold text-slate-700 mb-5 transition-colors group-hover:text-blue-600 flex items-center gap-2">
                <LayersIcon className="w-4 h-4" /> Editorial Genre <span className="text-red-500">*</span>
              </span>
              <div className="flex flex-wrap gap-3" role="group" aria-labelledby="category-group">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selectedCategories.includes(category)}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black border uppercase tracking-wider transition-all active:scale-95 ${selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {catError && <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-tight">{catError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Format selection */}
              {availableFormats.length > 0 && (
                <div className="group">
                  <span className="block text-sm font-bold text-slate-700 mb-5 transition-colors group-hover:text-blue-600 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" /> Logical Format
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {availableFormats.map((format) => (
                      <button
                        key={format}
                        type="button"
                        aria-pressed={selectedFormat === format}
                        onClick={() => onFormatSelect(format)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selectedFormat === format
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Stage */}
              <div className="group">
                <span id="business-stage-group" className="block text-sm font-bold text-slate-700 mb-5 transition-colors group-hover:text-blue-600 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" /> Growth Stage
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {stageTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={selectedBusinessStages.includes(tag)}
                      onClick={() => onBusinessStageToggle(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${selectedBusinessStages.includes(tag)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {errors.businessStages && <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.businessStages}</p>}
              </div>
            </div>

            {/* Tags */}
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-5 transition-colors group-hover:text-blue-600 flex items-center gap-2">
                Discovery Taxonomies
              </label>
              <div className="flex flex-wrap gap-2.5 mb-5 min-h-[50px] p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 border-dashed relative">
                {tags.length === 0 && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <TagIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add tags for global search</span>
                  </div>
                )}
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-xl bg-white shadow-sm border border-slate-100 px-4 py-2 text-xs font-extrabold text-blue-700 hover:border-blue-300 transition-all cursor-default">
                    {tag}
                    <button
                      type="button"
                      onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <PlusIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(event) => setTagDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleTagAdd();
                      }
                      if (event.key === 'Backspace' && !tagDraft && tags.length > 0) {
                        onTagsChange(tags.slice(0, -1));
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                    className="block w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="px-8 py-3.5 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:bg-black active:scale-95"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailClassificationSection;

