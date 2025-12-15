# Data Dictionary - Enterprise Journey Platform

## Version History
- **v1.0** - Initial schema with basic ecosystem tables
- **v1.1** - Added content management and marketplace features
- **v1.2** - Added review and approval workflows
- **v2.0** - **CURRENT** - Added organization-scoped RBAC enforcement

## Overview
This data dictionary documents the database schema for the Enterprise Journey Platform, a comprehensive ecosystem for supporting entrepreneurs and businesses in the UAE. The schema uses a dimensional modeling approach with meaningful prefixes to organize tables by feature domain.

**Important**: The database uses `customer_type` field (staff, partner, enterprise, advisor), which is mapped to `user_segment` (internal, partner, customer, advisor) in the frontend. See [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md) for details on the mapping layer.

## v2.0 Changes - Organization-Scoped RBAC
This version introduces organization-scoped access control with the following key features:
- Multi-tenant organization support via `organisations` table
- User profiles with customer types (staff, partner, enterprise, customer)
- Organization-scoped data access for all content and business entities
- Row-level security (RLS) policies for data isolation
- Azure B2C integration with claim normalization

## Schema Organization

### Prefix Convention
- `eco_` - Core ecosystem tables (organizations, locations, programs)
- `geo_` - Geographic/administrative data
- `cnt_` - Content-related tables (events, resources, metrics, experiences)
- `comm_` - Community features (mentors, networking)
- `mktplc_` - Marketplace features (services, investments)
- `dim_` - Dimension tables for analytics
- `jct_` - Junction tables for many-to-many relationships
- `v_` - Views
- `mv_` - Materialized views

---

## Core Tables

### Organization Management

#### organisations
**Purpose**: Multi-tenant organization management for RBAC enforcement
**Type**: Core Entity Table
**Version**: v2.0

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| name | character varying | Unique organization identifier | UNIQUE, NOT NULL |
| display_name | character varying | Human-readable organization name | NOT NULL |
| description | text | Organization description | |
| domain | character varying | Organization domain | |
| settings | jsonb | Organization-specific settings | DEFAULT '{}'::jsonb |
| status | character varying | Organization status | DEFAULT 'active', CHECK: 'active', 'inactive', 'suspended' |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| created_by | uuid | Creator | FK → users |

**Indexes**:
- `idx_organisations_name` (name)
- `idx_organisations_status` (status)

**RBAC Notes**:
- All users belong to an organization
- Organization-scoped data access is enforced via RLS policies
- Default organizations: 'DigitalQatalyst', 'Front Operations'

### Ecosystem Tables (eco_)

#### eco_business_directory
**Purpose**: Central registry of all organizations in the ecosystem
**Type**: Core Entity Table
**Version**: v2.0 (updated with organization scoping)

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| name | text | Organization name | NOT NULL |
| organization_type | text | Type discriminator | CHECK: 'business', 'support_entity', 'association', 'government', 'ngo' |
| type | text | Business type | |
| industry | text | Industry classification | |
| size | text | Organization size | |
| status | text | Current status | |
| founded_year | integer | Year founded | |
| logo | text | Logo URL | |
| description | text | Organization description | |
| address | jsonb | Address information | |
| contact_phone | text | Primary phone | |
| contact_email | text | Primary email | |
| website | text | Website URL | |
| social_media | jsonb | Social media links | |
| key_people | jsonb | Key personnel | |
| employees | text | Employee count/range | |
| products | jsonb | Products/services offered | |
| certifications | text[] | Certifications held | |
| financials | jsonb | Financial information | |
| primary_sector_id | uuid | Primary industry sector | FK → dim_sectors |
| primary_support_category_id | uuid | Primary support category | FK → dim_support_categories |
| supported_emirates | text[] | Emirates served | |
| tags | text[] | Flexible tagging system | |
| organisation_id | uuid | Parent organization | FK → organisations |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_eco_business_directory_slug` (slug)
- `idx_eco_business_directory_org_type` (organization_type)
- `idx_eco_business_directory_primary_sector` (primary_sector_id)
- `idx_eco_business_directory_support_cat` (primary_support_category_id)
- `idx_eco_business_directory_tags` (tags) GIN
- `idx_eco_business_directory_organisation_id` (organisation_id) - **v2.0**

**RBAC Notes**:
- Organization-scoped access via `organisation_id`
- RLS policies enforce data isolation by organization

#### eco_zones
**Purpose**: Physical and virtual locations in the ecosystem
**Type**: Core Entity Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| name | text | Location name | NOT NULL |
| location_type | text | Type discriminator | CHECK: 'economic_zone', 'office', 'attraction', 'landmark', 'facility', 'experience' |
| description | text | Location description | |
| established_date | date | Date established | |
| total_area | text | Area description | |
| phone | text | Contact phone | |
| email | text | Contact email | |
| website | text | Website URL | |
| image_url | text | Main image URL | |
| key_features | text[] | Key features | |
| incentives | jsonb | Available incentives | |
| coordinates | point | Geographic coordinates | |
| admission_fee | text | Admission cost | |
| rating | numeric | Average rating | |
| review_count | integer | Number of reviews | |
| tags | text[] | Flexible tagging system | |
| organisation_id | uuid | Parent organization | FK → organisations |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_eco_zones_slug` (slug)
- `idx_eco_zones_location_type` (location_type)
- `idx_eco_zones_coordinates` (coordinates) GIST
- `idx_eco_zones_tags` (tags) GIN

