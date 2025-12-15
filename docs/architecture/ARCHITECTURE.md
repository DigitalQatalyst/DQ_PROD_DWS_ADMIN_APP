# Platform Admin Dashboard - Architecture Documentation

## 🏗️ System Architecture

### Overview

The Platform Admin Dashboard is built with a modular, scalable architecture that supports multiple database backends through a unified abstraction layer.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Components Layer                           ││
│  │  • Service Management  • Business Directory            ││
│  │  • Growth Areas        • Content Management            ││
│  │  • Zones & Clusters    • Dashboard                     ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Application Layer                          ││
│  │  • AuthContext (RBAC)  • useCRUD Hook                  ││
│  │  • Toast System        • Loading States                ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │          Database Abstraction Layer (dbClient)          ││
│  │  Unified interface for both Supabase and Azure         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────┬────────────────
                            ↓                 ↓
                 ┌──────────────────┐  ┌─────────────────────┐
                 │    Supabase      │  │  Azure PostgreSQL   │
                 │   (Development)  │  │ (Staging/Production)│
                 └──────────────────┘  └─────────────────────┘
```

## 📂 Directory Structure

```
src/
├── components/           # UI Components
│   ├── ServiceManagementPage.tsx
│   ├── BusinessDirectoryPage.tsx
│   ├── GrowthAreasPage.tsx
│   ├── ContentManagementPage.tsx
│   ├── ZonesClustersPage.tsx
│   ├── ui/              # Reusable UI components
│   │   ├── Toast.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── StatusBadge.tsx
│   │   └── EmptyState.tsx
│   └── ...
├── context/             # React Context Providers
│   ├── AuthContext.tsx  # Authentication & RBAC
│   ├── AppContext.tsx   # Application State
│   └── DarkModeContext.tsx
├── hooks/               # Custom React Hooks
│   └── useCRUD.ts       # CRUD operations hook
├── lib/                 # Core Libraries
│   └── dbClient.ts      # Database abstraction layer
├── types/               # TypeScript Type Definitions
│   └── index.ts         # Shared types
├── utils/               # Utility Functions
│   └── mockData.ts      # Mock/Fallback data
└── pages/               # Page-level components
    └── ...
```

## 🔧 Core Components

### 1. Database Abstraction Layer (`src/lib/dbClient.ts`)

**Purpose**: Provides a unified interface for database operations that works across different backends.

**Key Features**:
- Environment-aware client initialization
- Supabase adapter for development
- Azure adapter for staging/production
- Consistent query builder interface

**Usage Example**:
```typescript
import dbClient from '@/lib/dbClient';

// Works the same in all environments
const { data, error } = await dbClient
  .from('services')
  .select('*')
  .eq('status', 'Published');
```

### 2. CRUD Hook (`src/hooks/useCRUD.ts`)

**Purpose**: Provides a reusable hook for common database operations.

**Features**:
- List with filtering and pagination
- Get by ID
- Create, Update, Delete operations
- Bulk operations
- Automatic error handling
- Loading states

**API**:
```typescript
const {
  data,           // Array of records
  loading,        // Loading state
  error,          // Error object
  total,          // Total count
  list,           // List records
  getById,        // Get single record
  create,         // Create new record
  update,         // Update record
  remove,         // Delete record
  bulkCreate,     // Bulk create
  bulkUpdate,     // Bulk update
  bulkRemove,     // Bulk delete
  refresh         // Refresh current query
} = useCRUD<T>('table_name');
```

### 3. Authentication Context (`src/context/AuthContext.tsx`)

**Purpose**: Manages user authentication and role-based access control.

**Features**:
- User session management
- Role-based permissions
- Permission checking methods
- Persistent storage

**API**:
```typescript
const {
  user,                    // Current user object
  role,                    // Current user role
  isLoading,               // Auth loading state
  isAuthenticated,         // Authentication status
  login,                   // Login method
  logout,                  // Logout method
  setRole,                 // Change role
  hasPermission,           // Check single permission
  hasAnyPermission,        // Check if has any of permissions
  hasAllPermissions,       // Check if has all permissions
  canAccess                // Check role-based access
} = useAuth();
```

## 🔐 RBAC System

### Role Hierarchy

```
admin
  ├── create
  ├── edit
  ├── approve
  ├── delete
  ├── view
  ├── publish
  ├── unpublish
  └── archive

approver
  ├── view
  ├── review
  ├── approve
  └── comment

creator
  ├── create
  ├── edit
  ├── submit
  ├── view
  └── comment

contributor
  ├── edit
  ├── view
  └── comment

viewer
  └── view
```

### Permission Enforcement

**Component Level**:
```typescript
{hasPermission('create') && <CreateButton />}
{canAccess(['admin', 'approver']) && <AdminPanel />}
```

**Function Level**:
```typescript
const handleApprove = async () => {
  if (!hasPermission('approve')) {
    showToast('error', 'No permission');
    return;
  }
  // Proceed with approval...
};
```

## 🗄️ Data Models

### Entity Relationships

```
services
  ├── partnerInfo (embedded)
  ├── comments (array)
  └── activityLog (array)

businesses
  ├── address (embedded)
  ├── socialMedia (embedded)
  ├── keyPeople (array)
  ├── products (array)
  ├── financials (embedded)
  └── licenseInfo (embedded)

growth_areas
  ├── keyStatistics (array)
  ├── growthProjection (embedded)
  ├── economicImpact (array)
  └── comparativeAnalysis (embedded)

content
  ├── tags (array)
  └── metadata (embedded)

