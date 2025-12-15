# Review Workflow Tests

This directory contains comprehensive tests for the ReviewCommentsModule functionality across all features.

## Test Groups

### 1. Content Management (`content-management.test.ts`)
- Pagination functionality (10 entries per page)
- Status transitions (Draft → Pending Review → Published → Archived)
- Comments functionality
- Audit trail display and formatting
- Reviewer assignment and reassignment
- RBAC enforcement for content
- Integration with ContentDetailsDrawer

### 2. Service Management (`service-management.test.ts`)
- Status mapping (includes Step 2 Pending for Financial services)
- Pagination
- RBAC enforcement for services
- Status transitions (including Financial service workflow)
- Integration with ServiceDetailsDrawer
- Comments and audit trail

### 3. Business Directory (`business-directory.test.ts`)
- Status mapping (Active/Featured → Published, Pending → Pending Review)
- Status reverse mapping
- RBAC enforcement for businesses
- Status transitions
- Integration with BusinessDetailsDrawer
- Comments and audit trail (no archive/reject functionality)

### 4. Listing Approvals (`listing-approvals.test.ts`)
- Status mapping (Approved → Published, Rejected → Rejected)
- Status reverse mapping
- RBAC enforcement (uses Service permissions)
- Status transitions
- Integration with ListingDetailsDrawer
- Comments and audit trail

## Running Tests

### Run all review workflow tests:
```bash
npm test -- tests/review-workflow
```

### Run tests for a specific feature:
```bash
npm test -- tests/review-workflow/content-management.test.ts
npm test -- tests/review-workflow/service-management.test.ts
npm test -- tests/review-workflow/business-directory.test.ts
npm test -- tests/review-workflow/listing-approvals.test.ts
```

### Run with coverage:
```bash
npm test -- --coverage tests/review-workflow
```

## Test Coverage

### Core Functionality
- ✅ Pagination (10 entries per page, page navigation, reset on item change)
- ✅ Status transitions (all status changes with idempotency)
- ✅ Comments (submit, display, validation)
- ✅ Audit trail (display, formatting, chronological order)
- ✅ Reviewer assignment (auto-assign, display, reassign)

### RBAC Testing
- ✅ Internal Admin (all permissions)
- ✅ Internal Approver (approve and publish)
- ✅ Partner Admin (approve but cannot publish)
- ✅ Partner Viewer (read-only)
- ✅ Segment-based permissions (flag for review)

### Integration Testing
- ✅ Drawer integration (tab display, module rendering)
- ✅ Parent component refresh on status change
- ✅ Toast notifications
- ✅ Status mapping and reverse mapping

## Notes

1. **Status Mapping**: Each feature has unique status mappings that convert between feature-specific statuses and the unified review workflow statuses.

2. **Table Names**: 
   - Content: `cnt_contents`
   - Services: `mktplc_services`
   - Businesses: `eco_business_directory`
   - Listings: `mktplc_services` (same as services)

3. **Special Cases**:
   - Financial services have a 2-step approval process
   - Businesses don't have archived/rejected statuses
   - Listings use Service permissions for RBAC

4. **Pagination**: All audit trails use 10 entries per page with proper pagination controls.

5. **Idempotency**: Status transitions prevent duplicate actions when status is already at target state.

6. **RBAC Notes**:
   - **Content**: Partner Admin cannot publish (explicit restriction), but can approve
   - **Service**: Partner Admin can publish (via 'manage all' - no explicit restriction like Content)
   - **Service/Listing Approvers**: Can approve but cannot publish (publish is only for Content)
   - **Business**: Uses CRUD permissions, not explicit approve/publish actions