#### eco_growth_areas
**Purpose**: Economic growth sectors and analysis
**Type**: Core Entity Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| name | text | Growth area name | NOT NULL |
| description | text | Area description | |
| icon | jsonb | Icon configuration | |
| icon_color | text | Icon color | |
| icon_bg_color | text | Icon background color | |
| key_statistics | jsonb | Key statistics | |
| growth_projection | jsonb | Growth projections | |
| associated_zones | text[] | Related zones | |
| key_players | text[] | Key players | |
| associated_businesses | text[] | Related businesses | |
| economic_impact | jsonb | Economic impact data | |
| employment | jsonb | Employment data | |
| market_trends | jsonb | Market trend analysis | |
| comparative_analysis | jsonb | Comparative analysis | |
| industry_breakdown | jsonb | Industry breakdown | |
| investment_opportunities | jsonb | Investment opportunities | |
| support_programs | jsonb | Support programs | |
| contact_information | jsonb | Contact details | |
| category | text | Growth area category | |
| growth_rate | numeric | Growth rate percentage | |
| submitted_on | timestamptz | Submission date | |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

#### eco_programs
**Purpose**: Support programs and initiatives
**Type**: Core Entity Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| program_name | text | Program name | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| organization_id | uuid | Host organization | FK → eco_business_directory |
| organization_name | text | Organization name | |
| emirate_id | uuid | Target emirate | FK → geo_emirates |
| action_label | text | Call-to-action label | |
| link | text | Program URL | |
| description | text | Program description | |
| eligibility | text | Eligibility criteria | |
| duration | text | Program duration | |
| program_type_id | uuid | Program type | FK → dim_program_types |
| status | text | Program status | DEFAULT 'Active' |
| application_deadline | timestamptz | Application deadline | |
| benefits | text[] | Program benefits | |
| requirements | text[] | Requirements | |
| metadata | jsonb | Additional metadata | |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| created_by | uuid | Creator | FK → users |

**Indexes**:
- `idx_eco_programs_org` (organization_id)
- `idx_eco_programs_emirate` (emirate_id)
- `idx_eco_programs_type` (program_type_id)

---

## User Management Tables

#### users
**Purpose**: User accounts and authentication
**Type**: Core Entity Table
**Version**: v2.0 (updated with organization scoping)

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| email | text | User email address | UNIQUE, NOT NULL |
| name | text | User display name | NOT NULL |
| role | text | User role | DEFAULT 'viewer', CHECK: 'admin', 'approver', 'creator', 'contributor', 'viewer' |
| organization_id | uuid | Legacy organization reference | FK → eco_business_directory |
| avatar_url | text | Profile image URL | |
| phone | text | Phone number | |
| is_active | boolean | Account status | DEFAULT true |
| last_login_at | timestamptz | Last login timestamp | |
| metadata | jsonb | Additional user metadata | DEFAULT '{}'::jsonb |
| created_by | uuid | Account creator | FK → users |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| organisation_id | uuid | Organization membership | FK → organisations |

#### user_profiles
**Purpose**: Extended user profiles with RBAC information
**Type**: Profile Table
**Version**: v2.0

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| user_id | uuid | User reference | FK → users, NOT NULL |
| organisation_id | uuid | Organization reference | FK → organisations |
| organisation_name | character varying | Organization name | |
| customer_type | character varying | User type | DEFAULT 'staff', CHECK: 'staff', 'partner', 'enterprise', 'customer' |
| user_role | character varying | Role within organization | DEFAULT 'viewer', CHECK: 'admin', 'approver', 'creator', 'contributor', 'viewer' |
| profile_data | jsonb | Additional profile data | DEFAULT '{}'::jsonb |
| preferences | jsonb | User preferences | DEFAULT '{}'::jsonb |
| last_login_at | timestamptz | Last login timestamp | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**RBAC Notes**:
- `customer_type` determines access level (staff, partner, enterprise, customer)
- `user_role` determines permissions within organization
- Organization-scoped data access via `organisation_id`