zones
  ├── contactInfo (embedded)
  ├── keyFeatures (array)
  ├── industries (array)
  └── benefits (array)

activity_logs
  └── belongs to any entity (polymorphic)
```

## 🔄 State Management

### Local Component State
Used for:
- UI-specific state (modals, drawers)
- Form inputs
- Filters and search queries
- Pagination state

### Context State
Used for:
- User authentication
- User permissions
- Global application settings
- Theme preferences

### Server State (via useCRUD)
Used for:
- Database records
- Loading states
- Error handling
- Cache management

## 🎨 UI Component Patterns

### Container/Presenter Pattern

**Container** (Smart Component):
```typescript
const ServiceManagementPage = () => {
  const { data, loading, error, list } = useCRUD<Service>('services');
  const { hasPermission } = useAuth();
  
  useEffect(() => {
    list();
  }, []);
  
  return <ServiceList services={data} loading={loading} />;
};
```

**Presenter** (Dumb Component):
```typescript
const ServiceList = ({ services, loading }) => {
  if (loading) return <Skeleton />;
  return services.map(service => <ServiceCard key={service.id} {...service} />);
};
```

### Drawer Pattern
Used for detailed views and editing:
- Service Details Drawer
- Business Details Drawer
- Zone Details Drawer
- Content Details Drawer

### Modal Pattern
Used for confirmations and quick actions:
- Approve Modal
- Reject Modal
- Send Back Modal
- Confirm Dialog

## 🚀 Performance Optimizations

### 1. Code Splitting
```typescript
const ServiceManagementPage = lazy(() => import('./ServiceManagementPage'));
```

### 2. Memo and Callback Optimization
```typescript
const memoizedValue = useMemo(() => expensiveComputation(), [deps]);
const memoizedCallback = useCallback(() => handleAction(), [deps]);
```

### 3. Pagination
All list views support pagination to limit data fetching.

### 4. Debounced Search
Search queries are debounced to reduce API calls.

### 5. Fallback Data
Mock data is used as fallback when database is unavailable.

## 🔌 API Integration

### Development (Supabase)
Direct client-side connection to Supabase.

### Production (Azure)
API layer with endpoints:

```
GET    /api/{entity}              - List entities
GET    /api/{entity}/:id          - Get single entity
POST   /api/{entity}              - Create entity
PUT    /api/{entity}/:id          - Update entity
DELETE /api/{entity}/:id          - Delete entity
POST   /api/query                 - Custom SQL query
```

## 🧪 Testing Strategy

### Unit Tests
- Test pure functions in utils
- Test custom hooks in isolation
- Test type definitions

### Integration Tests
- Test database abstraction layer
- Test CRUD operations
- Test authentication flows

### E2E Tests
- Test complete user workflows
- Test RBAC enforcement
- Test data persistence

## 🔐 Security Considerations

### 1. Row Level Security (RLS)
Implemented in Supabase for data isolation.

### 2. API Authentication
Backend API requires authentication tokens.

### 3. CORS Configuration
Strict CORS policies in production.

### 4. Input Validation
Client and server-side validation.

### 5. SQL Injection Prevention
Parameterized queries only.

## 📊 Monitoring & Logging

### Client-Side Logging
```typescript
console.error('Failed to load services:', error);
```

### Activity Logging
All actions are logged in `activity_logs` table:
```typescript
{
  entity_type: 'service',
  entity_id: 'uuid',
  action: 'approved',
  performed_by: 'user@example.com',
  details: { ... },
  created_at: timestamp
}
```

## 🔄 Deployment Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Development  │────→│   Staging    │────→│  Production  │
│  (Supabase)  │     │ (Azure Test) │     │ (Azure Prod) │
└──────────────┘     └──────────────┘     └──────────────┘
      ↓                     ↓                     ↓
   Local Dev          QA Testing          Live Users
   Auto-deploy        Manual Approval     Manual Approval
```

## 🎯 Best Practices

### 1. Component Design
- Keep components small and focused
- Use composition over inheritance
- Implement error boundaries

### 2. State Management
- Lift state up when needed
- Use context for global state
- Keep server state separate

### 3. Performance
- Lazy load components
- Memoize expensive computations
- Virtualize long lists

### 4. Type Safety
- Define explicit types
- Avoid `any` type
- Use strict TypeScript config

### 5. Error Handling
- Always handle errors
- Provide user feedback
- Log errors for debugging

## 📝 Code Style Guide

### TypeScript
```typescript
// Use interfaces for object types
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions and primitives
type UserRole = 'admin' | 'approver' | 'creator';

// Use enums sparingly
enum Status {
  Active = 'active',
  Inactive = 'inactive'
}
```

### React Components
```typescript
// Use function components with TypeScript
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return <div>...</div>;
};
```

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `index.ts` or `types.ts`

## 🔮 Future Enhancements

1. **GraphQL API Layer**: Replace REST with GraphQL for more efficient data fetching
2. **Real-time Updates**: Implement WebSocket connections for live data
3. **Offline Support**: Add service workers for offline functionality
4. **Advanced Analytics**: Integrate analytics dashboard
5. **Multi-tenancy**: Support multiple organizations
6. **Audit Trail**: Enhanced activity logging with full audit capabilities
7. **Export Functionality**: Export data to CSV, PDF, Excel
8. **Advanced Search**: Full-text search with filters
9. **Batch Operations**: Bulk actions on multiple records
10. **API Documentation**: Auto-generated API docs

## 📚 References

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Azure PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)

