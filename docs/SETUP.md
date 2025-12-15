# Platform Admin Dashboard - Setup Guide

## 🚀 Quick Start

This Platform Admin Dashboard is built with React, TypeScript, and Vite. It supports multiple database backends through a unified abstraction layer.

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Latest version
- **Git**: For version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ready_to_Review_v48_KF_Platform-Admin-Dashboard_SR-
```

### 2. Install Dependencies

```bash
npm install
```

## ⚙️ Environment Configuration

### Development Environment (Supabase)

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Configure your Supabase credentials:

```env
# Environment Configuration
VITE_ENVIRONMENT=dev

# Supabase Configuration (Development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Staging/Production Environment (Azure PostgreSQL)

For staging and production deployments:

```env
# Environment Configuration
VITE_ENVIRONMENT=staging  # or 'prod'

# Azure PostgreSQL Configuration
VITE_AZURE_POSTGRES_URL=postgresql://user:password@server.postgres.database.azure.com:5432/database?ssl=true

# API Base URL (Backend API Layer)
VITE_API_BASE_URL=https://your-api.azurewebsites.net/api
```

## 🗄️ Database Setup

### Supabase Setup (Development)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Create Database Tables**

The project includes complete SQL schema and seed files. Run them in your Supabase SQL Editor:

**Method 1: Copy-Paste (Recommended)**
1. Open Supabase SQL Editor
2. Copy contents of `database/db.schema.sql`
3. Paste and execute
4. Copy contents of `database/db.seed.sql`
5. Paste and execute

**Method 2: Using psql (Advanced)**
```bash
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f database/db.schema.sql
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f database/db.seed.sql
```

Alternatively, if you prefer to write the SQL manually, here's a minimal schema:

```sql
-- Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Financial', 'Non-Financial')),
  partner TEXT NOT NULL,
  category TEXT NOT NULL,
  processing_time TEXT,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Pending', 'Step 2 Pending', 'Published', 'Unpublished', 'Rejected', 'Sent Back', 'Archived')),
  applicants INTEGER DEFAULT 0,
  feedback JSONB DEFAULT '{"rating": 0, "count": 0}'::jsonb,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  eligibility TEXT[],
  application_requirements TEXT[],
  fee TEXT,
  regulatory_category TEXT,
  documents_required TEXT[],
  outcome TEXT,
  partner_info JSONB,
  comments JSONB DEFAULT '[]'::jsonb,
  activity_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses Table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Government', 'Semi-Government', 'Private')),
  industry TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('Small', 'Medium', 'Large', 'Enterprise')),
  status TEXT NOT NULL CHECK (status IN ('Active', 'Featured', 'Pending', 'Inactive')),
  founded_year TEXT,
  logo TEXT,
  description TEXT,
  address JSONB,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB,
  key_people JSONB DEFAULT '[]'::jsonb,
  employees TEXT,
  products JSONB DEFAULT '[]'::jsonb,
  target_markets TEXT[],
  certifications TEXT[],
  financials JSONB,
  license_info JSONB,
  business_hours JSONB,
  additional_locations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Growth Areas Table
CREATE TABLE growth_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Strategic', 'Emerging', 'Traditional')),
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Growing', 'Accelerating', 'Stable', 'Declining')),
  growth_rate DECIMAL(5,2),
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  icon JSONB,
  icon_color TEXT,
  icon_bg_color TEXT,
  description TEXT,
  key_statistics JSONB DEFAULT '[]'::jsonb,
  growth_projection JSONB,
  associated_zones TEXT[],
  key_players TEXT[],
  associated_businesses TEXT[],
  economic_impact JSONB DEFAULT '[]'::jsonb,
  employment JSONB DEFAULT '[]'::jsonb,
  market_trends TEXT[],
  comparative_analysis JSONB,
  industry_breakdown JSONB DEFAULT '[]'::jsonb,
  investment_opportunities TEXT[],
  support_programs TEXT[],
  contact_information JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Article', 'Event', 'Resource', 'Banner', 'Page', 'Campaign', 'Email')),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Published', 'Archived')),
  author TEXT NOT NULL,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  content TEXT,
  category TEXT,
  tags TEXT[],
  featured_image TEXT,
  publish_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones Table
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Free Zone', 'Economic Zone', 'Industrial Zone', 'Technology Zone')),
  region TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Under Development', 'Planned')),
  established_date DATE,
  size TEXT,
  description TEXT,
  key_features TEXT[],
  industries TEXT[],
  benefits TEXT[],
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_businesses_industry ON businesses(industry);
CREATE INDEX idx_growth_areas_type ON growth_areas(type);
CREATE INDEX idx_growth_areas_category ON growth_areas(category);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_zones_type ON zones(type);
CREATE INDEX idx_zones_status ON zones(status);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies (Example - adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON services FOR UPDATE USING (auth.role() = 'authenticated');

-- See database/db.schema.sql for complete schema with all policies
```