---

## Geographic Tables (geo_)

#### geo_emirates
**Purpose**: Emirate information and boundaries
**Type**: Reference Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| emirate_id | text | Emirate identifier | UNIQUE, NOT NULL |
| emirate_name | text | Emirate name | NOT NULL |
| coordinates | point | Geographic center | |
| zoom_level | integer | Default zoom level | DEFAULT 9 |
| bounding_box | jsonb | Geographic bounds | |
| overview | jsonb | Emirate overview | |
| federal_enablers | text[] | Federal enablers | |
| local_enablers | text[] | Local enablers | |
| sme_operators | text[] | SME operators | |
| private_sector | text[] | Private sector | |
| academic_partners | text[] | Academic partners | |
| tech_support | text[] | Tech support | |
| geojson | jsonb | GeoJSON data | |
| metadata | jsonb | Additional metadata | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

---

## Content Tables (cnt_)

#### cnt_events
**Purpose**: Events, workshops, and conferences
**Type**: Content Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| title | text | Event title | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| event_type | text | Type of event | |
| date | timestamptz | Event date | NOT NULL |
| end_date | timestamptz | End date | |
| location | text | Event location | |
| location_id | uuid | Location reference | FK → eco_zones |
| description | text | Event description | |
| organizer | text | Organizer name | |
| organizer_id | uuid | Organizer organization | FK → eco_business_directory |
| link | text | Event URL | |
| price | text | Price information | |
| is_free | boolean | Free event flag | DEFAULT true |
| capacity | integer | Maximum capacity | |
| registered_count | integer | Current registrations | DEFAULT 0 |
| category | text | Event category | |
| speakers | text[] | Speaker names | |
| topics | text[] | Event topics | |
| image_url | text | Event image | |
| status | text | Event status | DEFAULT 'Upcoming' |
| primary_sector_id | uuid | Primary sector | FK → dim_sectors |
| target_stage_id | uuid | Target business stage | FK → dim_business_stages |
| is_virtual | boolean | Virtual event flag | DEFAULT false |
| virtual_link | text | Virtual event link | |
| recording_url | text | Recording URL | |
| timezone | text | Event timezone | DEFAULT 'Asia/Dubai' |
| attendance_count | integer | Actual attendance | |
| feedback_score | numeric | Feedback score | |
| metadata | jsonb | Additional metadata | |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| created_by | uuid | Creator | FK → users |

**Indexes**:
- `idx_cnt_events_date` (date)
- `idx_cnt_events_location` (location_id)
- `idx_cnt_events_org` (organizer_id)
- `idx_cnt_events_sector` (primary_sector_id)

#### cnt_resources
**Purpose**: Educational resources, tools, and templates
**Type**: Content Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| title | text | Resource title | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| resource_type | text | Resource type | CHECK: 'Communities', 'Resources', 'Services', 'Tools', 'Templates' |
| category | text | Resource category | |
| description | text | Resource description | |
| organization | text | Organization name | |
| organization_id | uuid | Organization reference | FK → eco_business_directory |
| link | text | Resource URL | |
| file_url | text | File download URL | |
| file_type | text | File type | |
| file_size | text | File size | |
| primary_sector_id | uuid | Primary sector | FK → dim_sectors |
| primary_support_category_id | uuid | Primary support category | FK → dim_support_categories |
| target_stage_id | uuid | Target business stage | FK → dim_business_stages |
| language | text | Resource language | DEFAULT 'en' |
| difficulty_level | text | Difficulty level | CHECK: 'beginner', 'intermediate', 'advanced' |
| estimated_time | text | Estimated completion time | |
| download_count | integer | Download count | DEFAULT 0 |
| view_count | integer | View count | DEFAULT 0 |
| completion_count | integer | Completion count | DEFAULT 0 |
| rating | numeric | Average rating | |
| tags | text[] | Flexible tagging system | |
| is_free | boolean | Free resource flag | DEFAULT true |
| access_level | text | Access level | DEFAULT 'Public' |
| metadata | jsonb | Additional metadata | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| created_by | uuid | Creator | FK → users |

