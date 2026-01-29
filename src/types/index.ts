/**
 * Core Type Definitions
 * Shared types used across the application
 */

// User and Authentication Types
export type UserSegment = 'internal' | 'partner' | 'customer' | 'advisor';
export type UserRole = 'admin' | 'hr_admin' | 'hr_member' | 'content_admin' | 'content_member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  user_segment: UserSegment;
  organization_id?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

// @deprecated RolePermissions - Legacy permission definitions
// This has been replaced by the canonical CASL vocabulary in src/shared/permissions.ts
// Keep for backward compatibility during migration. Will be removed in future version.
//
// New implementation: Import RolePermissions from '../shared/permissions'
// This uses normalized roles: admin, editor (includes creator/contributor), approver, viewer
export const RolePermissions: Record<string, string[]> = {
  admin: ['create', 'edit', 'approve', 'delete', 'view', 'publish', 'unpublish', 'archive'],
  approver: ['view', 'review', 'approve', 'comment'],
  editor: ['create', 'edit', 'submit', 'view', 'comment'],
  viewer: ['view'],
};

// Service Types
export interface Service {
  id: string;
  title: string;
  type: 'Financial' | 'Non-Financial';
  partner: string;
  category: string;
  processingTime: string;
  status: 'Draft' | 'Pending' | 'Published' | 'Unpublished' | 'Rejected' | 'Sent Back' | 'Archived';
  applicants: number;
  feedback: {
    rating: number;
    count: number;
  };
  submitted_on: string;
  description?: string;
  eligibility?: string[];
  applicationRequirements?: string[];
  fee?: string;
  regulatoryCategory?: string;
  documentsRequired?: string[];
  outcome?: string;
  partnerInfo?: PartnerInfo;
  comments?: Comment[];
  activityLog?: ActivityLogEntry[];
}

export type ExperienceCenterRequestType = 'Tech Support' | 'Leave' | 'WFH';

export interface BaseServiceRequest {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  request_type: ExperienceCenterRequestType;
}

export interface TechSupportRequest extends BaseServiceRequest {
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
}

export interface LeaveRequest extends BaseServiceRequest {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  duration_days: number;
}

export interface WFHRequest extends BaseServiceRequest {
  start_date: string;
  end_date: string;
  reason: string;
}

export type ExperienceCenterRequest = TechSupportRequest | LeaveRequest | WFHRequest;

