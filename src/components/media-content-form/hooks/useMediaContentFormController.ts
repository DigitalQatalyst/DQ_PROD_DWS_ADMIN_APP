import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type React from 'react';
import type { Location, NavigateFunction } from 'react-router-dom';

import { useCRUD } from '../../../hooks/useCRUD';
import { getSupabaseClient, getSupabaseClient2, getServiceRoleClient2, setSupabaseSession } from '../../../lib/dbClient';
import { uploadFile } from '../../../lib/storageProvider';
import { checkSlugExists, createMedia, getGuideById, parseDurationToSeconds, updateMedia } from '../../../services/knowledgehub';
import {
  CATEGORY_FACET_CODES,
  DEFAULT_CATEGORIES,
  MEDIA_TYPE_FORMAT_MAPPING,
  INITIAL_FORM_DATA,
  STAGE_TAGS,
  TAB_TO_MEDIA_TYPE,
} from '../constants';
import type {
  MediaFormData,
  TabKey,
  ValidationErrors,
  UploadState,
  ToolkitAttachment,
  ToolkitAuthor,
  ToolkitRequirement,
  ToolkitTocItem,
  ToolkitHighlight,
} from '../types';
import {
  detectMediaTypeFromUrl,
  generateSlug,
  getEmbedUrl,
  hasDraftContent,
  isDirectVideoUrl,
  isEmbeddableUrl,
  isNumeric,
  isValidDuration,
  isValidUrl,
  loadDraft,
  removeDraft,
  saveDraft,
  scrollToFirstError,
} from '../utils';

const LOG_SAVE_FLOW = import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONTENT_LOGGING === 'true';
const LOG_EDIT_FLOW = LOG_SAVE_FLOW; // reuse same toggle for edit logs
const ENABLE_TAXONOMY_RPC = import.meta.env.VITE_ENABLE_TAXONOMY_RPC === 'true';

const logSaveFlow = (stage: string, data: any) => {
  if (!LOG_SAVE_FLOW) return;
  const logEntry = {
    timestamp: new Date().toISOString(),
    stage,
    environment: import.meta.env.MODE,
    ...data,
  };
  console.log(`[CONTENT_SAVE_FLOW:${stage}]`, logEntry);
};

const logEditFlow = (stage: string, data: any) => {
  if (!LOG_EDIT_FLOW) return;
  const logEntry = {
    timestamp: new Date().toISOString(),
    stage,
    environment: import.meta.env.MODE,
    ...data,
  };
  console.log(`[CONTENT_EDIT_FLOW:${stage}]`, logEntry);
};

// Optional service-role client for read-back verification (if key present)
function getServiceRoleClientOptional() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  try {
    return createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  } catch {
    return null;
  }
}

async function verifySavedRow(id: string) {
  if (!LOG_SAVE_FLOW) return;
  try {
    const svc = getServiceRoleClientOptional() || getSupabaseClient();
    if (!svc) return;
    const { data: row, error } = await svc
      .from('cnt_contents')
      .select('id,title,slug,content,metadata,author_name,updated_at,published_at,thumbnail_url,category,tags,content_url')
      .eq('id', id)
      .single();
    const metaType = typeof row?.metadata;
    console.log('[CONTENT_SAVE_FLOW:VERIFY_ROW]', {
      timestamp: new Date().toISOString(),
      id,
      ok: !error && !!row,
      error: error?.message,
      metaType,
      hasAuthorTitle: Boolean(row?.metadata?.author_title),
      hasAuthorBio: Boolean(row?.metadata?.author_bio),
      hasAuthorPhotoUrl: Boolean(row?.metadata?.author_photo_url),
      author_name: row?.author_name || null,
      hasContent: Boolean((row?.content || '').length),
    });

    const { data: vrow, error: vErr } = await svc
      .from('v_media_all')
      .select('id,type,domain,article_body_html,article_byline,article_source,published_at')
      .eq('id', id)
      .single();
    console.log('[CONTENT_SAVE_FLOW:VERIFY_VIEW]', {
      timestamp: new Date().toISOString(),
      id,
      ok: !vErr && !!vrow,
      error: vErr?.message,
      hasBodyHtml: Boolean(vrow?.article_body_html),
      article_byline: vrow?.article_byline || null,
      article_source: vrow?.article_source || null,
      type: vrow?.type,
      domain: vrow?.domain,
    });
  } catch (e: any) {
    console.log('[CONTENT_SAVE_FLOW:VERIFY_EXCEPTION]', { id, error: e?.message || String(e) });
  }
}

const parseFileSizeToMb = (value: string): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed
    .toLowerCase()
    .replace(/,/g, '')
    .match(/^([\d.]+)\s*(b|bytes|kb|kilobytes|mb|megabytes|gb|gigabytes|tb|terabytes)?$/i);

  if (!match) return null;

  const numeric = parseFloat(match[1]);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  const unit = (match[2] || 'mb').toLowerCase();
  const factor =
    unit === 'b' || unit === 'byte' || unit === 'bytes'
      ? 1 / (1024 * 1024)
      : unit === 'kb' || unit === 'kilobyte' || unit === 'kilobytes'
        ? 1 / 1024
        : unit === 'gb' || unit === 'gigabyte' || unit === 'gigabytes'
          ? 1024
          : unit === 'tb' || unit === 'terabyte' || unit === 'terabytes'
            ? 1024 * 1024
            : 1;

  const inMb = numeric * factor;
  if (!Number.isFinite(inMb) || inMb <= 0) return null;

  return Math.round(inMb * 100) / 100;
};

const formatBytesToLabel = (sizeInBytes?: number | null): string => {
  if (!sizeInBytes || sizeInBytes <= 0) return '';
  const mb = sizeInBytes / (1024 * 1024);
  if (mb >= 1) return `${Math.round(mb * 100) / 100} MB`;
  const kb = sizeInBytes / 1024;
  if (kb >= 1) return `${Math.round(kb * 100) / 100} KB`;
  return `${sizeInBytes} B`;
};

const deriveFileType = (fileName?: string, contentType?: string): string => {
  if (contentType && contentType.includes('/')) {
    const [type, subtype] = contentType.split('/');
    if (type && subtype) return `${type}/${subtype}`;
  }
  if (!fileName) return '';
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === fileName.length - 1) return '';
  return fileName.slice(dotIndex + 1).toLowerCase();
};

async function syncToolkitAuthors(
  supabaseClient: ReturnType<typeof getSupabaseClient>,
  contentId: string,
  authors: ToolkitAuthor[]
): Promise<ToolkitAuthor[]> {
  if (!supabaseClient) return authors || [];
  if (!Array.isArray(authors) || authors.length === 0) {
    try {
      await supabaseClient.from('cnt_content_authors').delete().eq('content_id', contentId);
    } catch (error) {
      console.warn('[ToolkitAuthors] Failed to clear existing authors', error);
    }
    return [];
  }

  const sanitizedAuthors = authors
    .filter((author) => author?.name && author.name.trim().length > 0)
    .map((author, index) => ({
      ...author,
      order: index,
    }));

  if (sanitizedAuthors.length === 0) {
    try {
      await supabaseClient.from('cnt_content_authors').delete().eq('content_id', contentId);
    } catch (error) {
      console.warn('[ToolkitAuthors] Failed to clear existing authors', error);
    }
    return [];
  }

  const upsertedAuthors: ToolkitAuthor[] = [];

  for (const author of sanitizedAuthors) {
    let profileId = author.profileId || null;
    const payload = {
      name: author.name,
      organization: author.organization || null,
      role: author.role || null,
      bio: author.bio || null,
      photo_url: author.photoUrl || null,
    };

    if (profileId) {
      const { error: updateError } = await supabaseClient
        .from('cnt_author_profiles')
        .update(payload)
        .eq('id', profileId);

      if (updateError) {
        console.warn('[ToolkitAuthors] Failed to update existing profile, creating new profile', updateError);
        profileId = null;
      }
    }

    if (!profileId) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('cnt_author_profiles')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) {
        console.error('[ToolkitAuthors] Failed to insert author profile', insertError);
        throw insertError;
      }

      profileId = inserted?.id || null;
    }

    upsertedAuthors.push({
      ...author,
      profileId,
    });
  }

  try {
    await supabaseClient.from('cnt_content_authors').delete().eq('content_id', contentId);
  } catch (error) {
    console.warn('[ToolkitAuthors] Failed to reset content author links', error);
  }

  const linkPayload = upsertedAuthors.map((author, index) => ({
    content_id: contentId,
    author_profile_id: author.profileId,
    is_primary: !!author.isPrimary,
    sort_order: index,
  }));

  if (linkPayload.length) {
    const { error: linkError } = await supabaseClient.from('cnt_content_authors').insert(linkPayload);
    if (linkError) {
      console.error('[ToolkitAuthors] Failed to insert content author links', linkError);
      throw linkError;
    }
  }

  return upsertedAuthors;
}