**Indexes**:
- `idx_cnt_resources_type` (resource_type)
- `idx_cnt_resources_org` (organization_id)
- `idx_cnt_resources_sector` (primary_sector_id)

#### cnt_metrics
**Purpose**: Economic indicators and impact statistics
**Type**: Analytics Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| metric_code | text | Metric identifier | NOT NULL |
| metric_name | text | Metric name | NOT NULL |
| metric_type | text | Metric type | CHECK: 'economic_indicator', 'impact_statistic', 'regional_metric', 'performance_metric' |
| value_numeric | numeric | Numeric value | |
| value_text | text | Text value | |
| value_display | text | Display value | NOT NULL |
| unit | text | Measurement unit | |
| category | text | Metric category | |
| sector | text | Related sector | |
| year | integer | Year | |
| quarter | integer | Quarter | |
| month | integer | Month | |
| date | date | Specific date | |
| period_label | text | Period description | |
| trend | text | Trend direction | CHECK: 'increasing', 'decreasing', 'stable' |
| previous_value | numeric | Previous value | |
| change_value | numeric | Change amount | |
| change_percentage | numeric | Change percentage | |
| icon_name | text | Icon name | |
| icon_color | text | Icon color | |
| icon_bg_color | text | Icon background color | |
| chart_type | text | Chart type | |
| source | text | Data source | |
| source_url | text | Source URL | |
| calculation_method | text | Calculation method | |
| last_calculated | timestamptz | Last calculation | |
| display_order | integer | Display order | |
| is_featured | boolean | Featured flag | DEFAULT false |
| label | text | Display label | |
| description | text | Metric description | |
| emirate_id | uuid | Related emirate | FK → geo_emirates |
| location_id | uuid | Related location | FK → eco_zones |
| metadata | jsonb | Additional metadata | |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_cnt_metrics_type` (metric_type)
- `idx_cnt_metrics_code` (metric_code)
- `idx_cnt_metrics_category` (category)
- `idx_cnt_metrics_featured` (is_featured)
- `idx_cnt_metrics_date` (date)
- `idx_cnt_metrics_year_quarter` (year, quarter)

#### cnt_experiences
**Purpose**: Tourism and cultural experiences
**Type**: Content Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| title | text | Experience title | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| description | text | Experience description | |
| image_url | text | Experience image | |
| category | text | Experience category | |
| duration | text | Experience duration | |
| price_range | text | Price range | |
| location | text | Experience location | |
| location_id | uuid | Location reference | FK → eco_zones |
| provider_id | uuid | Provider organization | FK → eco_business_directory |
| rating | numeric | Average rating | |
| review_count | integer | Number of reviews | DEFAULT 0 |
| highlights | text[] | Experience highlights | |
| included_items | text[] | Included items | |
| excluded_items | text[] | Excluded items | |
| booking_link | text | Booking URL | |
| availability | text | Availability information | |
| metadata | jsonb | Additional metadata | |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

---

## Community Tables (comm_)

#### comm_mentors
**Purpose**: Mentor profiles and information
**Type**: Community Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| user_id | uuid | User account | FK → users |
| name | text | Mentor name | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| title | text | Professional title | |
| organization | text | Organization name | |
| organization_id | uuid | Organization reference | FK → eco_business_directory |
| experience | text | Experience description | |
| expertise | text[] | Areas of expertise | |
| description | text | Mentor description | |
| bio | text | Detailed biography | |
| availability | text | Availability information | |
| max_mentees | integer | Maximum mentees | |
| current_mentees | integer | Current mentees | DEFAULT 0 |
| location | text | Mentor location | |
| languages | text[] | Languages spoken | |
| linkedin_url | text | LinkedIn profile | |
| image_url | text | Profile image | |
| rating | numeric | Average rating | |
| review_count | integer | Number of reviews | DEFAULT 0 |
| is_available | boolean | Availability status | DEFAULT true |
| mentorship_areas | text[] | Mentorship focus areas | |
| metadata | jsonb | Additional metadata | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

---

## Marketplace Tables (mktplc_)

#### mktplc_services
**Purpose**: Service offerings in the marketplace
**Type**: Marketplace Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| name | text | Service name | NOT NULL |
| description | text | Service description | |
| service_category | text | Service category | |
| service_subtype | text | Service subtype | |
| price_range | text | Price range | |
| features | text[] | Service features | |
| rating | numeric | Average rating | |
| review_count | integer | Number of reviews | DEFAULT 0 |
| provider_id | uuid | Service provider | FK → eco_business_directory |
| tags | text[] | Flexible tagging system | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

#### mktplc_investment_opportunities
**Purpose**: Investment opportunities and projects
**Type**: Marketplace Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| title | text | Opportunity title | NOT NULL |
| slug | text | URL-friendly identifier | UNIQUE |
| sector | text | Investment sector | |
| location | text | Investment location | |
| location_id | uuid | Location reference | FK → eco_zones |
| investment_amount | numeric | Investment amount | |
| currency | text | Currency | DEFAULT 'USD' |
| expected_return | text | Expected return | |
| duration | text | Investment duration | |
| description | text | Opportunity description | |
| highlights | text[] | Key highlights | |
| status | text | Opportunity status | DEFAULT 'Seeking Investors' |
| minimum_investment | numeric | Minimum investment | |
| maximum_investment | numeric | Maximum investment | |
| primary_sector_id | uuid | Primary sector | FK → dim_sectors |
| documents | jsonb | Related documents | |
| contact_info | jsonb | Contact information | |
| deadline | timestamptz | Application deadline | |
| stage | text | Investment stage | |
| risk_level | text | Risk level | |
| metadata | jsonb | Additional metadata | |
| tags | text[] | Flexible tagging system | |
| view_count | integer | View count | DEFAULT 0 |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |
| created_by | uuid | Creator | FK → users |

**Indexes**:
- `idx_mktplc_investment_sector` (primary_sector_id)
- `idx_mktplc_investment_location` (location_id)

---

## Dimension Tables (dim_)

#### dim_support_categories
**Purpose**: Support categories for filtering and analysis
**Type**: Dimension Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| category_code | text | Category code | UNIQUE, NOT NULL |
| category_name | text | Category name | NOT NULL |
| description | text | Category description | |
| parent_category_id | uuid | Parent category | FK → dim_support_categories |
| icon | text | Icon identifier | |
| color | text | Display color | |
| display_order | integer | Display order | |
| is_active | boolean | Active status | DEFAULT true |
| metadata | jsonb | Additional metadata | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_dim_support_categories_code` (category_code)
- `idx_dim_support_categories_parent` (parent_category_id)