3. **Verify Installation**

After running the SQL files, verify your setup:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data counts
SELECT 
    (SELECT COUNT(*) FROM organizations) as organizations,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM business_directory) as businesses,
    (SELECT COUNT(*) FROM zones) as zones,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM contents) as contents;
```

Expected output:
- organizations: 5
- users: 5
- businesses: 5
- zones: 4
- services: 5
- contents: 5

4. **Test Users**

The seed data includes test user profiles. **Note**: You'll need to create corresponding Supabase Auth users separately.

**Database Users (`auth_user_profiles` table):**
- Customer Type: `staff` (frontend shows as `internal`)
  - Email: admin@platform.com, Role: `admin`
  - Email: approver@platform.com, Role: `approver`
  
- Customer Type: `partner`
  - Email: creator@partner.com, Role: `creator` (frontend maps to `editor`)
  - Email: contributor@partner.com, Role: `contributor` (frontend maps to `editor`)
  
- Customer Type: `enterprise` (frontend shows as `customer`)
  - Email: viewer@example.com, Role: `viewer`

**Important**: 
- The database uses `customer_type`, frontend uses `user_segment`
- `staff` is mapped to `internal` in the frontend
- `enterprise` is mapped to `customer` in the frontend
- `creator` and `contributor` roles are both mapped to `editor` in the frontend

### Azure PostgreSQL Setup (Staging/Production)

1. **Create Azure PostgreSQL Database**
   - Go to Azure Portal
   - Create a new Azure Database for PostgreSQL (Flexible Server)
   - Note your connection string

2. **Run Migrations**

The same SQL files work for Azure PostgreSQL:

```bash
# Using psql
psql "postgresql://username:password@servername.postgres.database.azure.com:5432/database?sslmode=require" -f database/db.schema.sql

