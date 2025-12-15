# Azure External Identities - Claims Configuration Reference

## 🎯 Quick Reference for Azure Admin

This document provides a quick reference for configuring custom claims in Azure External Identities to work with the Platform Admin Dashboard.

---

## ✅ Required Custom Attributes

Configure these custom attributes in your Azure External Identities tenant:

| **Attribute Name** | **Data Type** | **Required** | **Purpose** |
|-------------------|--------------|-------------|------------|
| `customerType` | String | ✅ **Required** | Controls who can access the platform |
| `userRole` | String | ✅ **Required** | Determines user permissions |
| `OrganizationId` | String | ❌ Optional | Links user to organization |

---

## 🔐 customerType Values (Access Control)

The `customerType` attribute determines **IF** a user can access the platform.

### ✅ **Allowed Values** (case-insensitive):
- `staff`
- `admin`
- `internal`

### ❌ **Any other value will deny access** including:
- `customer`
- `partner`
- `external`
- `guest`

**Important**: If `customerType` is not set or has an invalid value, the user will see an "Access Not Authorized" screen.

---

## 👤 userRole Values (Permissions)

The `userRole` attribute determines **WHAT** a user can do in the platform.

### Role Mapping Table:

| **Set in Azure** | **Maps to App Role** | **Permissions** |
|-----------------|---------------------|-----------------|
| `admin` | `admin` | Full access to all features |
| `administrator` | `admin` | Full access to all features |
| `approver` | `approver` | Can approve/reject submissions |
| `manager` | `approver` | Can approve/reject submissions |
| `editor` | `creator` | Can create and edit content (frontend normalizes creator/contributor to editor) |
| `creator` | `creator` | Can create and edit content |
| `contributor` | `contributor` | Can contribute content (deprecated, now mapped to editor) |
| `member` | `contributor` | Can contribute content |
| `viewer` | `viewer` | Read-only access |
| `reader` | `viewer` | Read-only access |

**Default**: If `userRole` is missing or invalid, user gets `viewer` role (read-only).

---

## 📋 Configuration Steps

### 1. Create Custom Attributes

1. Go to **Azure Portal** → Your External Identities tenant
2. Navigate to **User attributes**
3. Click **Add attribute**
4. Create each attribute:
   - **Name**: `customerType` | **Data Type**: String
   - **Name**: `userRole` | **Data Type**: String
   - **Name**: `OrganizationId` | **Data Type**: String (optional)

### 2. Update User Flow

1. Navigate to **User flows** → Select your sign-up/sign-in flow
2. Click **User attributes**
3. Check these attributes:
   - ✅ `customerType`
   - ✅ `userRole`
   - ✅ `OrganizationId` (optional)
4. Click **Application claims**
5. Check the **same attributes** to include in tokens

### 3. Set User Attributes

When creating or editing users:

1. Go to **Users** → Select user
2. Edit **Custom attributes**
3. Set values:
   - **customerType**: `staff` (or `admin`/`internal`)
   - **userRole**: Choose from table above based on desired permissions
   - **OrganizationId**: (optional) Set organization ID

---

## 🧪 Example User Configurations

### Example 1: Platform Administrator
```
customerType: staff
userRole: admin
OrganizationId: org-001
```
→ ✅ Full platform access

### Example 2: Content Approver
```
customerType: staff
userRole: approver
OrganizationId: org-001
```
→ ✅ Can review and approve content

### Example 3: Content Creator
```
customerType: staff
userRole: creator
OrganizationId: org-002
```
→ ✅ Can create and edit content

### Example 4: Read-Only User
```
customerType: staff
userRole: viewer
OrganizationId: org-001
```
→ ✅ Can view content only

### Example 5: Customer (No Access)
```
customerType: customer
userRole: admin
```
→ ❌ **Access Denied** - invalid customerType

---

## 🔍 Troubleshooting

### User sees "Access Not Authorized" screen
**Cause**: Invalid or missing `customerType`

**Solution**: 
1. Check user's custom attributes in Azure
2. Verify `customerType` is set to `staff`, `admin`, or `internal`
3. Verify the attribute is selected in "Application claims" in user flow

### User has wrong permissions
**Cause**: Incorrect `userRole` value

**Solution**:
1. Check user's custom attributes in Azure
2. Verify `userRole` matches one of the values in the role mapping table
3. Ensure value is spelled correctly (case-insensitive)

### Claims not appearing in token
**Cause**: User flow not configured

**Solution**:
1. Go to your user flow settings
2. Verify attributes are selected in **both**:
   - ✅ User attributes
   - ✅ Application claims

---

## 📞 Support

If you encounter issues:

1. Check browser console logs for "Claims received:" message
2. Verify both `customerType` and `userRole` are present
3. Confirm values match allowed values exactly
4. Contact development team with console logs

---

**Last Updated**: {{ date }}