#### dim_sectors
**Purpose**: Industry sectors for classification
**Type**: Dimension Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| sector_code | text | Sector code | UNIQUE, NOT NULL |
| sector_name | text | Sector name | NOT NULL |
| description | text | Sector description | |
| parent_sector_id | uuid | Parent sector | FK → dim_sectors |
| icon | text | Icon identifier | |
| color | text | Display color | |
| display_order | integer | Display order | |
| is_active | boolean | Active status | DEFAULT true |
| metadata | jsonb | Additional metadata | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_dim_sectors_code` (sector_code)
- `idx_dim_sectors_parent` (parent_sector_id)

#### dim_business_stages
**Purpose**: Business maturity stages
**Type**: Dimension Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| stage_code | text | Stage code | UNIQUE, NOT NULL |
| stage_name | text | Stage name | NOT NULL |
| description | text | Stage description | |
| typical_characteristics | jsonb | Stage characteristics | |
| display_order | integer | Display order | |
| is_active | boolean | Active status | DEFAULT true |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_dim_business_stages_code` (stage_code)

#### dim_program_types
**Purpose**: Program types for classification
**Type**: Dimension Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| type_code | text | Type code | UNIQUE, NOT NULL |
| type_name | text | Type name | NOT NULL |
| description | text | Type description | |
| target_audience | text | Target audience | |
| typical_duration | text | Typical duration | |
| icon | text | Icon identifier | |
| color | text | Display color | |
| is_active | boolean | Active status | DEFAULT true |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Last update timestamp | DEFAULT now() |

**Indexes**:
- `idx_dim_program_types_code` (type_code)

---

## Junction Tables (jct_)

### Business Relationships

#### jct_business_support_categories
**Purpose**: Many-to-many relationship between businesses and support categories
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| business_id | uuid | Business reference | FK → eco_business_directory, NOT NULL |
| support_category_id | uuid | Support category reference | FK → dim_support_categories, NOT NULL |
| is_primary | boolean | Primary category flag | DEFAULT false |
| notes | text | Additional notes | |
| verified | boolean | Verification status | DEFAULT false |
| verified_at | timestamptz | Verification timestamp | |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(business_id, support_category_id)

**Indexes**:
- `idx_jct_bus_support_business` (business_id)
- `idx_jct_bus_support_category` (support_category_id)