psql "postgresql://username:password@servername.postgres.database.azure.com:5432/database?sslmode=require" -f database/db.seed.sql
```

**Important**: Update RLS policies for Azure deployment as auth functions work differently.

3. **Create Backend API**

For Azure deployments, you'll need a backend API layer to handle database operations. The frontend will communicate with this API.

Example API endpoints structure:
```
POST /api/services - List/filter services
POST /api/services/:id - Get service by ID
POST /api/services/create - Create new service
POST /api/services/:id/update - Update service
POST /api/services/:id/delete - Delete service
```

## 👤 Authentication & RBAC

### Customer Types (Database: customer_type)

The database categorizes users by their organizational relationship:

| Type | Description | Frontend Maps To |
|------|-------------|------------------|
| `staff` | Platform staff/admin users | `internal` |
| `partner` | Service provider organizations | `partner` |
| `enterprise` | Enterprise end users | `customer` |
| `advisor` | Consultant/advisor users | `advisor` |

**Important**: The frontend uses `user_segment` terminology (with `internal`, `customer` values) even though the database field is `customer_type`.

### Role Definitions

The application supports role-based access control. The database allows 5 roles, which the frontend normalizes to 4:

**Database Roles:**
- `admin` - Full access to all features
- `approver` - Can approve/reject content
- `creator` - Can create and edit content
- `contributor` - Can edit content
- `viewer` - Read-only access

**Frontend Normalization:**
- `creator` and `contributor` are both mapped to `editor` in the frontend
- `admin`, `approver`, and `viewer` remain unchanged

See [PERMISSIONS_REFERENCE.md](./iam/PERMISSIONS_REFERENCE.md) for the complete permission matrix.

### Setting Up User Roles

During development, roles are managed through localStorage. In production, integrate with your authentication provider (Supabase Auth, Azure AD, etc.).

**Development Login Simulation:**

```typescript
// In browser console or login component
const mockUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};
localStorage.setItem('platform_admin_user', JSON.stringify(mockUser));
localStorage.setItem('platform_admin_role', 'admin');
```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔄 Environment Switching

The application automatically detects the environment based on `VITE_ENVIRONMENT`:

- **`dev`**: Uses Supabase directly from the browser
- **`staging`/`prod`**: Uses Azure PostgreSQL via API layer

To switch environments:

1. Update `.env`:
   ```env
   VITE_ENVIRONMENT=staging
   ```

2. Restart the development server

## 📁 Database Files

The project includes two main database files:

### `database/db.schema.sql`

Complete database schema including:
- ✅ 9 core tables (organizations, users, business_directory, clusters, zones, growth_areas, services, contents, activity_logs)
- ✅ All relationships and foreign keys
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update triggers
- ✅ Helper functions
- ✅ Common views

### `database/db.seed.sql`

Sample data for testing:
- ✅ 5 organizations
- ✅ 5 users (one per role)
- ✅ 5 businesses
- ✅ 4 clusters
- ✅ 4 zones
- ✅ 4 growth areas
- ✅ 5 services
- ✅ 5 contents
- ✅ 8 activity logs

## 📊 Database Client Usage

### Basic CRUD Operations

```typescript
import { useCRUD } from '../hooks/useCRUD';
import { Service } from '../types';

function MyComponent() {
  const { data, loading, error, list, create, update, remove } = useCRUD<Service>('services');

  // List all services
  useEffect(() => {
    list({}, { page: 1, pageSize: 10, sortBy: 'created_at', sortOrder: 'desc' });
  }, []);

  // Create a new service
  const handleCreate = async () => {
    await create({ title: 'New Service', type: 'Financial', ... });
  };

  // Update a service
  const handleUpdate = async (id: string) => {
    await update(id, { status: 'Published' });
  };

  // Delete a service
  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data.map(item => <div key={item.id}>{item.title}</div>)}
    </div>
  );
}
```

### Advanced Filtering

```typescript
// Filter with complex criteria
await list({
  status: 'Published',
  type: 'Financial',
  search: 'loan',
  dateFrom: '2023-01-01',
  dateTo: '2023-12-31'
}, {
  page: 1,
  pageSize: 25,
  sortBy: 'submitted_on',
  sortOrder: 'desc'
});
```

## 🔐 RBAC Usage

### Component-Level Access Control

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { hasPermission, canAccess, role } = useAuth();

  return (
    <div>
      {/* Show button only if user has 'create' permission */}
      {hasPermission('create') && (
        <button>Create New</button>
      )}

      {/* Show section only for admin and approver roles */}
      {canAccess(['admin', 'approver']) && (
        <div>Admin Controls</div>
      )}

      {/* Current user role */}
      <p>Your role: {role}</p>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Database Connection Issues

**Issue**: "Database client not initialized"
**Solution**: 
1. Check that your `.env` file has the correct credentials
2. Verify Supabase project URL and anon key
3. Ensure environment variable starts with `VITE_` prefix

### CORS Errors (Azure Deployment)

**Issue**: CORS errors when connecting to Azure PostgreSQL API
**Solution**:
1. Configure CORS in your Azure API
2. Add your frontend domain to allowed origins
3. Ensure API is accessible from your frontend URL

### Data Not Loading

**Issue**: Data shows "No records found"
**Solution**:
1. The app falls back to mock data when database connection fails
2. Check browser console for errors
3. Verify table names match in database
4. Check RLS policies in Supabase

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## 🤝 Support

For issues or questions, please contact the development team or create an issue in the repository.

## 📝 License

[Your License Here]

