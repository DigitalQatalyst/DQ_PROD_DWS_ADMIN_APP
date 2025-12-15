# RBAC Claims Configuration and Validation

## Overview

This document outlines the RBAC (Role-Based Access Control) configuration for the Platform Admin Dashboard, including how Azure B2C claims are validated and when access is denied.

**Critical Principle**: If any required claims are missing or invalid, the user will be **DENIED ACCESS** to the application entirely. No fallbacks or defaults are used.

**Important Database-to-Frontend Mapping**:
- Database stores: `customer_type` (staff, partner, enterprise, advisor) → Frontend uses: `user_segment` (internal, partner, customer, advisor)
- `staff` is mapped to `internal` in the frontend
- `enterprise` is mapped to `customer` in the frontend
- Database roles: admin, approver, creator, contributor, viewer → Frontend normalizes creator/contributor to `editor`
- See [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md) for complete mapping details

---

## Required Azure B2C Claims

The application requires the following claims to be present in the Azure B2C JWT token:

### 1. Customer Type Claim
- **Required**: YES
- **Fallback**: NONE - Access will be denied if missing
- **Valid Values**:
  - `staff` - Internal staff members
  - `partner` - External partner organizations
  - `enterprise` - Enterprise customers
- **Claim Keys Searched** (in order):
  1. `customerType`
  2. `extension_CustomerType`
  3. `extension_customerType`
  4. `customer_type`
  5. `user_type`
  6. `userType`
  7. `UserType`

**If this claim is missing or has an invalid value**: The user will see an "Access Denied" message and be unable to use any part of the application.

### 2. User Role Claim
- **Required**: YES
- **Fallback**: NONE - Defaults to 'unauthorized'
- **Valid Values**:
  - `admin` - Full access to all features
  - `approver` - Can approve/reject content
  - `creator` - Can create content
  - `contributor` - Can contribute to content
  - `viewer` - Read-only access
- **Claim Keys Searched** (in order):
  1. `User Role` (note the capital letters)
  2. `userRole`
  3. `extension_Role`
  4. `extension_role`
  5. `role`
  6. `Role`
  7. `user_role`
  8. `user_role_claim`

**If this claim is missing**: The user will be assigned 'unauthorized' role and will be denied access.

### 3. Organization Name Claim
- **Required**: YES
- **Fallback**: NONE - Access will be restricted if missing
- **Claim Keys Searched** (in order):
  1. `organisationName`
  2. `organizationName`
  3. `OrganizationName`
  4. `Company Name`
  5. `company`
  6. `companyName`
  7. `extension_OrganizationId`
  8. `extension_OrganizationName`
  9. `extension_organisationName`
  10. `extension_organizationName`
  11. `org`
  12. `organization`
  13. `organisation`
  14. `tenant`
  15. `tenantId`
  16. `tenant_id`

**If this claim is missing**: The user will be unable to access any organization-scoped data, even if other claims are valid.

### 4. Azure ID (Sub)
- **Required**: YES
- **Fallback**: Uses `oid` or `azure_id` if `sub` not present
- **Primary Key**: `sub`

---

## Claim Normalization Process

The application uses a claim normalizer (`src/auth/claimNormalizer.ts`) that:

1. **Reads Azure B2C JWT claims**
2. **Searches multiple possible claim keys** for each required field
3. **Returns `null` for missing claims** (no defaults)
4. **Lowercases and trims** string values for consistency

### Example Normalization

```typescript
Raw Azure JWT:
{
  "sub": "user-123",
  "email": "user@example.com",
  "Company Name": "MyOrg",      // Will be found
  "User Role": "Admin",         // Will be found and lowercased to "admin"
  // customerType not present
}

Normalized Output:
{
  azure_id: "user-123",
  email: "user@example.com",
  customerType: null,              // Missing - will deny access
  userRole: "admin",                // Found and normalized
  organisationName: "MyOrg"          // Found
}
```

---

## Access Control Validation

### Validation Flow

1. **Claims Received** → Normalized by `claimNormalizer.ts`
2. **Claims Validated** → Checked for required values
3. **Ability Built** → CASL ability created based on validated claims
4. **Access Granted/Denied** → Based on ability rules