#### jct_business_sectors
**Purpose**: Many-to-many relationship between businesses and sectors
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| business_id | uuid | Business reference | FK → eco_business_directory, NOT NULL |
| sector_id | uuid | Sector reference | FK → dim_sectors, NOT NULL |
| is_primary | boolean | Primary sector flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(business_id, sector_id)

**Indexes**:
- `idx_jct_bus_sectors_business` (business_id)
- `idx_jct_bus_sectors_sector` (sector_id)

### Program Relationships

#### jct_program_support_categories
**Purpose**: Many-to-many relationship between programs and support categories
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| program_id | uuid | Program reference | FK → eco_programs, NOT NULL |
| support_category_id | uuid | Support category reference | FK → dim_support_categories, NOT NULL |
| is_primary | boolean | Primary category flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(program_id, support_category_id)

**Indexes**:
- `idx_jct_prog_support_program` (program_id)
- `idx_jct_prog_support_category` (support_category_id)

#### jct_program_target_stages
**Purpose**: Many-to-many relationship between programs and target business stages
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| program_id | uuid | Program reference | FK → eco_programs, NOT NULL |
| stage_id | uuid | Business stage reference | FK → dim_business_stages, NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(program_id, stage_id)

**Indexes**:
- `idx_jct_prog_stages_program` (program_id)
- `idx_jct_prog_stages_stage` (stage_id)

### Content Relationships

#### jct_event_sectors
**Purpose**: Many-to-many relationship between events and sectors
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| event_id | uuid | Event reference | FK → cnt_events, NOT NULL |
| sector_id | uuid | Sector reference | FK → dim_sectors, NOT NULL |
| is_primary | boolean | Primary sector flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(event_id, sector_id)

#### jct_event_support_categories
**Purpose**: Many-to-many relationship between events and support categories
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| event_id | uuid | Event reference | FK → cnt_events, NOT NULL |
| support_category_id | uuid | Support category reference | FK → dim_support_categories, NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(event_id, support_category_id)

#### jct_content_sectors
**Purpose**: Many-to-many relationship between content and sectors
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| content_id | uuid | Content reference | FK → contents, NOT NULL |
| sector_id | uuid | Sector reference | FK → dim_sectors, NOT NULL |
| is_primary | boolean | Primary sector flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(content_id, sector_id)

#### jct_resource_sectors
**Purpose**: Many-to-many relationship between resources and sectors
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| resource_id | uuid | Resource reference | FK → cnt_resources, NOT NULL |
| sector_id | uuid | Sector reference | FK → dim_sectors, NOT NULL |
| is_primary | boolean | Primary sector flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(resource_id, sector_id)

#### jct_investment_sectors
**Purpose**: Many-to-many relationship between investments and sectors
**Type**: Junction Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, NOT NULL |
| investment_id | uuid | Investment reference | FK → mktplc_investment_opportunities, NOT NULL |
| sector_id | uuid | Sector reference | FK → dim_sectors, NOT NULL |
| is_primary | boolean | Primary sector flag | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT now() |

**Constraints**:
- UNIQUE(investment_id, sector_id)

---

## Views

### Ecosystem Views

#### v_eco_organizations_by_type
**Purpose**: All organizations grouped by type
**Type**: View
**Base Table**: eco_business_directory

#### v_eco_support_entities
**Purpose**: Support entities only
**Type**: View
**Base Table**: eco_business_directory
**Filter**: organization_type = 'support_entity'

#### v_eco_associations
**Purpose**: Business associations only
**Type**: View
**Base Table**: eco_business_directory
**Filter**: organization_type = 'association'

#### v_eco_economic_zones
**Purpose**: Economic zones only
**Type**: View
**Base Table**: eco_zones
**Filter**: location_type = 'economic_zone'

#### v_eco_attractions
**Purpose**: Attractions only
**Type**: View
**Base Table**: eco_zones
**Filter**: location_type = 'attraction'

### Content Views

#### v_cnt_business_insights
**Purpose**: Business insight content
**Type**: View
**Base Table**: contents
**Filter**: content_subtype = 'business_insight'

#### v_cnt_success_stories
**Purpose**: Success story content
**Type**: View
**Base Table**: contents
**Filter**: content_subtype = 'success_story'

#### v_cnt_news
**Purpose**: News content
**Type**: View
**Base Table**: contents
**Filter**: content_subtype = 'news'

#### v_cnt_featured_content
**Purpose**: Featured content
**Type**: View
**Base Table**: contents
**Filter**: is_featured = true
**Order**: published_at DESC

