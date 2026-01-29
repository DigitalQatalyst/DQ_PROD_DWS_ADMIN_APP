export type TabKey = 'Article' | 'News' | 'Guide' | 'Video' | 'Podcast' | 'Report' | 'Toolkit';

export interface ToolkitAuthor {
  id?: string | null;
  profileId?: string | null;
  name: string;
  organization?: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  isPrimary: boolean;
  order: number;
}

export interface ToolkitRequirement {
  id: string;
  label: string;
  value: string;
  order?: number;
}

export interface ToolkitHighlight {
  id: string;
  title: string;
  description: string;
  allowMarkComplete: boolean;
  order?: number;
}

export interface ToolkitTocItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
}

export interface ToolkitAttachment {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSizeMb: number | null;
  order?: number;
}

export interface MediaFormData {
  title: string;
  slug: string;
  status: string;
  activeTab: TabKey;
  summary: string;
  content: string;
  authorName: string;
  authorOrg: string;
  authorTitle: string;
  authorBio: string;
  authorPhotoUrl: string;
  category: string;
  publishDate: string;
  featuredImage: string;
  videoUrl: string;
  duration: string;
  podcastUrl: string;
  episodeNumber: string;
  isVideoEpisode: boolean;
  downloadUrl: string;
  fileSize: string;
  tags: string[];
  categories: string[];
  businessStages: string[];
  format: string;
  toolkitToc: ToolkitTocItem[];
  toolkitRequirements: ToolkitRequirement[];
  toolkitHighlights: ToolkitHighlight[];
  toolkitVersion: string;
  toolkitReleaseDate: string;
  toolkitChangelogHtml: string;
  toolkitChangelogJson: any;
  toolkitFileType: string;
  toolkitAttachments: ToolkitAttachment[];
  toolkitAuthors: ToolkitAuthor[];
  // Guide specific fields
  guide_type: string;
  function_area: string;
  complexity_level: string;
  sub_domain: string;
  unit: string;
  location: string;
  isEditorsPick: boolean;
  downloadCount: number;
}

export interface ValidationErrors extends Record<string, string> { }

export interface UploadState {
  uploadedUrl: string;
  uploading: boolean;
  error: string;
  fileName?: string;
  fileSizeBytes?: number;
  contentType?: string;
}

