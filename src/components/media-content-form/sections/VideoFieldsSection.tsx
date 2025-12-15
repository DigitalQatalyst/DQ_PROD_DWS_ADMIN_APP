import type React from 'react';

import type { MediaFormData, UploadState, ValidationErrors } from '../types';

interface VideoFieldsSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  uploadState: UploadState;
  onUpload: (file: File | null | undefined) => Promise<void>;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  getEmbedUrl: (url: string) => string | null;
  isEmbeddableUrl: (url: string) => boolean;
  isDirectVideoUrl: (url: string) => boolean;
}

export const VideoFieldsSection: React.FC<VideoFieldsSectionProps> = ({
  formData,
  errors,
  onChange,
  uploadState,
  onUpload,
  onRemove,
  fileInputRef,
  getEmbedUrl,
  isEmbeddableUrl,
  isDirectVideoUrl,
}) => {
  const videoUrl = formData.videoUrl || uploadState.uploadedUrl;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Video URL <span className="text-red-500">*</span>
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            value={videoUrl}
            onChange={onChange}
            disabled={!!uploadState.uploadedUrl}
            placeholder="https://..."
            className={`mt-1 block w-full border rounded-md py-2 px-3 ${
              errors.videoUrl ? 'border-red-500' : 'border-gray-300'
            } ${uploadState.uploadedUrl ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
          {errors.videoUrl && !uploadState.uploadedUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.videoUrl}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
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
          <label className="block text-sm font-medium text-gray-700">Duration (mm:ss)</label>
          <input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={onChange}
            placeholder="05:30"
            className={`mt-1 block w-full border rounded-md py-2 px-3 ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
        </div>
      </div>
      {videoUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Video Preview</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-black">
            {isEmbeddableUrl(videoUrl) ? (
              <iframe
                src={getEmbedUrl(videoUrl) || ''}
                className="w-full"
                style={{ aspectRatio: '16/9', minHeight: '400px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            ) : isDirectVideoUrl(videoUrl) ? (
              <video src={videoUrl} controls className="w-full max-h-96" style={{ maxHeight: '24rem' }}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="mb-2">Video preview not available</p>
                <p className="text-sm">
                  This URL may require a different player or hosting platform.
                </p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-400 hover:text-blue-300 underline"
                >
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFieldsSection;

