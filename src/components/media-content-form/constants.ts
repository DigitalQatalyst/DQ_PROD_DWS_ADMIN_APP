import type { KHMediaType } from '../../types/knowledgehub';
import type { MediaFormData, TabKey } from './types';

export const DRAFT_STORAGE_KEY = 'mediaContentForm:draft:v1';

export const STAGE_TAGS: string[] = [
  'Ideation',
  'Launch',
  'Growth',
  'Expansion',
  'Optimization',
  'Transformation',
];

export const MEDIA_TYPE_FORMAT_MAPPING: Record<TabKey, string[]> = {
  Article: [],
  News: ['Quick Reads'],
  Guide: ['Quick Reads', 'In-Depth Reports'],
  Video: ['Recorded Media'],
  Podcast: ['Recorded Media'],
  Report: ['In-Depth Reports', 'Downloadable Templates'],
  Toolkit: ['Interactive Tools', 'Downloadable Templates'],
};

export const CATEGORY_FACET_CODES = ['domain', 'industry', 'capability', 'sector'] as const;

export const DEFAULT_CATEGORIES: string[] = ['Business', 'Finance', 'Technology', 'Marketing', 'Export', 'SME'];

export const TAB_TO_MEDIA_TYPE: Record<TabKey, KHMediaType> = {
  Article: 'Article',
  News: 'Article',
  Guide: 'Article',
  Video: 'Video',
  Podcast: 'Podcast',
  Report: 'Report',
  Toolkit: 'Tool',
};

export const INITIAL_FORM_DATA: MediaFormData = {
  title: '',
  slug: '',
  status: 'Draft',
  activeTab: 'Article',
  summary: '',
  content: '',
  authorName: '',
  authorOrg: '',
  authorTitle: '',
  authorBio: '',
  authorPhotoUrl: '',
  category: '',
  publishDate: '',
  featuredImage: '',
  videoUrl: '',
  duration: '',
  podcastUrl: '',
  episodeNumber: '',
  isVideoEpisode: false,
  downloadUrl: '',
  fileSize: '',
  tags: [],
  categories: [],
  businessStages: [],
  format: '',
  toolkitToc: [],
  toolkitRequirements: [],
  toolkitHighlights: [],
  toolkitVersion: '',
  toolkitReleaseDate: '',
  toolkitChangelogHtml: '',
  toolkitChangelogJson: null,
  toolkitFileType: '',
  toolkitAttachments: [],
  toolkitAuthors: [],
  guide_type: '',
  function_area: '',
  complexity_level: '',
  sub_domain: '',
  unit: '',
  location: '',
  isEditorsPick: false,
  downloadCount: 0,
};