### When Access is DENIED

Access is denied if:

1. **Missing customerType claim** → No fallback, access denied
2. **Invalid customerType** → Not in `['staff', 'partner', 'enterprise']`
3. **Missing organization name** → Cannot scope data
4. **Missing role claim** → Assigned 'unauthorized' role
5. **Invalid role** → Not in `['admin', 'approver', 'creator', 'contributor', 'viewer']`

### Access Denial Message

When access is denied, users will see:

```
❌ Access denied: Missing customer type claim in Azure token. 
   Please contact support to configure proper Azure claims for your account.
```

Or:

```
❌ Access denied: Invalid customer type "invalid_type". 
   Valid types: staff, partner, enterprise. Please contact support.
```

---

## CASL Permission Matrix

### Staff Users

| Role | Service | Content | Business | Zone | GrowthArea |
|------|---------|---------|----------|------|------------|
| admin | All | All | All | All | All |
| approver | Read + Approve | Read + Approve | Read | Read | Read |
| creator | Create + Read + Update (own) | Create + Read + Update (own) | Create + Read + Update (own) | Read | Read |
| contributor | Read + Update (own) | Read + Update (own) | Read + Update (own) | Read | Read |
| viewer | Read | Read | Read | Read | Read |

### Partner Users

| Role | Service | Content | Business | Zone | GrowthArea |
|------|---------|---------|----------|------|------------|
| admin | All | All | All | All | All |
| approver | Read + Approve | Read + Approve | Read | Read | Read |
| creator | Create + Read + Update (own) | Create + Read + Update (own) | Create + Read + Update (own) | Read | Read |
| contributor | Read + Update (own) | Read + Update (own) | Read + Update (own) | Read | Read |
| viewer | Read | Read | Read | Read | Read |

### Enterprise Users

| Role | Service | Content | Business | Zone | GrowthArea |
|------|---------|---------|----------|------|------------|
| admin | All | All | All | All | All |
| approver | Read + Approve | Read + Approve | Read | Read | Read |
| creator | Create + Read + Update (own) | Create + Read + Update (own) | Create + Read + Update (own) | Read | Read |
| contributor | Read + Update (own) | Read + Update (own) | Read + Update (own) | Read | Read |
| viewer | Read | Read | Read | Read | Read |

---

## Azure B2C Configuration

To configure Azure B2C to provide the required claims:

### Step 1: Define Custom Attributes

Create these custom attributes in Azure B2C:

1. **customerType** (String)
   - Name: `customerType`
   - Description: Controls customer type (staff/partner/enterprise)

2. **userRole** (String)
   - Name: `userRole`
   - Description: Controls user role (admin/approver/creator/contributor/viewer)

3. **organizationName** (String)
   - Name: `organizationName`
   - Description: Links user to organization

### Step 2: Configure User Flow Claims

In your Azure B2C User Flow:

1. Go to **User flow** → **Properties** → **User attributes and claims**
2. Under **Application claims**, select:
   - ✅ `customerType`
   - ✅ `userRole`
   - ✅ `organizationName`

### Step 3: Assign Values to Test Users

For testing, assign these values to test users:

**Staff Admin:**
```
customerType: staff
userRole: admin
organizationName: stafforg
```

**Partner Admin:**
```
customerType: partner
userRole: admin
organizationName: partner1org
```

**Enterprise Admin:**
```
customerType: enterprise
userRole: admin
organizationName: enterpriseorg
```

---

## Database RLS Configuration

The application uses Supabase Row Level Security (RLS) for database-level authorization.

### RLS Function: `get_org_id_from_claim()`

```sql
CREATE OR REPLACE FUNCTION public.get_org_id_from_claim() RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  org_name text;
  org_id uuid;
BEGIN
  -- Read org_name from JWT claim
  org_name := current_setting('jwt.claims.organization_name', true);
  
  -- Map it to org_id
  SELECT id INTO org_id
  FROM auth_organizations
  WHERE name = org_name;
  
  RETURN org_id;
END;
$$;
```

### Current Limitation

