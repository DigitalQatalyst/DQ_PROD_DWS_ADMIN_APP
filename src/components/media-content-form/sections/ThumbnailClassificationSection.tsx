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
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" /> Thumbnail &amp; Classification
      </h2>
      <p className="mt-1 text-sm text-gray-500">Featured image, category and business stage</p>
    </div>
    <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
      <div className="sm:col-span-2">
        <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
          Thumbnail URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="featuredImage"
          name="featuredImage"
          value={formData.featuredImage}
          onChange={onFieldChange}
          placeholder="https://example.com/images/image.jpg"
          required
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.featuredImage ? 'border-red-500' : 'border-gray-300'
            }`}
          aria-invalid={!!errors.featuredImage}
        />
        {errors.featuredImage && (
          <p className="mt-1 text-xs text-red-600">{errors.featuredImage}</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <input
            ref={thumbnailFileInputRef}
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0] || null;
              await onThumbnailUpload(file);
            }}
          />
          {thumbnailUpload.uploading && <span className="text-xs text-gray-500">Uploading…</span>}
          {thumbnailUpload.uploadedUrl && (
            <button
              type="button"
              onClick={onThumbnailRemove}
              className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              <XIcon className="w-3 h-3" />
              Remove uploaded thumbnail
            </button>
          )}
        </div>
        {formData.featuredImage ? (
          <div className="mt-3">
            <img
              src={formData.featuredImage}
              alt="Preview"
              className="h-32 w-auto rounded border"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <span
          id="category-group"
          className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
        >
          <LayersIcon className="w-4 h-4" /> Category
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="category-group">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategories.includes(category)}
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        {catError && <p className="mt-1 text-xs text-red-600">{catError}</p>}
      </div>
      {availableFormats.length > 0 && (
        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <TagIcon className="w-4 h-4" /> Format
          </span>
          <div className="flex flex-wrap gap-2">
            {availableFormats.map((format) => (
              <button
                key={format}
                type="button"
                aria-pressed={selectedFormat === format}
                onClick={() => onFormatSelect(format)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedFormat === format
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="sm:col-span-2">
        <span id="business-stage-group" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <TagIcon className="w-4 h-4" /> Business Stage
        </span>
        <div className="flex flex-wrap gap-2">
          {stageTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={selectedBusinessStages.includes(tag)}
              onClick={() => onBusinessStageToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedBusinessStages.includes(tag)
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {errors.businessStages && <p className="mt-1 text-xs text-red-600">{errors.businessStages}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs">
              {tag}
              <button
                type="button"
                onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                className="text-blue-500 hover:text-blue-700"
                aria-label={`Remove tag ${tag}`}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
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
            placeholder="Add tag and press Enter"
            className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            <PlusIcon className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ThumbnailClassificationSection;

