import { DRAFT_STORAGE_KEY } from './constants';
import type { ValidationErrors } from './types';

export const detectMediaTypeFromUrl = (url: string): 'video' | 'audio' | 'unknown' => {
  if (!url) return 'unknown';
  const lowerUrl = url.toLowerCase();
  if (/(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.wmv|\.flv|\.mkv)(\?|$)/i.test(lowerUrl)) return 'video';
  if (/(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac|\.wma|\.opus)(\?|$)/i.test(lowerUrl)) return 'audio';
  if (/youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com/i.test(lowerUrl)) return 'video';
  if (/soundcloud\.com|spotify\.com|podcast/i.test(lowerUrl)) return 'audio';
  return 'unknown';
};

export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) {
    let videoId = '';
    if (lowerUrl.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : '';
    } else if (lowerUrl.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      videoId = match ? match[1] : '';
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  if (lowerUrl.includes('vimeo.com/')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const videoId = match ? match[1] : '';
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }

  if (lowerUrl.includes('dailymotion.com/video/') || lowerUrl.includes('dai.ly/')) {
    let videoId = '';
    if (lowerUrl.includes('dailymotion.com/video/')) {
      const match = url.match(/dailymotion\.com\/video\/([^/?]+)/);
      videoId = match ? match[1] : '';
    } else if (lowerUrl.includes('dai.ly/')) {
      const match = url.match(/dai\.ly\/([^/?]+)/);
      videoId = match ? match[1] : '';
    }
    if (videoId) {
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }
  }

  if (lowerUrl.includes('wistia.com/medias/')) {
    const match = url.match(/wistia\.com\/medias\/([^/?]+)/);
    const videoId = match ? match[1] : '';
    if (videoId) {
      return `https://fast.wistia.com/embed/iframe/${videoId}`;
    }
  }

  return null;
};

export const isEmbeddableUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|dai\.ly|wistia\.com/i.test(lowerUrl);
};

export const isDirectVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m3u8)(\?|$)/i.test(lowerUrl);
};

export const generateSlug = (text: string): string =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const isValidUrl = (value?: string): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidDuration = (value?: string): boolean => {
  if (!value) return true;
  const parts = String(value).split(':').map((part) => parseInt(part, 10));
  return parts.every((n) => !Number.isNaN(n)) && parts.length >= 1 && parts.length <= 3;
};

export const isNumeric = (value?: string): boolean => {
  if (value == null || value === '') return true;
  return /^\d+$/.test(String(value));
};

export const scrollToFirstError = (errors: ValidationErrors) => {
  const order = [
    'title',
    'slug',
    'summary',
    'featuredImage',
    'categories',
    'businessStages',
    'content',
    'videoUrl',
    'duration',
    'podcastUrl',
    'episodeNumber',
    'downloadUrl',
    'toolkitFileType',
  ];
  const first = order.find((key) => errors[key]);
  if (!first) return;
  const idMap: Record<string, string> = {
    title: 'title',
    slug: 'title',
    summary: 'summary',
    featuredImage: 'featuredImage',
    categories: 'category-group',
    businessStages: 'business-stage-group',
    content: 'content-editor',
    videoUrl: 'videoUrl',
    duration: 'duration',
    podcastUrl: 'podcastUrl',
    episodeNumber: 'episodeNumber',
    downloadUrl: 'downloadUrl',
    toolkitFileType: 'toolkitFileType',
  };
  const element = document.getElementById(idMap[first]);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (element as HTMLElement).focus?.();
  }
};

export const hasDraftContent = (formData: { [key: string]: any }, editorHtml: string, selectedStages: string[], uploads: string[]): boolean => {
  const hasAny = (
    (formData.title && formData.title.trim() !== '') ||
    (formData.summary && formData.summary.trim() !== '') ||
    (formData.featuredImage && formData.featuredImage.trim() !== '') ||
    (formData.category && formData.category.trim() !== '') ||
    (Array.isArray(formData.categories) && formData.categories.length > 0) ||
    (Array.isArray(formData.tags) && formData.tags.length > 0) ||
    (editorHtml && editorHtml.replace(/<[^>]+>/g, '').trim() !== '') ||
    selectedStages.length > 0 ||
    uploads.some((url) => !!url && url.trim() !== '') ||
    (formData.videoUrl && formData.videoUrl.trim() !== '') ||
    (formData.podcastUrl && formData.podcastUrl.trim() !== '') ||
    (formData.downloadUrl && formData.downloadUrl.trim() !== '') ||
    (Array.isArray(formData.toolkitRequirements) && formData.toolkitRequirements.length > 0) ||
    (Array.isArray(formData.toolkitHighlights) && formData.toolkitHighlights.length > 0) ||
    (Array.isArray(formData.toolkitToc) && formData.toolkitToc.length > 0) ||
    (Array.isArray(formData.toolkitAttachments) && formData.toolkitAttachments.length > 0) ||
    (Array.isArray(formData.toolkitAuthors) && formData.toolkitAuthors.length > 0) ||
    (formData.toolkitVersion && formData.toolkitVersion.trim() !== '') ||
    (formData.toolkitChangelogHtml && formData.toolkitChangelogHtml.replace(/<[^>]+>/g, '').trim() !== '')
  );
  return hasAny;
};

export const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const saveDraft = (payload: any) => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

export const removeDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};

