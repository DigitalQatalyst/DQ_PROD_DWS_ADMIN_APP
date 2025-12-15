import type React from 'react';

import type { MediaFormData, UploadState, ValidationErrors } from '../types';

interface DocumentFieldsSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  uploadState: UploadState;
  onUpload: (file: File | null | undefined) => Promise<void>;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  title: 'Report' | 'Toolkit';
}

export const DocumentFieldsSection: React.FC<DocumentFieldsSectionProps> = ({
  formData,
  errors,
  onChange,
  uploadState,
  onUpload,
  onRemove,
  fileInputRef,
  title,
}) => {
  const downloadUrl = formData.downloadUrl || uploadState.uploadedUrl;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Download URL <span className="text-red-500">*</span>
          </label>
          <input
            id="downloadUrl"
            name="downloadUrl"
            value={downloadUrl}
            onChange={onChange}
            disabled={!!uploadState.uploadedUrl}
            placeholder="https://..."
            className={`mt-1 block w-full border rounded-md py-2 px-3 ${
              errors.downloadUrl ? 'border-red-500' : 'border-gray-300'
            } ${uploadState.uploadedUrl ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
          {errors.downloadUrl && !uploadState.uploadedUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.downloadUrl}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={async (event) => {
                const file = event.target.files?.[0] || null;
                await onUpload(file);
              }}
            />
            {uploadState.uploading && <span className="text-xs text-gray-500">Uploading…</span>}
            {uploadState.uploadedUrl && <span className="text-xs text-green-700">Uploaded</span>}
          </div>
          {uploadState.uploadedUrl && (
            <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 py-1">
              <a
                href={uploadState.uploadedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-700 truncate"
              >
                {uploadState.uploadedUrl}
              </a>
              <button type="button" className="text-xs text-red-600" onClick={onRemove}>
                Remove
              </button>
            </div>
          )}
          {uploadState.error && <p className="mt-1 text-xs text-red-600">{uploadState.error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">File Size</label>
          <input
            name="fileSize"
            value={formData.fileSize}
            onChange={onChange}
            placeholder="e.g. 2 MB"
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentFieldsSection;