export interface PartnerInfo {
  name: string;
  email: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  totalSubmissions: number;
  approvalRate: number;
  complianceNotes?: string;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface ActivityLogEntry {
  date: string;
  action: string;
  performedBy: string;
  details?: string;
}

// Business Directory Types
export interface Business {
  id: string;
  name: string;
  type: 'Government' | 'Semi-Government' | 'Private';
  industry: string;
  category?: string; // Business category (used in customer app directory)
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  status: 'Active' | 'Featured' | 'Pending' | 'Inactive';
  foundedYear: string; // Display field (maps to established_year in DB)
  established_year?: number; // Database field
  logo?: string;
  logo_url?: string; // Alternative logo field
  description: string;
  address: Address | string; // Can be object or string
  location?: string; // Alternative address field
  phone: string; // Display field
  contact_phone?: string; // Database field
  email: string; // Display field
  contact_email?: string; // Database field
  contactPhone?: string; // Alternative field name
  contactEmail?: string; // Alternative field name
  website?: string;
  socialMedia?: SocialMedia;
  keyPeople?: Person[];
  employees?: string; // Employee count (e.g., "500+", "1,000+")
  revenue?: string; // Revenue information (e.g., "$100M+", "$1B+")
  services?: string[]; // Array of services offered
  products?: Product[];
  targetMarkets?: string[];
  certifications?: string[];
  financials?: Financials;
  licenseInfo?: LicenseInfo;
  businessHours?: BusinessHours;
  additionalLocations?: Location[];
}

export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface Person {
  name: string;
  role: string;
}

export interface Product {
  name: string;
  description: string;
  category: string;
}

export interface Financials {
  revenue?: string;
  revenueGrowth?: string;
  marketShare?: string;
  profitMargin?: string;
  investments?: Investment[];
  reports?: Report[];
}

export interface Investment {
  round: string;
  amount: string;
  date: string;
  investors?: string;
  details?: string;
}

export interface Report {
  title: string;
  year: string;
  url?: string;
}

export interface LicenseInfo {
  number: string;
  issuedDate: string;
  expiryDate: string;
  authority: string;
}

export interface BusinessHours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface Location {
  name: string;
  address: string;
  phone: string;
}

// Growth Area Types
export interface GrowthArea {
  id: string;
  name: string;
  type: 'Strategic' | 'Emerging' | 'Traditional';
  category: string;
  status: 'Growing' | 'Accelerating' | 'Stable' | 'Declining' | 'Active' | 'Planning';
  growthRate?: number;
  submitted_on: string;
  icon?: {
    name: string;
  };
  iconColor?: string;
  iconBgColor?: string;
  description: string;
  keyStatistics?: Statistic[];
  growthProjection?: GrowthProjection;
  associatedZones?: string[];
  keyPlayers?: string[];
  associatedBusinesses?: string[];
  economicImpact?: EconomicImpact[];
  employment?: Employment[];
  marketTrends?: string[];
  comparativeAnalysis?: ComparativeAnalysis;
  industryBreakdown?: IndustryBreakdown[];
  investmentOpportunities?: string[];
  supportPrograms?: string[];
  contactInformation?: Record<string, any>;
}

export interface Statistic {
  label: string;
  value: string;
  change?: number;
}

export interface GrowthProjection {
  rate: number;
  period: string;
  description: string;
}

export interface EconomicImpact {
  metric: string;
  value: string;
}

export interface Employment {
  category: string;
  count: number;
}

export interface ComparativeAnalysis {
  description: string;
  regionalComparison?: RegionalComparison[];
  advantages?: string[];
}

export interface RegionalComparison {
  region: string;
  metric: string;
  value: string;
}

export interface IndustryBreakdown {
  sector: string;
  contribution: number;
}

// Content Management Types
export interface ToolkitContentDetails {
  bodyHtml?: string;
  bodyJson?: any;
  toc?: Array<{ id?: string; title: string; level?: number; anchor?: string }>;
  requirements?: Array<{ id?: string; label: string; value: string }>;
  highlights?: Array<{ id?: string; title: string; description: string; allowMarkComplete?: boolean }>;
  version?: string;
  releaseDate?: string;
  changelogHtml?: string;
  changelogJson?: any;
  documentUrl?: string;
  fileType?: string;
  fileSizeMb?: number | null;
  fileSizeLabel?: string | null;
  attachments?: Array<{ id?: string; name: string; url: string; fileType?: string; fileSizeMb?: number | null }>;
  authors?: Array<{ id?: string | null; profileId?: string | null; name: string; organization?: string; role?: string; photoUrl?: string; bio?: string; isPrimary?: boolean }>;
}

export interface Content {
  id: string;
  title: string;
  type: 'Article' | 'Event' | 'Resource' | 'Banner' | 'Page' | 'Campaign' | 'Email' | 'Guide' | 'Video' | 'Podcast' | 'Report' | 'Tool';
  status: 'Draft' | 'Pending Review' | 'Published' | 'Archived' | 'Rejected';
  author: string;
  lastModified: string;
  content?: string;
  category?: string;
  tags?: string[];
  categories?: string[];
  businessStages?: string[];
  featuredImage?: string;
  thumbnail?: string;
  publishDate?: string;
  publishedOn?: string; // Alias for publishDate, used in ContentManagementPage
  expiryDate?: string;
  summary?: string;
  format?: string;
  description?: string;
  flagCount?: number;
  flaggedAt?: string;
  authorInfo?: {
    email?: string;
    organization?: string;
    bio?: string;
    profileImage?: string;
    title?: string;
    totalSubmissions?: number;
    approvalRate?: number;
  };
  toolkit?: ToolkitContentDetails;
}

// Zone & Cluster Types
export interface Zone {
  id: string;
  name: string;
  type: 'Free Zone' | 'Economic Zone' | 'Industrial Zone' | 'Technology Zone';
  region: string;
  status: 'Active' | 'Under Development' | 'Planned';
  establishedDate?: string;
  size?: string;
  description: string;
  keyFeatures?: string[];
  industries?: string[];
  benefits?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface Cluster {
  id: string;
  name: string;
  zone: string;
  category: string;
  companies: number;
  description?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Filter and Pagination Types
export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