**IMPORTANT**: Supabase RLS is not currently working because:
1. Azure B2C tokens cannot be directly used with Supabase
2. The JWT claims (`organization_name`) are not available to the database RLS function
3. The application uses **client-side filtering** as a workaround

### Client-Side Filtering Workaround

Until RLS is properly configured, the application:

1. Retrieves the `organizationName` from localStorage
2. Looks up the organization ID from `auth_organizations` table
3. Applies `organization_id` filter in the Supabase query

This ensures users only see data belonging to their organization.

### Future RLS Configuration

To properly enable RLS, you need to:

1. **Create a Supabase function** that accepts Azure tokens
2. **Map Azure tokens** to Supabase sessions
3. **Set JWT claims** in the Supabase session so RLS can read them

This requires backend middleware between Azure and Supabase.

---

## Files Modified

### Claim Normalization
- `src/auth/claimNormalizer.ts` - Extracts and normalizes Azure claims

### Ability Building  
- `src/auth/ability.ts` - Builds CASL permissions based on claims
- Validates customerType strictly (no defaults)
- Provides user-friendly error messages

### Authentication Context
- `src/context/AuthContext.tsx` - Manages user authentication state
- Does NOT default to 'staff' - requires explicit claims
- Defaults to 'unauthorized' if role is missing

### Azure Authentication
- `src/components/AzureAuthProvider.tsx` - Handles Azure login
- Does NOT default customerType to 'staff'
- Stores claims in localStorage for persistence

### Database Filtering
- `src/hooks/useCRUD.ts` - CRUD operations with organization scoping
- Manually filters by organization_id (RLS workaround)

---

## Testing Claims Configuration

### Test Cases

1. **Valid Claims**
   ```
   customerType: partner
   userRole: admin
   organizationName: partner1org
   ```
   → ✅ Access granted

2. **Missing customerType**
   ```
   userRole: admin
   organizationName: partner1org
   ```
   → ❌ Access denied with clear error message

3. **Invalid customerType**
   ```
   customerType: unknown
   userRole: admin
   organizationName: partner1org
   ```
   → ❌ Access denied with message about valid types

4. **Missing role**
   ```
   customerType: partner
   organizationName: partner1org
   ```
   → ❌ Access denied (role defaults to 'unauthorized')

5. **Missing organization**
   ```
   customerType: partner
   userRole: admin
   ```
   → ⚠️ Access granted but no data visible (org filter fails)

---

## Common Issues and Solutions

### Issue 1: "customerType is null"
**Symptom**: Claims debugger shows `customerType: null`
**Cause**: Azure claim not configured or using wrong claim name
**Solution**: Configure `customerType` claim in Azure B2C user flow

### Issue 2: "Organization ID is null"
**Symptom**: User can log in but sees no data
**Cause**: Missing `organizationName` claim or organization doesn't exist in database
**Solution**: 
1. Configure `organizationName` claim in Azure
2. Ensure organization exists in `auth_organizations` table

### Issue 3: "Access Denied" for valid user
**Symptom**: User has valid claims but sees "Access Denied"
**Cause**: Invalid customerType or role value
**Solution**: Check console logs for specific error message and verify claim values match expected formats (lowercase, no extra spaces)

---

## Security Considerations

1. **No Default Permissions**: Every user must have explicit claims
2. **Fail-Safe**: Missing claims = access denied (not permissive)
3. **Organization Scoping**: Users can ONLY see data from their organization
4. **Role-Based Access**: Permissions are strictly enforced by role
5. **Client-Side Filtering**: Currently used as RLS workaround - less secure than true RLS

---

## Next Steps

1. **Configure Azure B2C** with the required claims
2. **Test with different user types** (staff, partner, enterprise)
3. **Verify organization scoping** works correctly
4. **Implement proper RLS** for database-level security
5. **Remove client-side filtering** once RLS is working

---

## Contact and Support

If you encounter issues with claims configuration:

1. Check the browser console for detailed error messages
2. Verify Azure B2C user flow configuration
3. Check the Claims Debugger in the UI (bottom-left)
4. Contact the development team with:
   - Screenshot of Claims Debugger
   - Console error messages
   - Azure user email