#### v_cnt_active_events
**Purpose**: Active/upcoming events
**Type**: View
**Base Table**: cnt_events
**Filter**: status = 'Upcoming' AND date >= CURRENT_DATE
**Order**: date ASC

#### v_cnt_metrics_latest
**Purpose**: Latest metrics by code
**Type**: View
**Base Table**: cnt_metrics
**Logic**: DISTINCT ON (metric_code) with latest date ordering

---

## Materialized Views

#### mv_regional_highlights
**Purpose**: Regional statistics and highlights
**Type**: Materialized View
**Refresh**: Manual

| Column | Type | Description |
|--------|------|-------------|
| emirate_id | uuid | Emirate reference |
| name | text | Emirate name |
| founders_count | integer | Number of founders |
| featured_founder | text | Featured founder name |
| statistics | jsonb | Regional statistics |

**Indexes**:
- `idx_mv_regional_highlights` (emirate_id)

---

## RBAC Functions and Policies

### Helper Functions (v2.0)

#### get_current_user_org_id()
**Purpose**: Returns current user's organization ID from app settings
**Type**: Security Function
**Returns**: UUID

#### get_current_customer_type()
**Purpose**: Returns current user's customer type from app settings
**Type**: Security Function
**Returns**: TEXT

#### get_current_user_role()
**Purpose**: Returns current user's role from app settings
**Type**: Security Function
**Returns**: TEXT

#### is_enterprise_user()
**Purpose**: Checks if current user is enterprise type
**Type**: Security Function
**Returns**: BOOLEAN

#### is_staff_with_allowed_org()
**Purpose**: Checks if current user is staff with allowed organization
**Type**: Security Function
**Returns**: BOOLEAN
**Notes**: Allows access for staff from 'DigitalQatalyst' or 'Front Operations'

#### is_partner_user()
**Purpose**: Checks if current user is partner type
**Type**: Security Function
**Returns**: BOOLEAN

### Automatic Field Population

#### set_org_and_creator()
**Purpose**: Automatically sets organisation_id and created_by on insert
**Type**: Trigger Function
**Usage**: Applied to content and business entity tables

### Organization Scoping

All major tables now include `organisation_id` for multi-tenant data isolation:
- `cnt_contents.organisation_id`
- `mktplc_services.organisation_id`
- `eco_business_directory.organisation_id`
- `eco_zones.organisation_id`
- `eco_growth_areas.organisation_id`

### Customer Types and Access Levels

1. **staff** - Platform staff with administrative access
2. **partner** - Business partners with limited access
3. **enterprise** - Enterprise customers with full access to their data
4. **customer** - Regular customers with basic access

### User Roles

1. **admin** - Full administrative access within organization
2. **approver** - Can approve/reject content and services
3. **creator** - Can create and edit content
4. **contributor** - Can contribute to existing content
5. **viewer** - Read-only access

---

## Extension Guidelines

### Adding New Features

#### 1. Determine Feature Domain
Choose appropriate prefix based on feature type:
- `eco_` - Core ecosystem features
- `cnt_` - Content-related features
- `comm_` - Community features
- `mktplc_` - Marketplace features
- `geo_` - Geographic features
- `analytics_` - Analytics features
- `notification_` - Notification features
- `user_` - User management features

#### 2. Create Core Table
Follow the established pattern with RBAC considerations:
```sql
CREATE TABLE feature_[table_name] (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Core fields
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  -- Status fields
  status text DEFAULT 'active',
  is_active boolean DEFAULT true,
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}',
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Foreign keys
  created_by uuid REFERENCES users(id),
  organisation_id uuid REFERENCES organisations(id), -- v2.0 RBAC
  organization_id uuid REFERENCES eco_business_directory(id) -- Legacy
);
```

#### 3. Add Dimension Relationships
If the feature needs categorization:
- Add foreign keys to dimension tables
- Create junction tables for many-to-many relationships
- Follow naming convention: `jct_[feature]_[dimension]`

#### 4. Create Indexes
Add appropriate indexes including RBAC indexes:
```sql
-- Primary indexes
CREATE INDEX idx_[table]_slug ON [table](slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_[table]_status ON [table](status);
CREATE INDEX idx_[table]_tags ON [table] USING gin(tags);

-- Foreign key indexes
CREATE INDEX idx_[table]_org ON [table](organization_id);
CREATE INDEX idx_[table]_created_by ON [table](created_by);
CREATE INDEX idx_[table]_organisation_id ON [table](organisation_id); -- v2.0 RBAC

-- Composite indexes for RBAC queries
CREATE INDEX idx_[table]_org_created_by ON [table](organisation_id, created_by);
```

