import type React from 'react';

import type { MediaFormData, UploadState, ValidationErrors } from '../types';

interface PodcastFieldsSectionProps {
  formData: MediaFormData;
  errors: ValidationErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  uploadState: UploadState;
  onUpload: (file: File | null | undefined) => Promise<void>;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  detectMediaTypeFromUrl: (url: string) => 'video' | 'audio' | 'unknown';
  getEmbedUrl: (url: string) => string | null;
  isEmbeddableUrl: (url: string) => boolean;
  isDirectVideoUrl: (url: string) => boolean;
}

export const PodcastFieldsSection: React.FC<PodcastFieldsSectionProps> = ({
  formData,
  errors,
  onChange,
  uploadState,
  onUpload,
  onRemove,
  fileInputRef,
  detectMediaTypeFromUrl,
  getEmbedUrl,
  isEmbeddableUrl,
  isDirectVideoUrl,
}) => {
  const podcastUrl = formData.podcastUrl || uploadState.uploadedUrl;
  const mediaType = detectMediaTypeFromUrl(podcastUrl);

  const renderPreview = () => {
    if (!podcastUrl) return null;
    if (isEmbeddableUrl(podcastUrl)) {
      return (
        <iframe
          src={getEmbedUrl(podcastUrl) || ''}
          className="w-full"
          style={{ aspectRatio: '16/9', minHeight: '400px' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Podcast preview"
        />
      );
    }

    if (isDirectVideoUrl(podcastUrl) || mediaType === 'video') {
      return (
        <video src={podcastUrl} controls className="w-full max-h-96" style={{ maxHeight: '24rem' }}>
          Your browser does not support the video tag.
        </video>
      );
    }

    if (
      mediaType === 'audio' ||
      /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)(\?|$)/i.test(podcastUrl)
    ) {
      return (
        <audio src={podcastUrl} controls className="w-full">
          Your browser does not support the audio tag.
        </audio>
      );
    }

    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 p-4 text-center text-gray-400">
        <p className="mb-2">Podcast preview not available</p>
        <p className="text-sm mb-4">This URL may require a different player or hosting platform.</p>
        <a
          href={podcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-400 hover:text-blue-300 underline"
        >
          Open in new tab
        </a>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Podcast URL <span className="text-red-500">*</span>
          </label>
          <input
            id="podcastUrl"
            name="podcastUrl"
            value={podcastUrl}
            onChange={onChange}
            disabled={!!uploadState.uploadedUrl}
            placeholder="https://..."
            className={`mt-1 block w-full border rounded-md py-2 px-3 ${
              errors.podcastUrl ? 'border-red-500' : 'border-gray-300'
            } ${uploadState.uploadedUrl ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          />
          {errors.podcastUrl && !uploadState.uploadedUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.podcastUrl}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,video/mp4,video/webm,video/ogg"
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
          <label className="block text-sm font-medium text-gray-700">Episode #</label>
          <input
            id="episodeNumber"
            name="episodeNumber"
            value={formData.episodeNumber}
            onChange={onChange}
            placeholder="1"
            className={`mt-1 block w-full border rounded-md py-2 px-3 ${
              errors.episodeNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.episodeNumber && <p className="mt-1 text-xs text-red-600">{errors.episodeNumber}</p>}
        </div>
      </div>
      {podcastUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Podcast Preview</label>
          {renderPreview()}
        </div>
      )}
    </div>
  );
};

export default PodcastFieldsSection;

