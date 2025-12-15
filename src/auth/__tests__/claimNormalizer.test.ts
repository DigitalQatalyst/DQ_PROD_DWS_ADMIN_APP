/**
 * Unit tests for claim normalizer
 */

import { normalizeClaims, validateClaims, getOrganizationSourceKey, NormalizedClaims } from '../claimNormalizer';

describe('claimNormalizer', () => {
  describe('normalizeClaims', () => {
    it('should normalize claims with "Company Name" key', () => {
      const payload = {
        sub: 'azure-user-123',
        email: 'user@example.com',
        customerType: 'Partner',
        'User Role': 'Admin',
        'Company Name': 'DigitalQatalyst'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-123',
        email: 'user@example.com',
        customerType: 'partner',
        userRole: 'admin',
        organisationName: 'DigitalQatalyst'
      });
    });

    it('should normalize claims with organisationName key', () => {
      const payload = {
        sub: 'azure-user-456',
        email: 'staff@example.com',
        customerType: 'Staff',
        userRole: 'approver',
        organisationName: 'Front Operations'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-456',
        email: 'staff@example.com',
        customerType: 'staff',
        userRole: 'approver',
        organisationName: 'Front Operations'
      });
    });

    it('should normalize claims with organizationName key', () => {
      const payload = {
        sub: 'azure-user-789',
        email: 'partner@example.com',
        customerType: 'Partner',
        userRole: 'creator',
        organizationName: 'Beta Industries'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-789',
        email: 'partner@example.com',
        customerType: 'partner',
        userRole: 'creator',
        organisationName: 'Beta Industries'
      });
    });

    it('should normalize claims with extension_OrganizationId key', () => {
      const payload = {
        sub: 'azure-user-101',
        email: 'ext@example.com',
        customerType: 'Partner',
        userRole: 'contributor',
        extension_OrganizationId: 'CustomOrg'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-101',
        email: 'ext@example.com',
        customerType: 'partner',
        userRole: 'contributor',
        organisationName: 'CustomOrg'
      });
    });

    it('should handle missing organization name', () => {
      const payload = {
        sub: 'azure-user-202',
        email: 'noorg@example.com',
        customerType: 'Partner',
        userRole: 'viewer'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-202',
        email: 'noorg@example.com',
        customerType: 'partner',
        userRole: 'viewer',
        organisationName: null
      });
    });

    it('should handle missing customer type and user role', () => {
      const payload = {
        sub: 'azure-user-303',
        email: 'minimal@example.com',
        'Company Name': 'TestOrg'
      };

      const result = normalizeClaims(payload);

      expect(result).toEqual({
        azure_id: 'azure-user-303',
        email: 'minimal@example.com',
        customerType: null,
        userRole: null,
        organisationName: 'TestOrg'
      });
    });

    it('should trim whitespace from organization names', () => {
      const payload = {
        sub: 'azure-user-404',
        email: 'trim@example.com',
        customerType: 'Partner',
        userRole: 'admin',
        'Company Name': '  Spaced Org  '
      };

      const result = normalizeClaims(payload);

      expect(result.organisationName).toBe('Spaced Org');
    });

    it('should handle case variations in customer type and user role', () => {
      const payload = {
        sub: 'azure-user-505',
        email: 'case@example.com',
        customerType: 'STAFF',
        'User Role': 'CREATOR',
        'Company Name': 'CaseOrg'
      };

      const result = normalizeClaims(payload);

      expect(result.customerType).toBe('staff');
      expect(result.userRole).toBe('creator');
    });

    it('should fallback to oid if sub is missing', () => {
      const payload = {
        oid: 'fallback-azure-user-606',
        email: 'fallback@example.com',
        customerType: 'Partner',
        userRole: 'admin',
        'Company Name': 'FallbackOrg'
      };

      const result = normalizeClaims(payload);

      expect(result.azure_id).toBe('fallback-azure-user-606');
    });

    it('should prioritize extension claims over standard claims', () => {
      const payload = {
        sub: 'azure-user-707',
        email: 'priority@example.com',
        customerType: 'Partner',
        userRole: 'admin',
        'Company Name': 'StandardOrg',
        extension_OrganizationName: 'ExtensionOrg'
      };

      const result = normalizeClaims(payload);

      expect(result.organisationName).toBe('ExtensionOrg');
    });
  });

  describe('validateClaims', () => {
    it('should return true for valid claims', () => {
      const claims: NormalizedClaims = {
        azure_id: 'valid-user',
        email: 'valid@example.com',
        customerType: 'partner',
        userRole: 'admin',
        organisationName: 'ValidOrg'
      };

      expect(validateClaims(claims)).toBe(true);
    });

    it('should return false for missing azure_id', () => {
      const claims: NormalizedClaims = {
        azure_id: '',
        email: 'invalid@example.com',
        customerType: 'partner',
        userRole: 'admin',
        organisationName: 'InvalidOrg'
      };

      expect(validateClaims(claims)).toBe(false);
    });

    it('should return false for missing customerType', () => {
      const claims: NormalizedClaims = {
        azure_id: 'valid-user',
        email: 'invalid@example.com',
        customerType: null,
        userRole: 'admin',
        organisationName: 'InvalidOrg'
      };

      expect(validateClaims(claims)).toBe(false);
    });

    it('should return false for missing userRole', () => {
      const claims: NormalizedClaims = {
        azure_id: 'valid-user',
        email: 'invalid@example.com',
        customerType: 'partner',
        userRole: null,
        organisationName: 'InvalidOrg'
      };

      expect(validateClaims(claims)).toBe(false);
    });
  });

  describe('getOrganizationSourceKey', () => {
    it('should return "Company Name" when present', () => {
      const payload = {
        'Company Name': 'TestOrg',
        organisationName: 'OtherOrg'
      };

      expect(getOrganizationSourceKey(payload)).toBe('Company Name');
    });

    it('should return "organisationName" when present', () => {
      const payload = {
        organisationName: 'TestOrg'
      };

      expect(getOrganizationSourceKey(payload)).toBe('organisationName');
    });

    it('should return "organizationName" when present', () => {
      const payload = {
        organizationName: 'TestOrg'
      };

      expect(getOrganizationSourceKey(payload)).toBe('organizationName');
    });

    it('should return "extension_OrganizationId" when present', () => {
      const payload = {
        extension_OrganizationId: 'TestOrg'
      };

      expect(getOrganizationSourceKey(payload)).toBe('extension_OrganizationId');
    });

    it('should return "none" when no organization keys are present', () => {
      const payload = {
        email: 'test@example.com'
      };

      expect(getOrganizationSourceKey(payload)).toBe('none');
    });
  });
});