#### 5. Add Views
Create relevant views for common queries:
```sql
CREATE VIEW v_[feature]_[filter] AS
SELECT * FROM [table] WHERE [condition];
```

#### 5. Add RBAC Support (v2.0)
For tables that need organization-scoped access:
```sql
-- Add organization scoping column
ALTER TABLE [table] ADD COLUMN organisation_id uuid REFERENCES organisations(id);

-- Create trigger for automatic field population
CREATE TRIGGER trigger_set_org_and_creator_[table]
    BEFORE INSERT ON [table]
    FOR EACH ROW
    EXECUTE FUNCTION set_org_and_creator();

-- Create RLS policies (if needed)
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY [table]_org_policy ON [table]
    FOR ALL TO authenticated
    USING (organisation_id = get_current_user_org_id());
```

#### 6. Update Documentation
- Add table to this data dictionary
- Document relationships and RBAC considerations
- Update schema comments
- Add to migration scripts
- Document any RLS policies

### Common Patterns

#### Audit Fields
All tables should include:
- `created_at timestamptz DEFAULT now()`
- `updated_at timestamptz DEFAULT now()`
- `created_by uuid REFERENCES users(id)`

#### Soft Deletes
For tables that need soft delete capability:
- `deleted_at timestamptz`
- `is_deleted boolean DEFAULT false`

#### Versioning
For content that needs versioning:
- `version integer DEFAULT 1`
- `parent_id uuid REFERENCES [table](id)`
- `is_current boolean DEFAULT true`

#### Multilingual Support
For content that needs multiple languages:
- `language text DEFAULT 'en'`
- `translation_id uuid` (for grouping translations)

#### Geographic Support
For location-aware features:
- `coordinates point`
- `emirate_id uuid REFERENCES geo_emirates(id)`
- `location_id uuid REFERENCES eco_zones(id)`

### Naming Conventions

#### Table Names
- Use snake_case
- Include appropriate prefix
- Be descriptive but concise
- Use plural for entity tables
- Use singular for dimension tables

#### Column Names
- Use snake_case
- Be descriptive
- Use consistent naming across tables
- Use standard suffixes:
  - `_id` for foreign keys
  - `_at` for timestamps
  - `_count` for counters
  - `_url` for URLs
  - `_json` for JSON fields

#### Index Names
- Format: `idx_[table]_[column(s)]`
- Include table prefix
- Be descriptive
- Use abbreviations for common terms

#### Constraint Names
- Format: `[table]_[column]_[type]`
- Include table prefix
- Use descriptive names
- Be consistent across schema

---

## Data Types Reference

### Common Types
- `uuid` - Primary keys and foreign keys
- `text` - Variable length text
- `jsonb` - JSON data with indexing
- `timestamptz` - Timestamps with timezone
- `point` - Geographic coordinates
- `boolean` - True/false values
- `numeric` - Decimal numbers
- `integer` - Whole numbers
- `text[]` - Array of text values

### JSONB Usage
Use JSONB for:
- Flexible metadata storage
- Nested object data
- Configuration data
- Complex relationships

### Array Usage
Use arrays for:
- Tags and categories
- Multiple values of same type
- Simple lists

### Geographic Data
Use `point` type for:
- Latitude/longitude coordinates
- Single location points

Use `jsonb` for:
- Complex geographic data
- GeoJSON objects
- Bounding boxes

---

## Security Considerations

### Row Level Security (RLS)
- Enable RLS on all user-facing tables
- Create appropriate policies
- Test policies thoroughly

### Data Privacy
- Mark sensitive fields appropriately
- Implement data retention policies
- Consider GDPR compliance

### Access Control
- Use foreign key constraints
- Implement proper user roles
- Audit data access

---

## Performance Considerations

### Indexing Strategy
- Index foreign keys
- Index frequently queried columns
- Use composite indexes for multi-column queries
- Use GIN indexes for JSONB and arrays
- Use GIST indexes for geographic data

### Query Optimization
- Use appropriate data types
- Normalize data properly
- Consider denormalization for performance
- Use materialized views for complex aggregations

### Monitoring
- Monitor query performance
- Track index usage
- Identify slow queries
- Regular maintenance

---

This data dictionary serves as the foundation for extending the Enterprise Journey Platform with new features while maintaining consistency and best practices.