interface UseMediaContentFormControllerParams {
  routeContentId?: string;
  location: Location;
  navigate: NavigateFunction;
}

interface UseMediaContentFormControllerReturn {
  routeContentId?: string;
  isEditing: boolean;
  formData: MediaFormData;
  setFormData: React.Dispatch<React.SetStateAction<MediaFormData>>;
  editorHtml: string;
  setEditorState: (json: any, html: string) => void;
  resetEditorState: (html: string) => void;
  selectedStages: string[];
  toggleStage: (tag: string) => void;
  selectedFormat: string;
  toggleFormat: (format: string) => void;
  availableFormats: string[];
  categories: string[];
  catError: string;
  draftRestored: boolean;
  clearDraftAndReset: () => void;
  handleFieldChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setActiveTab: (key: TabKey) => void;
  videoUpload: UploadState;
  podcastUpload: UploadState;
  documentUpload: UploadState;
  handleVideoFileUpload: (file: File | null | undefined) => Promise<void>;
  clearVideoUpload: () => void;
  handlePodcastFileUpload: (file: File | null | undefined) => Promise<void>;
  clearPodcastUpload: () => void;
  handleDocumentUpload: (file: File | null | undefined) => Promise<void>;
  clearDocumentUpload: () => void;
  videoFileInputRef: React.RefObject<HTMLInputElement>;
  podcastFileInputRef: React.RefObject<HTMLInputElement>;
  docFileInputRef: React.RefObject<HTMLInputElement>;
  thumbnailUpload: UploadState;
  handleThumbnailUpload: (file: File | null | undefined) => Promise<void>;
  clearThumbnailUpload: () => void;
  thumbnailFileInputRef: React.RefObject<HTMLInputElement>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  validate: () => Promise<boolean>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  submitting: boolean;
  crudLoading: boolean;
  crudError: any;
  showSuccess: boolean;
  setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  errorModal: { show: boolean; message: string; error?: any };
  setErrorModal: React.Dispatch<React.SetStateAction<{ show: boolean; message: string; error?: any }>>;
  handleNavigateBack: () => void;
  tabs: { key: TabKey; label: string; description: string }[];
  STAGE_TAGS: string[];
  detectMediaTypeFromUrl: typeof detectMediaTypeFromUrl;
  getEmbedUrl: typeof getEmbedUrl;
  isEmbeddableUrl: typeof isEmbeddableUrl;
  isDirectVideoUrl: typeof isDirectVideoUrl;
  isDev: boolean;
  logSaveFlow: typeof logSaveFlow;
  handleSlugChange: (value: string) => void;
  regenerateSlug: () => void;
  setTags: (tags: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  setToolkitToc: (items: ToolkitTocItem[]) => void;
  setToolkitRequirements: (items: ToolkitRequirement[]) => void;
  setToolkitHighlights: (items: ToolkitHighlight[]) => void;
  setToolkitAttachments: (items: ToolkitAttachment[]) => void;
  setToolkitAuthors: (items: ToolkitAuthor[]) => void;
  setToolkitChangelog: (json: any, html: string) => void;
  lastSavedContentId: string | null;
}

export const useMediaContentFormController = ({
  routeContentId,
  location,
  navigate,
}: UseMediaContentFormControllerParams): UseMediaContentFormControllerReturn => {
  const isEditing = Boolean(routeContentId);
  const { getById, loading: crudLoading, error: crudError } = useCRUD<any>('cnt_contents');

  const [formData, setFormData] = useState<MediaFormData>(INITIAL_FORM_DATA);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [editorJson, setEditorJson] = useState<any>(null);
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const availableFormats = useMemo(
    () => MEDIA_TYPE_FORMAT_MAPPING[formData.activeTab] || [],
    [formData.activeTab]
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [catError, setCatError] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; error?: any }>({
    show: false,
    message: '',
  });
  const [lastSavedContentId, setLastSavedContentId] = useState<string | null>(null);

  const [videoUpload, setVideoUpload] = useState<UploadState>({ uploadedUrl: '', uploading: false, error: '' });
  const [podcastUpload, setPodcastUpload] = useState<UploadState>({ uploadedUrl: '', uploading: false, error: '' });
  const [documentUpload, setDocumentUpload] = useState<UploadState>({ uploadedUrl: '', uploading: false, error: '' });
  const [thumbnailUpload, setThumbnailUpload] = useState<UploadState>({ uploadedUrl: '', uploading: false, error: '' });

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const podcastFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedRef = useRef(false);
  const prevRouteContentIdRef = useRef<string | undefined>(undefined);
  const draftRestoredRef = useRef(false);

  const handleThumbnailUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setThumbnailUpload((previous) => ({ ...previous, uploading: true, error: '' }));
      try {
        const { publicUrl } = await uploadFile({ file, dir: 'thumbnails' });
        setThumbnailUpload({
          uploadedUrl: publicUrl,
          uploading: false,
          error: '',
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type,
        });
        setFormData((prev) => ({
          ...prev,
          featuredImage: publicUrl,
        }));
        if (thumbnailFileInputRef.current) {
          thumbnailFileInputRef.current.value = '';
        }
      } catch (error: any) {
        setThumbnailUpload((previous) => ({
          ...previous,
          uploading: false,
          error: error?.message || 'Upload failed',
        }));
      }
    },
    []
  );

  const clearThumbnailUpload = useCallback(() => {
    setThumbnailUpload({ uploadedUrl: '', uploading: false, error: '' });
    setFormData((prev) => ({ ...prev, featuredImage: '' }));
    if (thumbnailFileInputRef.current) {
      thumbnailFileInputRef.current.value = '';
    }
  }, []);

  const handleVideoFileUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('video/')) {
        setVideoUpload((previous) => ({ ...previous, error: 'Please select a valid video file' }));
        if (videoFileInputRef.current) {
          videoFileInputRef.current.value = '';
        }
        return;
      }
      setVideoUpload((previous) => ({ ...previous, uploading: true, error: '' }));
      try {
        const { publicUrl } = await uploadFile({ file, dir: 'video' });
        setVideoUpload({ uploadedUrl: publicUrl, uploading: false, error: '' });
        setFormData((prev) => ({ ...prev, videoUrl: publicUrl }));
        if (videoFileInputRef.current) {
          videoFileInputRef.current.value = '';
        }
      } catch (error: any) {
        setVideoUpload((previous) => ({
          ...previous,
          uploading: false,
          error: error?.message || 'Upload failed',
        }));
      }
    },
    []
  );

  const handleSlugChange = useCallback(
    (value: string) => {
      setSlugManuallyEdited(true);
      const sanitized = generateSlug(value);
      setFormData((previous) => ({ ...previous, slug: sanitized }));
      if (errors.slug) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.slug;
          return next;
        });
      }
    },
    [errors.slug]
  );

  const regenerateSlug = useCallback(() => {
    setSlugManuallyEdited(false);
    setFormData((previous) => ({ ...previous, slug: generateSlug(previous.title) }));
    setErrors((prev) => {
      if (!prev.slug) return prev;
      const next = { ...prev };
      delete next.slug;
      return next;
    });
  }, []);

  const setTags = useCallback((nextTags: string[]) => {
    setFormData((previous) => ({ ...previous, tags: nextTags }));
  }, []);

  const setSelectedCategories = useCallback((nextCategories: string[]) => {
    setFormData((previous) => ({
      ...previous,
      categories: nextCategories,
      category: nextCategories[0] || '',
    }));
    setErrors((prev) => {
      if (!prev.categories) return prev;
      const next = { ...prev };
      delete next.categories;
      return next;
    });
  }, []);

  const setToolkitToc = useCallback((items: ToolkitTocItem[]) => {
    setFormData((previous) => ({ ...previous, toolkitToc: items }));
  }, []);

  const setToolkitRequirements = useCallback((items: ToolkitRequirement[]) => {
    setFormData((previous) => ({ ...previous, toolkitRequirements: items }));
  }, []);

  const setToolkitHighlights = useCallback((items: ToolkitHighlight[]) => {
    setFormData((previous) => ({ ...previous, toolkitHighlights: items }));
  }, []);

  const setToolkitAttachments = useCallback((items: ToolkitAttachment[]) => {
    setFormData((previous) => ({ ...previous, toolkitAttachments: items }));
  }, []);

  const setToolkitAuthors = useCallback((items: ToolkitAuthor[]) => {
    setFormData((previous) => {
      if (previous.activeTab !== 'Toolkit') {
        return { ...previous, toolkitAuthors: items };
      }
      const primary = items.find((author) => author.isPrimary) || items[0];
      return {
        ...previous,
        toolkitAuthors: items,
        authorName: primary?.name || previous.authorName,
        authorOrg: primary?.organization || previous.authorOrg,
        authorTitle: primary?.role || previous.authorTitle,
        authorPhotoUrl: primary?.photoUrl || previous.authorPhotoUrl,
        authorBio: primary?.bio || previous.authorBio,
      };
    });
  }, []);

  const setToolkitChangelog = useCallback((json: any, html: string) => {
    setFormData((previous) => ({
      ...previous,
      toolkitChangelogJson: json,
      toolkitChangelogHtml: html,
    }));
  }, []);

  const clearVideoUpload = useCallback(() => {
    setVideoUpload({ uploadedUrl: '', uploading: false, error: '' });
    setFormData((prev) => ({ ...prev, videoUrl: '' }));
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
  }, []);

  const handlePodcastFileUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        setPodcastUpload((previous) => ({
          ...previous,
          error: 'Please select a valid audio or video file',
        }));
        if (podcastFileInputRef.current) {
          podcastFileInputRef.current.value = '';
        }
        return;
      }
      setPodcastUpload((previous) => ({ ...previous, uploading: true, error: '' }));
      try {
        const { publicUrl } = await uploadFile({ file, dir: 'podcast' });
        const isVideo = file.type.startsWith('video/');
        setPodcastUpload({ uploadedUrl: publicUrl, uploading: false, error: '' });
        setFormData((prev) => ({
          ...prev,
          podcastUrl: publicUrl,
          isVideoEpisode: isVideo,
        }));
        if (podcastFileInputRef.current) {
          podcastFileInputRef.current.value = '';
        }
      } catch (error: any) {
        setPodcastUpload((previous) => ({
          ...previous,
          uploading: false,
          error: error?.message || 'Upload failed',
        }));
      }
    },
    []
  );

  const clearPodcastUpload = useCallback(() => {
    setPodcastUpload({ uploadedUrl: '', uploading: false, error: '' });
    setFormData((prev) => ({ ...prev, podcastUrl: '' }));
    if (podcastFileInputRef.current) {
      podcastFileInputRef.current.value = '';
    }
  }, []);

  const handleDocumentUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setDocumentUpload((previous) => ({ ...previous, uploading: true, error: '' }));
      try {
        const { publicUrl } = await uploadFile({ file, dir: 'report' });
        setDocumentUpload({
          uploadedUrl: publicUrl,
          uploading: false,
          error: '',
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type,
        });
        const fileSizeLabel = formatBytesToLabel(file.size);
        const fileType = deriveFileType(file.name, file.type);
        setFormData((prev) => ({
          ...prev,
          downloadUrl: publicUrl,
          fileSize: fileSizeLabel,
          toolkitFileType: fileType || prev.toolkitFileType,
        }));
        setErrors((prev) => {
          if (!prev.downloadUrl && !prev.toolkitFileType) return prev;
          const next = { ...prev };
          if (next.downloadUrl) delete next.downloadUrl;
          if (fileType && next.toolkitFileType) delete next.toolkitFileType;
          return next;
        });
        if (docFileInputRef.current) {
          docFileInputRef.current.value = '';
        }
      } catch (error: any) {
        setDocumentUpload((previous) => ({
          ...previous,
          uploading: false,
          error: error?.message || 'Upload failed',
        }));
      }
    },
    []
  );

  const clearDocumentUpload = useCallback(() => {
    setDocumentUpload({ uploadedUrl: '', uploading: false, error: '' });
    setFormData((prev) => ({ ...prev, downloadUrl: '', fileSize: '', toolkitFileType: '' }));
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
    }
  }, []);

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = event.target as any;
      if (name === 'title') {
        const slug = generateSlug(value);
        setFormData((previous) => ({
          ...previous,
          title: value,
          slug: slugManuallyEdited ? previous.slug || slug : slug,
        }));
        return;
      }
      if (name === 'featuredImage') {
        setFormData((previous) => ({ ...previous, featuredImage: value }));
        if (!value) {
          setThumbnailUpload({ uploadedUrl: '', uploading: false, error: '' });
        }
        if (errors.featuredImage) {
          setErrors((prevErrors) => {
            const next = { ...prevErrors };
            delete next.featuredImage;
            return next;
          });
        }
        return;
      }
      if (name === 'podcastUrl' && value && !podcastUpload.uploadedUrl) {
        const mediaType = detectMediaTypeFromUrl(value);
        setFormData((previous) => ({
          ...previous,
          podcastUrl: value,
          isVideoEpisode: mediaType === 'video',
        }));
        return;
      }
      if (name === 'videoUrl' && value && !videoUpload.uploadedUrl) {
        setFormData((previous) => ({ ...previous, videoUrl: value }));
        return;
      }
      setFormData((previous) => ({
        ...previous,
        [name]: type === 'checkbox' ? !!checked : value,
      }));
      if (errors[name]) {
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          delete next[name];
          return next;
        });
      }
    },
    [errors, podcastUpload.uploadedUrl, slugManuallyEdited, videoUpload.uploadedUrl]
  );

  const setActiveTab = useCallback(
    (key: TabKey) => {
      if (isEditing) return;
      setFormData((previous) => ({
        ...previous,
        activeTab: key,
        status: key === 'Guide' ? 'Approved' : 'Draft',
      }));
    },
    [isEditing]
  );

  const toggleStage = useCallback((tag: string) => {
    setSelectedStages((previous) => {
      const next = previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag];
      setFormData((prev) => ({ ...prev, businessStages: next }));
      if (next.length > 0) {
        setErrors((prev) => {
          if (!prev.businessStages) return prev;
          const updated = { ...prev };
          delete updated.businessStages;
          return updated;
        });
      }
      return next;
    });
  }, []);

  const toggleFormat = useCallback((format: string) => {
    setSelectedFormat((previous) => {
      const next = previous === format ? '' : format;
      setFormData((prev) => ({ ...prev, format: next }));
      return next;
    });
  }, []);

  const setEditorState = useCallback((json: any, html: string) => {
    setEditorJson(json);
    setEditorHtml(html);
    if (errors.content) {
      setErrors(({ content, ...rest }) => rest);
    }
  }, [errors.content]);

  const resetEditorState = useCallback((html: string) => {
    setEditorJson(null);
    setEditorHtml(html);
  }, []);

  const clearDraftAndReset = useCallback(() => {
    removeDraft();
    setDraftRestored(false);
    setFormData(INITIAL_FORM_DATA);
    setEditorHtml('');
    setEditorJson(null);
    setSelectedStages([]);
    setSelectedFormat('');
    setVideoUpload({ uploadedUrl: '', uploading: false, error: '' });
    setPodcastUpload({ uploadedUrl: '', uploading: false, error: '' });
    setDocumentUpload({ uploadedUrl: '', uploading: false, error: '' });
    setThumbnailUpload({ uploadedUrl: '', uploading: false, error: '' });
    setErrors({});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await setSupabaseSession();
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const facetCodePreference = Array.from(CATEGORY_FACET_CODES);

        const { data: facetCandidates, error: facetError } = await supabase
          .from('txn_facets')
          .select('id, code')
          .in('code', facetCodePreference)
          .eq('is_private', false);

        if (facetError) throw facetError;

        const selectedFacet =
          facetCodePreference.map((code) => facetCandidates?.find((facet: any) => facet.code === code)).find(
            Boolean
          ) || null;

        if (!selectedFacet) {
          setCategories(DEFAULT_CATEGORIES);
          setCatError('No public taxonomy facet available for categories; showing defaults');
          return;
        }

        const { data: facetValues, error: valuesError } = await supabase
          .from('txn_facet_values')
          .select('id, txn_facet_value_translations!inner(name, language_code)')
          .eq('facet_id', selectedFacet.id)
          .eq('txn_facet_value_translations.language_code', 'en')
          .order('code');

        if (valuesError) throw valuesError;

        const labels = Array.from(
          new Set(
            (facetValues || [])
              .flatMap((value: any) => value?.txn_facet_value_translations || [])
              .filter((translation: any) => translation?.language_code === 'en' && translation?.name)
              .map((translation: any) => translation.name as string)
          )
        ).sort((a: string, b: string) => a.localeCompare(b));

        if (labels.length > 0) {
          setCategories(labels);
          setCatError('');
        } else {
          setCategories(DEFAULT_CATEGORIES);
          setCatError('No taxonomy labels available; showing defaults');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(DEFAULT_CATEGORIES);
        setCatError('Could not load categories; showing defaults');
      }
    })();
  }, []);

  useEffect(() => {
    if (isEditing || draftRestoredRef.current) return;
    const stateContent = (location.state as any)?.content;
    if (stateContent) return;
    const draft = loadDraft();
    if (!draft) return;

    if (draft.formData) setFormData((prev) => ({ ...prev, ...draft.formData }));
    if (typeof draft.editorHtml === 'string') setEditorHtml(draft.editorHtml);
    if (draft.editorJson) setEditorJson(draft.editorJson);
    if (Array.isArray(draft.selectedStages)) setSelectedStages(draft.selectedStages);
    if (typeof draft.selectedFormat === 'string') setSelectedFormat(draft.selectedFormat);
    if (typeof draft.videoUploadedUrl === 'string') setVideoUpload((prev) => ({ ...prev, uploadedUrl: draft.videoUploadedUrl }));
    if (typeof draft.podcastUploadedUrl === 'string') setPodcastUpload((prev) => ({ ...prev, uploadedUrl: draft.podcastUploadedUrl }));
    if (typeof draft.docUploadedUrl === 'string') setDocumentUpload((prev) => ({ ...prev, uploadedUrl: draft.docUploadedUrl }));
    if (typeof draft.thumbnailUploadedUrl === 'string')
      setThumbnailUpload((prev) => ({ ...prev, uploadedUrl: draft.thumbnailUploadedUrl }));
    setDraftRestored(true);
    draftRestoredRef.current = true;
  }, [isEditing, location.state]);

  useEffect(() => {
    if (isEditing) return;
    const uploads = [videoUpload.uploadedUrl, podcastUpload.uploadedUrl, documentUpload.uploadedUrl, thumbnailUpload.uploadedUrl];
    const shouldPersist = hasDraftContent(formData, editorHtml, selectedStages, uploads);
    const timer = window.setTimeout(() => {
      if (!shouldPersist) {
        removeDraft();
        return;
      }
      const payload = {
        formData,
        editorHtml,
        editorJson,
        selectedStages,
        selectedFormat,
        videoUploadedUrl: videoUpload.uploadedUrl,
        podcastUploadedUrl: podcastUpload.uploadedUrl,
        docUploadedUrl: documentUpload.uploadedUrl,
        thumbnailUploadedUrl: thumbnailUpload.uploadedUrl,
        _ts: Date.now(),
      };
      saveDraft(payload);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    isEditing,
    formData,
    editorHtml,
    editorJson,
    selectedStages,
    selectedFormat,
    videoUpload.uploadedUrl,
    podcastUpload.uploadedUrl,
    documentUpload.uploadedUrl,
    thumbnailUpload.uploadedUrl,
  ]);

  useEffect(() => {
    if (isEditing) return;
    return () => {
      const uploads = [videoUpload.uploadedUrl, podcastUpload.uploadedUrl, documentUpload.uploadedUrl, thumbnailUpload.uploadedUrl];
      if (!hasDraftContent(formData, editorHtml, selectedStages, uploads)) {
        removeDraft();
        return;
      }
      const payload = {
        formData,
        editorHtml,
        editorJson,
        selectedStages,
        selectedFormat,
        videoUploadedUrl: videoUpload.uploadedUrl,
        podcastUploadedUrl: podcastUpload.uploadedUrl,
        docUploadedUrl: documentUpload.uploadedUrl,
        thumbnailUploadedUrl: thumbnailUpload.uploadedUrl,
        _ts: Date.now(),
      };
      saveDraft(payload);
    };
  }, [
    isEditing,
    formData,
    editorHtml,
    editorJson,
    selectedStages,
    selectedFormat,
    videoUpload.uploadedUrl,
    podcastUpload.uploadedUrl,
    documentUpload.uploadedUrl,
    thumbnailUpload.uploadedUrl,
  ]);

  const fetchAndPrefill = useCallback(
    async (content: any) => {
      const supabase = getSupabaseClient();
      let record = content;
      let facetValues: any[] = [];
      let tags: any[] = [];

      const formatDurationFromSeconds = (seconds: number | null | undefined): string => {
        if (!seconds || seconds <= 0) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      if (routeContentId && supabase) {
        // Ensure RLS claims are set for this session before fetching
        try { await setSupabaseSession(); } catch { }
        logEditFlow('PREFILL_START', {
          routeContentId,
          supabaseUrl: (supabase as any)?.supabaseUrl || (import.meta.env.VITE_SUPABASE_URL || 'n/a'),
          enableTaxonomyRpc: ENABLE_TAXONOMY_RPC,
        });
        try {
          logEditFlow('FETCH_CNT_START', { id: routeContentId });
          const { data: freshData, error: baseError } = await supabase
            .from('cnt_contents')
            .select('*, metadata')
            .eq('id', routeContentId)
            .single();
          logEditFlow('FETCH_CNT_RESULT', {
            id: routeContentId,
            ok: !baseError && !!freshData,
            error: baseError?.message,
            metaType: typeof freshData?.metadata,
          });

          logEditFlow('FETCH_VIEW_START', { id: routeContentId });
          const { data: viewData, error: viewError } = await supabase
            .from('v_media_all')
            .select(`
              slug,
              article_body_html,
              article_byline,
              article_source,
              video_url,
              video_duration_sec,
              audio_url,
              episode_no,
              is_video_episode,
              report_document_url,
              report_file_size_mb,
              tool_document_url,
              tool_file_size_mb,
              type,
              domain,
              authors,
              author_slugs
            `)
            .eq('id', routeContentId)
            .single();
          logEditFlow('FETCH_VIEW_RESULT', {
            id: routeContentId,
            ok: !viewError && !!viewData,
            error: viewError?.message,
            hasBodyHtml: Boolean(viewData?.article_body_html),
            type: viewData?.type,
            domain: viewData?.domain,
          });
          if (ENABLE_TAXONOMY_RPC) {
            try {
              logEditFlow('RPC_FACETS_START', { id: routeContentId });
              const { data: facetData, error: facetErr } = await supabase.rpc('get_content_facet_values', {
                content_id: routeContentId,
                language_code: 'en',
              });
              if (!facetErr && Array.isArray(facetData)) facetValues = facetData;
              logEditFlow('RPC_FACETS_RESULT', { id: routeContentId, ok: !facetErr, count: facetValues.length, error: facetErr?.message });
            } catch (taxonomyError) {
              logEditFlow('RPC_FACETS_ERROR', { id: routeContentId, error: taxonomyError?.message || String(taxonomyError) });
            }

            try {
              logEditFlow('RPC_TAGS_START', { id: routeContentId });
              const { data: tagData, error: tagErr } = await supabase.rpc('get_content_tags', {
                content_id: routeContentId,
              });
              if (!tagErr && Array.isArray(tagData)) tags = tagData;
              logEditFlow('RPC_TAGS_RESULT', { id: routeContentId, ok: !tagErr, count: tags.length, error: tagErr?.message });
            } catch (tagError) {
              logEditFlow('RPC_TAGS_ERROR', { id: routeContentId, error: tagError?.message || String(tagError) });
            }
          } else {
            logEditFlow('RPC_DISABLED', { reason: 'VITE_ENABLE_TAXONOMY_RPC is not true' });
          }

          if (!baseError && freshData) {
            record = freshData;
            if (!viewError && viewData) {
              if (viewData.article_body_html) record.content = viewData.article_body_html;
              if (viewData.article_byline && !record.author_name) record.author_name = viewData.article_byline;
              if (viewData.article_source && !(record.metadata as any)?.author_org) {
                record.metadata = record.metadata || {};
                (record.metadata as any).author_org = viewData.article_source;
              }
              if (viewData.slug) record.slug = viewData.slug;
              if (viewData.type) record.type = viewData.type;
              if (viewData.video_url) record.video_url = viewData.video_url;
              if (viewData.video_duration_sec !== null && viewData.video_duration_sec !== undefined) {
                record.video_duration_sec = viewData.video_duration_sec;
              }
              if (viewData.audio_url) record.audio_url = viewData.audio_url;
              if (viewData.episode_no !== null && viewData.episode_no !== undefined) {
                record.episode_no = viewData.episode_no;
              }
              if (viewData.is_video_episode !== null && viewData.is_video_episode !== undefined) {
                record.is_video_episode = viewData.is_video_episode;
              }
              if (viewData.report_document_url) record.report_document_url = viewData.report_document_url;
              if (viewData.report_file_size_mb !== null && viewData.report_file_size_mb !== undefined) {
                record.report_file_size_mb = viewData.report_file_size_mb;
              }
              if (viewData.tool_document_url) record.tool_document_url = viewData.tool_document_url;
              if (viewData.tool_file_size_mb !== null && viewData.tool_file_size_mb !== undefined) {
                record.tool_file_size_mb = viewData.tool_file_size_mb;
              }
              if (viewData.authors) record.authors = viewData.authors;
              if (viewData.author_slugs) record.author_slugs = viewData.author_slugs;
              if (viewData.domain) record.domain = viewData.domain;
            }
            record._facetValues = facetValues;
            record._tags = tags;
          } else {
            // Not found in primary DB, try secondary guides
            logEditFlow('PRIMARY_FETCH_FAILED', { id: routeContentId, error: baseError?.message });
            const guide = await getGuideById(routeContentId);
            if (guide) {
              console.log('✅ Found guide in secondary DB:', guide);
              record = {
                ...guide,
                content: guide.body,
                featured_image_url: guide.hero_image_url,
                published_at: guide.last_updated_at,
                author_name: guide.author_name,
                author_org: guide.author_org,
                metadata: {
                  author_org: guide.author_org,
                }
              };
            }
          }
        } catch (error) {
          logEditFlow('FETCH_ERROR', { id: routeContentId, error: (error as any)?.message || String(error) });
          console.warn('Exception during fetch, trying secondary guides:', error);

          const guide = await getGuideById(routeContentId);
          if (guide) {
            record = {
              ...guide,
              content: guide.body,
              featured_image_url: guide.hero_image_url,
              published_at: guide.last_updated_at,
              author_name: guide.author_name,
              author_org: guide.author_org,
              metadata: {
                author_org: guide.author_org,
              }
            };
          }
        }
      }

      // Normalize metadata: it may arrive as a JSON string depending on environment
      const rawMeta = (record?.metadata as any) ?? {};
      let metadata: any = {};
      if (typeof rawMeta === 'string') {
        try {
          metadata = JSON.parse(rawMeta);
        } catch {
          metadata = {};
        }
      } else {
        metadata = rawMeta || {};
      }
      const toolkitMeta = (metadata?.toolkit as any) || {};
      const contentType = record?.type || record?.content_type || 'Article';
      const activeTab: TabKey = (contentType === 'Video'
        ? 'Video'
        : contentType === 'Podcast'
          ? 'Podcast'
          : contentType === 'Report'
            ? 'Report'
            : contentType === 'Tool'
              ? 'Toolkit'
              : contentType === 'News'
                ? 'News'
                : contentType === 'Guide'
                  ? 'Guide'
                  : 'Article');

      let domainValue = record?.domain || record?.category || '';
      if (record?._facetValues && Array.isArray(record._facetValues)) {
        const domainFacet = record._facetValues.find((facet: any) => facet.facet_code === 'domain');
        if (domainFacet?.facet_value_name) {
          domainValue = domainFacet.facet_value_name;
        }
      }

      const categoriesFromMeta = Array.isArray(toolkitMeta.categories)
        ? toolkitMeta.categories
        : domainValue
          ? [domainValue]
          : [];
      const businessStagesFromMeta: string[] = Array.isArray(toolkitMeta.businessStages)
        ? toolkitMeta.businessStages
        : [];
      const tagsFromMeta: string[] = Array.isArray(toolkitMeta.tags) ? toolkitMeta.tags : [];
      const releaseDateValue =
        typeof toolkitMeta.releaseDate === 'string' && toolkitMeta.releaseDate
          ? (() => {
            try {
              return new Date(toolkitMeta.releaseDate).toISOString().slice(0, 10);
            } catch {
              return toolkitMeta.releaseDate;
            }
          })()
          : '';

      const rawTags: string[] = [];
      if (Array.isArray(record?.tags)) rawTags.push(...record.tags);
      if (record?._tags && Array.isArray(record._tags)) {
        rawTags.push(...record._tags.map((tag: any) => tag.tag_value || tag.tag_name || String(tag)));
      }
      const nonStageTagsFromRecord = rawTags.filter((tag) => !STAGE_TAGS.includes(tag));

      const updates = {
        title: record?.title || '',
        slug: record?.slug || '',
        status: record?.status || (activeTab === 'Guide' ? 'Approved' : 'Draft'),
        activeTab,
        summary: record?.summary || '',
        content: record?.body || record?.content || '',
        authorName: record?.author_name || record?.author || metadata.author_name || '',
        authorOrg: metadata.author_org || metadata.source || record?.article_source || '',
        authorTitle: metadata.author_title || '',
        authorBio: metadata.author_bio || '',
        authorPhotoUrl: metadata.author_photo_url || '',
        category: domainValue,
        publishDate: record?.published_at ? new Date(record.published_at).toISOString().slice(0, 10) : '',
        featuredImage: record?.featuredImage || record?.featured_image_url || record?.thumbnail_url || '',
        videoUrl: record?.video_url || '',
        duration: record?.video_duration_sec
          ? formatDurationFromSeconds(record.video_duration_sec)
          : record?.duration || '',
        podcastUrl: record?.audio_url || '',
        episodeNumber: record?.episode_no ? String(record.episode_no) : '',
        isVideoEpisode: record?.is_video_episode || false,
        downloadUrl: record?.report_document_url || record?.tool_document_url || '',
        fileSize:
          record?.report_file_size_mb || record?.tool_file_size_mb
            ? `${record.report_file_size_mb || record.tool_file_size_mb} MB`
            : '',
        tags: tagsFromMeta.length ? tagsFromMeta : nonStageTagsFromRecord,
        categories: categoriesFromMeta,
        businessStages: businessStagesFromMeta,
        format: typeof toolkitMeta.format === 'string' ? toolkitMeta.format : '',
        toolkitToc: Array.isArray(toolkitMeta.toc) ? (toolkitMeta.toc as ToolkitTocItem[]) : [],
        toolkitRequirements: Array.isArray(toolkitMeta.requirements)
          ? (toolkitMeta.requirements as ToolkitRequirement[])
          : [],
        toolkitHighlights: Array.isArray(toolkitMeta.highlights)
          ? (toolkitMeta.highlights as ToolkitHighlight[])
          : [],
        toolkitVersion: typeof toolkitMeta.version === 'string' ? toolkitMeta.version : '',
        toolkitReleaseDate: releaseDateValue,
        toolkitChangelogHtml: typeof toolkitMeta.changelogHtml === 'string' ? toolkitMeta.changelogHtml : '',
        toolkitChangelogJson: toolkitMeta.changelogJson || null,
        toolkitFileType: typeof toolkitMeta.fileType === 'string' ? toolkitMeta.fileType : '',
        toolkitAttachments: Array.isArray(toolkitMeta.attachments)
          ? (toolkitMeta.attachments as ToolkitAttachment[])
          : [],
        toolkitAuthors: Array.isArray(toolkitMeta.authors)
          ? (toolkitMeta.authors as ToolkitAuthor[])
          : [],
        // Guide specific fields
        guide_type: record?.guide_type || '',
        function_area: record?.function_area || '',
        complexity_level: record?.complexity_level || '',
        sub_domain: record?.sub_domain || '',
        unit: record?.unit || '',
        location: record?.location || '',
        isEditorsPick: !!record?.is_editors_pick,
        downloadCount: record?.download_count || 0,
        downloadUrl: record?.document_url || record?.report_document_url || record?.tool_document_url || '',
      } as const;
      logEditFlow('SET_FORM_DATA', {
        id: routeContentId,
        activeTab: updates.activeTab,
        hasContent: Boolean((updates.content || '').length),
        authorName: updates.authorName,
        authorOrg: updates.authorOrg,
        hasAuthorTitle: Boolean(updates.authorTitle),
        hasAuthorBio: Boolean(updates.authorBio),
        hasAuthorPhotoUrl: Boolean(updates.authorPhotoUrl),
      });
      setFormData((prev) => ({ ...prev, ...updates }));

      setEditorHtml(updates.content || '');
      setEditorJson(null);

      const dedupedTags = Array.from(new Set([...tagsFromMeta, ...rawTags]));
      const stageSelection = businessStagesFromMeta.length
        ? businessStagesFromMeta
        : dedupedTags.filter((tag) => STAGE_TAGS.includes(tag));
      setSelectedStages(stageSelection);

      if (record?._facetValues && Array.isArray(record._facetValues)) {
        const formatFacet = record._facetValues.find((facet: any) => facet.facet_code === 'format');
        if (formatFacet?.facet_value_name && !updates.format) {
          setSelectedFormat(formatFacet.facet_value_name);
        }
      }
      if (updates.format) {
        setSelectedFormat(updates.format);
      }
    },
    [routeContentId]
  );

  useEffect(() => {
    const stateContent = (location.state as any)?.content;

    // Reset fetch ref if routeContentId changes
    if (prevRouteContentIdRef.current !== routeContentId) {
      hasFetchedRef.current = false;
      prevRouteContentIdRef.current = routeContentId;
    }

    if (routeContentId && !hasFetchedRef.current) {
      (async () => {
        hasFetchedRef.current = true;
        const record = await getById(routeContentId);
        if (record) {
          await fetchAndPrefill(record);
        } else if (stateContent) {
          await fetchAndPrefill(stateContent);
        } else {
          await fetchAndPrefill({ id: routeContentId });
        }
      })();
    } else if (stateContent && !routeContentId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAndPrefill(stateContent);
    }
  }, [fetchAndPrefill, getById, location.pathname, routeContentId]);

  const validate = useCallback(async (): Promise<boolean> => {
    const next: ValidationErrors = {};
    if (!formData.title.trim()) next.title = 'Title is required';
    if (!formData.summary.trim()) next.summary = 'Summary is required';

    if (!routeContentId && !formData.authorName.trim()) {
      next.authorName = 'Author Name is required';
    }
    if (formData.authorPhotoUrl && !isValidUrl(formData.authorPhotoUrl)) {
      next.authorPhotoUrl = 'Provide a valid URL';
    }
    if (!routeContentId && !formData.featuredImage.trim()) {
      next.featuredImage = 'Featured image URL is required';
    }
    if (formData.featuredImage && !isValidUrl(formData.featuredImage)) {
      next.featuredImage = 'Provide a valid URL';
    }
    if (['Article', 'News', 'Guide', 'Toolkit'].includes(formData.activeTab)) {
      const html = editorHtml || '';
      const text = html.replace(/<[^>]+>/g, '').trim();
      if (!text) next.content = 'Body is required';
    }
    if (formData.activeTab === 'Video') {
      if (!videoUpload.uploadedUrl && !isValidUrl(formData.videoUrl)) next.videoUrl = 'Valid video URL is required';
      if (!isValidDuration(formData.duration)) next.duration = 'Duration must be mm:ss or hh:mm:ss';
    }
    if (formData.activeTab === 'Podcast') {
      if (!podcastUpload.uploadedUrl && !isValidUrl(formData.podcastUrl)) next.podcastUrl = 'Valid podcast URL is required';
      if (!isNumeric(formData.episodeNumber)) next.episodeNumber = 'Episode must be a number';
    }
    if (formData.activeTab === 'Report' || formData.activeTab === 'Toolkit') {
      if (!documentUpload.uploadedUrl && !isValidUrl(formData.downloadUrl)) {
        next.downloadUrl = 'Valid download URL is required';
      }
    }
    if (formData.activeTab === 'Toolkit') {
      if (!formData.categories.length) {
        next.categories = 'Select at least one category';
      }
      if (selectedStages.length === 0) {
        next.businessStages = 'Select at least one business stage';
      }
      if (!formData.toolkitFileType?.trim()) {
        next.toolkitFileType = 'Specify the file type (e.g., pdf, docx)';
      }
    }

    if (!routeContentId && formData.slug) {
      try {
        const slugExists = await checkSlugExists(formData.slug, formData.activeTab === 'Guide');
        if (slugExists) {
          next.slug = 'This slug already exists. Please use a different title.';
        }
      } catch (error) {
        console.error('Error checking slug:', error);
      }
    }

    setErrors(next);
    const ok = Object.keys(next).length === 0;
    if (!ok) {
      console.log('Validation errors:', next);
      scrollToFirstError(next);
    }
    return ok;
  }, [
    documentUpload.uploadedUrl,
    editorHtml,
    formData,
    podcastUpload.uploadedUrl,
    routeContentId,
    videoUpload.uploadedUrl,
    selectedStages,
  ]);

  const handleNavigateBack = useCallback(() => {
    if (routeContentId) {
      sessionStorage.setItem('content-refresh-required', routeContentId);
      sessionStorage.setItem('content-refresh-timestamp', Date.now().toString());
    }
    const path = formData.activeTab === 'Guide' ? '/knowledgehub-management' : '/media-management';
    navigate(path);
  }, [navigate, routeContentId, formData.activeTab]);

  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();

      logSaveFlow('SUBMIT_START', {
        routeContentId,
        isEditing,
        payloadHash: btoa(
          JSON.stringify({ title: formData.title, authorName: formData.authorName })
        ).slice(0, 16),
      });

      setSubmitting(true);
      console.log('Validating form...');
      const isValid = await validate();
      if (!isValid) {
        console.log('Validation failed, stopping submission');
        setSubmitting(false);
        return;
      }

      console.log('Validation passed, proceeding with', routeContentId ? 'update' : 'create');

      if (formData.activeTab === 'Guide') {
        try {
          const supabase2 = getServiceRoleClient2() || getSupabaseClient2();
          if (!supabase2) throw new Error('Secondary Supabase client not available');

          const guidePayload = {
            slug: formData.slug,
            title: formData.title,
            summary: formData.summary,
            hero_image_url: formData.featuredImage,
            status: formData.status || 'Approved',
            author_name: formData.authorName,
            author_org: formData.authorOrg,
            is_editors_pick: formData.isEditorsPick,
            domain: formData.category || formData.categories[0] || null,
            guide_type: formData.guide_type || null,
            function_area: formData.function_area || null,
            complexity_level: formData.complexity_level || null,
            body: editorHtml || null,
            document_url: formData.downloadUrl || documentUpload.uploadedUrl || null,
            sub_domain: formData.sub_domain || null,
            unit: formData.unit || null,
            location: formData.location || null,
          };

          let id = routeContentId;

          if (isEditing && id) {
            const { error: updateError } = await supabase2
              .from('guides')
              .update(guidePayload)
              .eq('id', id);
            if (updateError) throw updateError;
            console.log('✅ Guide updated in secondary DB');
          } else {
            const { data: insertData, error: insertError } = await supabase2
              .from('guides')
              .insert([guidePayload])
              .select('id')
              .single();
            if (insertError) throw insertError;
            id = insertData.id;
            console.log('✅ Guide created in secondary DB', id);
          }

          setLastSavedContentId(id);
          setSubmitting(false);
          setShowSuccess(true);

          // Clear draft if it was a new creation
          if (!isEditing) {
            removeDraft();
            setDraftRestored(false);
          }

          // Optional: re-fetch or prefill
          if (id) {
            // Need a way to fetch back from secondary DB in fetchAndPrefill
            // For now just stay on the success state
          }

          return;
        } catch (guideError: any) {
          console.error('❌ Failed to save guide to secondary DB:', guideError);
          setSubmitting(false);
          setErrorModal({
            show: true,
            message: routeContentId ? 'Guide update failed' : 'Guide creation failed',
            error: guideError,
          });
          return;
        }
      }

      try {
        await setSupabaseSession();

        const buildBasePayload = async (status: string, publishedAt: string | null) => ({
          slug: formData.slug || null,
          title: formData.title,
          summary: formData.summary || null,
          status,
          visibility: 'Public',
          language: 'en',
          published_at: publishedAt,
          thumbnail_url: formData.featuredImage || null,
          tags:
            formData.activeTab === 'Toolkit'
              ? formData.tags && formData.tags.length > 0
                ? formData.tags
                : null
              : selectedStages && selectedStages.length > 0
                ? selectedStages
                : null,
          domain: formData.category || formData.categories[0] || null,
          categories: formData.categories.length ? formData.categories : null,
          business_stage: selectedStages.length ? selectedStages : null,
          format: (selectedFormat || formData.format || '') || null,
          author_name: formData.authorName || null,
        });

        const buildChildPayload = () => {
          const tab = formData.activeTab;
          const canonicalType = TAB_TO_MEDIA_TYPE[tab] ?? 'Article';

          switch (canonicalType) {
            case 'Article':
              return {
                type: canonicalType,
                data: {
                  body_html: editorHtml || null,
                  body_json: editorJson || null,
                  byline: formData.authorName || null,
                  source: formData.authorOrg || null,
                  announcement_date: null,
                  document_url: null,
                },
              };
            case 'Video':
              return {
                type: canonicalType,
                data: {
                  video_url: videoUpload.uploadedUrl || (isValidUrl(formData.videoUrl) ? formData.videoUrl : null),
                  platform: null,
                  duration_sec: parseDurationToSeconds(formData.duration),
                  transcript_url: null,
                },
              };
            case 'Podcast':
              return {
                type: canonicalType,
                data: {
                  audio_url: podcastUpload.uploadedUrl || (isValidUrl(formData.podcastUrl) ? formData.podcastUrl : null),
                  is_video_episode: !!formData.isVideoEpisode,
                  episode_no: formData.episodeNumber ? parseInt(formData.episodeNumber, 10) || null : null,
                  duration_sec: null,
                  transcript_url: null,
                },
              };
            case 'Report': {
              const fileSizeMb = parseFileSizeToMb(formData.fileSize);
              return {
                type: canonicalType,
                data: {
                  document_url:
                    documentUpload.uploadedUrl || (isValidUrl(formData.downloadUrl) ? formData.downloadUrl : null),
                  pages: null,
                  file_size_mb: fileSizeMb,
                  highlights: null,
                  toc: null,
                },
              };
            }
            case 'Tool': {
              const fileSizeMb = parseFileSizeToMb(formData.fileSize);
              const releaseDateIso = formData.toolkitReleaseDate
                ? (() => {
                  const parsed = new Date(formData.toolkitReleaseDate);
                  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
                })()
                : null;
              return {
                type: canonicalType,
                data: {
                  document_url:
                    documentUpload.uploadedUrl || (isValidUrl(formData.downloadUrl) ? formData.downloadUrl : null),
                  file_size_mb: fileSizeMb,
                  file_type: formData.toolkitFileType || null,
                  body_html: editorHtml || null,
                  body_json: editorJson || null,
                  toc: formData.toolkitToc?.length ? formData.toolkitToc : null,
                  requirements: formData.toolkitRequirements?.length ? formData.toolkitRequirements : null,
                  highlights: formData.toolkitHighlights?.length ? formData.toolkitHighlights : null,
                  version: formData.toolkitVersion || null,
                  release_date: releaseDateIso,
                  changelog_html: formData.toolkitChangelogHtml || null,
                  changelog_json: formData.toolkitChangelogJson || null,
                  attachments: formData.toolkitAttachments?.length ? formData.toolkitAttachments : null,
                  categories: formData.categories?.length ? formData.categories : null,
                  business_stage: selectedStages?.length ? selectedStages : null,
                  format: selectedFormat || formData.format || null,
                  tags: formData.tags?.length ? formData.tags : null,
                },
              };
            }
            default:
              throw new Error(`Unsupported media type mapping for tab "${tab}"`);
          }
        };

        const computeToolkitMetadata = () => {
          if (formData.activeTab !== 'Toolkit') return null;
          const releaseDateIso = formData.toolkitReleaseDate
            ? (() => {
              const parsed = new Date(formData.toolkitReleaseDate);
              return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
            })()
            : null;
          return {
            categories: formData.categories,
            businessStages: selectedStages,
            tags: formData.tags,
            bodyHtml: editorHtml || null,
            bodyJson: editorJson || null,
            toc: formData.toolkitToc,
            requirements: formData.toolkitRequirements,
            highlights: formData.toolkitHighlights,
            version: formData.toolkitVersion || null,
            releaseDate: releaseDateIso,
            changelogHtml: formData.toolkitChangelogHtml || null,
            changelogJson: formData.toolkitChangelogJson || null,
            fileType: formData.toolkitFileType || null,
            attachments: formData.toolkitAttachments,
            authors: formData.toolkitAuthors,
            format: selectedFormat || formData.format || '',
            documentUrl: formData.downloadUrl || null,
            fileSizeLabel: formData.fileSize || null,
          };
        };

        const supabaseClient = getSupabaseClient();
        const toolkitMetaPayload = computeToolkitMetadata();

        if (routeContentId) {
          let currentStatus = 'Draft';
          let currentPublishedAt: string | null = null;

          if (supabaseClient) {
            try {
              const { data: currentContent, error: fetchError } = await supabaseClient
                .from('cnt_contents')
                .select('status, published_at')
                .eq('id', routeContentId)
                .single();

              if (!fetchError && currentContent) {
                currentStatus = currentContent.status || 'Draft';
                currentPublishedAt = currentContent.published_at || null;
              }
            } catch (error) {
              console.warn('Could not fetch current content status, using defaults:', error);
            }
          }

          let publishedAt: string | null = null;
          if (formData.publishDate) {
            publishedAt = new Date(formData.publishDate).toISOString();
          } else if (currentPublishedAt) {
            publishedAt = currentPublishedAt;
          } else if (currentStatus === 'Published') {
            publishedAt = new Date().toISOString();
          }

          const basePayload = await buildBasePayload(currentStatus, publishedAt);
          const { type, data } = buildChildPayload();

          logSaveFlow('UPDATE_CALL', {
            routeContentId,
            baseFields: Object.keys(basePayload),
            type,
            childFields: Object.keys(data),
            baseData: basePayload,
            childData: data,
          });

          let id: string;
          try {
            id = await updateMedia(routeContentId, basePayload, type, data);
            if (!id) {
              logSaveFlow('UPDATE_FAILED', { error: 'No ID returned from updateMedia' });
              throw new Error('Update failed: No ID returned from updateMedia');
            }
            logSaveFlow('UPDATE_SUCCESS', {
              returnedId: id,
              matchesRouteId: id === routeContentId,
            });
            setLastSavedContentId(id);
          } catch (error: any) {
            logSaveFlow('UPDATE_ERROR', {
              error: error?.message || String(error),
              stack: error?.stack,
            });
            console.error('Update media error:', error);
            throw new Error(`Failed to update content: ${error?.message || String(error)}`);
          }

          let syncedAuthors = formData.toolkitAuthors;
          if (toolkitMetaPayload && supabaseClient) {
            try {
              syncedAuthors = await syncToolkitAuthors(supabaseClient, id, formData.toolkitAuthors);
              setToolkitAuthors(syncedAuthors);
            } catch (authorSyncError) {
              console.error('[ToolkitAuthors] Sync failed', authorSyncError);
            }
          }

          if (supabaseClient) {
            try {
              const authorMetadata = {
                author_name: formData.authorName || null,
                author_org: formData.authorOrg || null,
                author_title: formData.authorTitle || null,
                author_bio: formData.authorBio || null,
                author_photo_url: formData.authorPhotoUrl || null,
              };

              const { data: existingContent } = await supabaseClient
                .from('cnt_contents')
                .select('metadata')
                .eq('id', id)
                .single();

              let existingMetadata = existingContent?.metadata || {};
              if (typeof existingMetadata === 'string') {
                try {
                  existingMetadata = JSON.parse(existingMetadata);
                } catch {
                  existingMetadata = {};
                }
              }
              const metadataPatch: Record<string, any> = { ...authorMetadata };
              const toolkitMetaForMetadata =
                toolkitMetaPayload && toolkitMetaPayload !== null
                  ? { ...toolkitMetaPayload, authors: syncedAuthors }
                  : null;
              if (toolkitMetaForMetadata) {
                metadataPatch.toolkit = {
                  ...(typeof (existingMetadata as any)?.toolkit === 'object' ? (existingMetadata as any).toolkit : {}),
                  ...toolkitMetaForMetadata,
                };
              }
              const updatedMetadata = { ...existingMetadata, ...metadataPatch };

              const { error: updateError } = await supabaseClient
                .from('cnt_contents')
                .update({
                  metadata: updatedMetadata,
                  author_name: formData.authorName || null,
                  published_at: basePayload.published_at || null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id);

              if (updateError) {
                logSaveFlow('METADATA_UPDATE_FAILED', { error: updateError.message });
                console.error('Failed to update metadata:', updateError);
                throw new Error(`Metadata update failed: ${updateError.message}`);
              }

              logSaveFlow('METADATA_UPDATE_SUCCESS', { contentId: id });
            } catch (metadataError) {
              console.error('Error updating metadata:', metadataError);
            }
          }

          // Read-back verification from DB and view
          await verifySavedRow(id);

          setSubmitting(false);
          setShowSuccess(true);

          await new Promise((resolve) => setTimeout(resolve, 600));
          await fetchAndPrefill({ id: routeContentId });

          logSaveFlow('UPDATE_COMPLETE', {
            contentId: routeContentId,
            metadataUpdateSuccess: true,
            formReloaded: true,
          });
        } else {
          const basePayload = await buildBasePayload('Draft', formData.publishDate ? new Date(formData.publishDate).toISOString() : null);
          const { type, data } = buildChildPayload();

          logSaveFlow('CREATE_CALL', {
            baseFields: Object.keys(basePayload),
            type,
            childFields: Object.keys(data),
          });

          const id = await createMedia(basePayload, type, data);
          if (!id) {
            logSaveFlow('CREATE_FAILED', { error: 'No ID returned from createMedia' });
            throw new Error('Create failed');
          }

          logSaveFlow('CREATE_SUCCESS', { newContentId: id });

          if (supabaseClient) {
            let syncedAuthors = formData.toolkitAuthors;
            if (toolkitMetaPayload) {
              try {
                syncedAuthors = await syncToolkitAuthors(supabaseClient, id, formData.toolkitAuthors);
                setToolkitAuthors(syncedAuthors);
              } catch (authorSyncError) {
                console.error('[ToolkitAuthors] Sync failed (create)', authorSyncError);
              }
            }

            const authorMetadata = {
              author_name: formData.authorName || null,
              author_org: formData.authorOrg || null,
              author_title: formData.authorTitle || null,
              author_bio: formData.authorBio || null,
              author_photo_url: formData.authorPhotoUrl || null,
            };

            const { data: existingContent } = await supabaseClient
              .from('cnt_contents')
              .select('metadata')
              .eq('id', id)
              .single();

            let existingMetadata = existingContent?.metadata || {};
            if (typeof existingMetadata === 'string') {
              try {
                existingMetadata = JSON.parse(existingMetadata);
              } catch {
                existingMetadata = {};
              }
            }
            const metadataPatch: Record<string, any> = { ...authorMetadata };
            const toolkitMetaForMetadata =
              toolkitMetaPayload && toolkitMetaPayload !== null
                ? { ...toolkitMetaPayload, authors: syncedAuthors }
                : null;
            if (toolkitMetaForMetadata) {
              metadataPatch.toolkit = {
                ...(typeof (existingMetadata as any)?.toolkit === 'object' ? (existingMetadata as any).toolkit : {}),
                ...toolkitMetaForMetadata,
              };
            }
            const updatedMetadata = { ...existingMetadata, ...metadataPatch };

            await supabaseClient
              .from('cnt_contents')
              .update({
                metadata: updatedMetadata,
                author_name: formData.authorName || null,
                published_at:
                  basePayload.status === 'Published' && !basePayload.published_at
                    ? new Date().toISOString()
                    : basePayload.published_at || undefined,
                updated_at: new Date().toISOString(),
              })
              .eq('id', id);
          }

          // Read-back verification from DB and view
          await verifySavedRow(id);

          removeDraft();
          setDraftRestored(false);
          setSubmitting(false);
          setShowSuccess(true);

          logSaveFlow('CREATE_COMPLETE', { contentId: id });
          setLastSavedContentId(id);
        }
      } catch (error: any) {
        setSubmitting(false);
        logSaveFlow('ERROR', {
          error: error?.message || String(error),
          stack: error?.stack,
          isEditing,
        });
        setErrorModal({
          show: true,
          message: routeContentId ? 'Update failed' : 'Save failed',
          error,
        });
      }
    },
    [
      documentUpload.uploadedUrl,
      editorHtml,
      editorJson,
      fetchAndPrefill,
      formData,
      isEditing,
      podcastUpload.uploadedUrl,
      routeContentId,
      selectedStages,
      selectedFormat,
      setToolkitAuthors,
      validate,
      videoUpload.uploadedUrl,
    ]
  );

  const tabs = useMemo(
    () => [
      { key: 'Article', label: 'Articles', description: 'Write and format articles' },
      { key: 'News', label: 'News', description: 'Quick news and announcements' },
      { key: 'Guide', label: 'Guides', description: 'How-to guides and tutorials' },
      { key: 'Video', label: 'Videos', description: 'Video content with preview' },
      { key: 'Podcast', label: 'Podcasts', description: 'Audio or video podcast episodes' },
      { key: 'Report', label: 'Reports', description: 'Reports and documents' },
      { key: 'Toolkit', label: 'Toolkits', description: 'Toolkits & templates' },
    ],
    []
  );

  return {
    routeContentId,
    isEditing,
    formData,
    setFormData,
    editorHtml,
    setEditorState,
    resetEditorState,
    selectedStages,
    toggleStage,
    selectedFormat,
    toggleFormat,
    availableFormats,
    categories,
    catError,
    draftRestored,
    clearDraftAndReset,
    handleFieldChange,
    setActiveTab,
    videoUpload,
    podcastUpload,
    documentUpload,
    handleVideoFileUpload,
    clearVideoUpload,
    handlePodcastFileUpload,
    clearPodcastUpload,
    handleDocumentUpload,
    clearDocumentUpload,
    videoFileInputRef,
    podcastFileInputRef,
    docFileInputRef,
    thumbnailUpload,
    handleThumbnailUpload,
    clearThumbnailUpload,
    thumbnailFileInputRef,
    errors,
    setErrors,
    validate,
    handleSubmit,
    submitting,
    crudLoading,
    crudError,
    showSuccess,
    setShowSuccess,
    errorModal,
    setErrorModal,
    handleNavigateBack,
    tabs,
    STAGE_TAGS,
    detectMediaTypeFromUrl,
    getEmbedUrl,
    isEmbeddableUrl,
    isDirectVideoUrl,
    isDev,
    logSaveFlow,
    handleSlugChange,
    regenerateSlug,
    setTags,
    setSelectedCategories,
    setToolkitToc,
    setToolkitRequirements,
    setToolkitHighlights,
    setToolkitAttachments,
    setToolkitAuthors,
    setToolkitChangelog,
    lastSavedContentId,
  };
};

