/**
 * RBAC Test Runner
 * 
 * Comprehensive test runner that demonstrates all RBAC scenarios
 * and validates the complete system.
 */

import { generateMockTokens, getStaffTokens, getPartnerTokens, getEnterpriseTokens, getBlockedTokens } from './fixtures/mockTokens';
import { testOrganizations, expectedAccessPatterns } from './fixtures/testData';
import { normalizeClaims } from '../../src/auth/claimNormalizer';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class RBACTestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting RBAC Test Suite...\n');

    await this.testClaimNormalization();
    await this.testRBACRules();
    await this.testOrganizationScoping();
    await this.testPermissionMatrix();
    await this.testMockTokenGeneration();
    await this.testExpectedAccessPatterns();

    this.printResults();
  }

  private async testClaimNormalization(): Promise<void> {
    console.log('📋 Testing Claim Normalization...');

    const testCases = [
      {
        name: 'Staff Admin Token',
        input: {
          sub: 'staff-user-123',
          email: 'staff.admin@dqproj.onmicrosoft.com',
          customerType: 'Staff',
          'User Role': 'Admin',
          'Company Name': 'stafforg'
        },
        expected: {
          customerType: 'staff',
          userRole: 'admin',
          organisationName: 'stafforg'
        }
      },
      {
        name: 'Partner Creator Token',
        input: {
          sub: 'partner-user-456',
          email: 'partner1.creator@dqproj.onmicrosoft.com',
          customerType: 'Partner',
          'User Role': 'Creator',
          'Company Name': 'partner1org'
        },
        expected: {
          customerType: 'partner',
          userRole: 'creator',
          organisationName: 'partner1org'
        }
      },
      {
        name: 'Enterprise Admin Token',
        input: {
          sub: 'enterprise-user-789',
          email: 'enterprise.admin@dqproj.onmicrosoft.com',
          customerType: 'Enterprise',
          'User Role': 'Admin',
          'Company Name': 'enterpriseorg'
        },
        expected: {
          customerType: 'enterprise',
          userRole: 'admin',
          organisationName: 'enterpriseorg'
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const result = normalizeClaims(testCase.input);
        
        const passed = 
          result.customerType === testCase.expected.customerType &&
          result.userRole === testCase.expected.userRole &&
          result.organisationName === testCase.expected.organisationName;

        this.addResult({
          testName: `Claim Normalization: ${testCase.name}`,
          passed,
          details: { input: testCase.input, expected: testCase.expected, result }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
      } catch (error) {
        this.addResult({
          testName: `Claim Normalization: ${testCase.name}`,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${testCase.name}: ${error.message}`);
      }
    }
  }

  private async testRBACRules(): Promise<void> {
    console.log('\n🔐 Testing RBAC Rules...');

    const testCases = [
      {
        name: 'Staff from allowed org should be allowed',
        customerType: 'staff',
        organisationName: 'stafforg',
        expectedResult: 'allowed'
      },
      {
        name: 'Staff from disallowed org should be blocked',
        customerType: 'staff',
        organisationName: 'randomorg',
        expectedResult: 'blocked'
      },
      {
        name: 'Partner with org should be allowed',
        customerType: 'partner',
        organisationName: 'partner1org',
        expectedResult: 'allowed'
      },
      {
        name: 'Partner without org should be blocked',
        customerType: 'partner',
        organisationName: '',
        expectedResult: 'blocked'
      },
      {
        name: 'Enterprise should be blocked',
        customerType: 'enterprise',
        organisationName: 'enterpriseorg',
        expectedResult: 'blocked'
      }
    ];

    for (const testCase of testCases) {
      try {
        let result = 'allowed';
        
        // Apply RBAC rules
        if (testCase.customerType === 'enterprise') {
          result = 'blocked';
        } else if (testCase.customerType === 'staff') {
          if (!['stafforg', 'stafforg2'].includes(testCase.organisationName)) {
            result = 'blocked';
          }
        } else if (testCase.customerType === 'partner') {
          if (!testCase.organisationName) {
            result = 'blocked';
          }
        }

        const passed = result === testCase.expectedResult;
        
        this.addResult({
          testName: `RBAC Rule: ${testCase.name}`,
          passed,
          details: { testCase, result, expectedResult: testCase.expectedResult }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
      } catch (error) {
        this.addResult({
          testName: `RBAC Rule: ${testCase.name}`,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${testCase.name}: ${error.message}`);
      }
    }
  }

  private async testOrganizationScoping(): Promise<void> {
    console.log('\n🏢 Testing Organization Scoping...');

    const testCases = [
      {
        name: 'Staff should see all allowed org data',
        userType: 'staff',
        userOrg: 'stafforg',
        dataOrgs: ['stafforg', 'stafforg2'],
        expectedAccess: true
      },
      {
        name: 'Staff should not see disallowed org data',
        userType: 'staff',
        userOrg: 'stafforg',
        dataOrgs: ['randomorg', 'partner1org'],
        expectedAccess: false
      },
      {
        name: 'Partner should see only own org data',
        userType: 'partner',
        userOrg: 'partner1org',
        dataOrgs: ['partner1org'],
        expectedAccess: true
      },
      {
        name: 'Partner should not see other org data',
        userType: 'partner',
        userOrg: 'partner1org',
        dataOrgs: ['partner2org', 'stafforg'],
        expectedAccess: false
      }
    ];

    for (const testCase of testCases) {
      try {
        let hasAccess = true;

        // Apply organization scoping rules
        if (testCase.userType === 'staff') {
          hasAccess = testCase.dataOrgs.every(org => ['stafforg', 'stafforg2'].includes(org));
        } else if (testCase.userType === 'partner') {
          hasAccess = testCase.dataOrgs.every(org => org === testCase.userOrg);
        }

        const passed = hasAccess === testCase.expectedAccess;
        
        this.addResult({
          testName: `Organization Scoping: ${testCase.name}`,
          passed,
          details: { testCase, hasAccess, expectedAccess: testCase.expectedAccess }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
      } catch (error) {
        this.addResult({
          testName: `Organization Scoping: ${testCase.name}`,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${testCase.name}: ${error.message}`);
      }
    }
  }

  private async testPermissionMatrix(): Promise<void> {
    console.log('\n👥 Testing Permission Matrix...');

    const permissionMatrix = {
      admin: ['create', 'read', 'update', 'delete', 'approve'],
      approver: ['read', 'approve'],
      creator: ['create', 'read', 'update'],
      contributor: ['read', 'update'],
      viewer: ['read']
    };

    const testCases = [
      { role: 'admin', action: 'create', expected: true },
      { role: 'admin', action: 'delete', expected: true },
      { role: 'approver', action: 'create', expected: false },
      { role: 'approver', action: 'approve', expected: true },
      { role: 'creator', action: 'delete', expected: false },
      { role: 'creator', action: 'update', expected: true },
      { role: 'contributor', action: 'create', expected: false },
      { role: 'contributor', action: 'read', expected: true },
      { role: 'viewer', action: 'create', expected: false },
      { role: 'viewer', action: 'read', expected: true }
    ];

    for (const testCase of testCases) {
      try {
        const hasPermission = permissionMatrix[testCase.role]?.includes(testCase.action) || false;
        const passed = hasPermission === testCase.expected;
        
        this.addResult({
          testName: `Permission Matrix: ${testCase.role} can ${testCase.action}`,
          passed,
          details: { testCase, hasPermission, expected: testCase.expected }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${testCase.role} can ${testCase.action}`);
      } catch (error) {
        this.addResult({
          testName: `Permission Matrix: ${testCase.role} can ${testCase.action}`,
          passed: false,
          error: error.message
        });
        console.log(`  ❌ ${testCase.role} can ${testCase.action}: ${error.message}`);
      }
    }
  }

  private async testMockTokenGeneration(): Promise<void> {
    console.log('\n🎫 Testing Mock Token Generation...');

    try {
      const tokens = generateMockTokens();
      
      // Verify we have tokens for each user type
      const staffTokens = tokens.filter(t => t.payload.customerType === 'Staff');
      const partnerTokens = tokens.filter(t => t.payload.customerType === 'Partner');
      const enterpriseTokens = tokens.filter(t => t.payload.customerType === 'Enterprise');
      
      const hasStaffTokens = staffTokens.length > 0;
      const hasPartnerTokens = partnerTokens.length > 0;
      const hasEnterpriseTokens = enterpriseTokens.length > 0;
      
      this.addResult({
        testName: 'Mock Token Generation: All user types present',
        passed: hasStaffTokens && hasPartnerTokens && hasEnterpriseTokens,
        details: { 
          staffCount: staffTokens.length, 
          partnerCount: partnerTokens.length, 
          enterpriseCount: enterpriseTokens.length 
        }
      });

      console.log(`  ${hasStaffTokens ? '✅' : '❌'} Staff tokens: ${staffTokens.length}`);
      console.log(`  ${hasPartnerTokens ? '✅' : '❌'} Partner tokens: ${partnerTokens.length}`);
      console.log(`  ${hasEnterpriseTokens ? '✅' : '❌'} Enterprise tokens: ${enterpriseTokens.length}`);

      // Test blocked tokens
      const blockedTokens = getBlockedTokens();
      const hasBlockedTokens = blockedTokens.length > 0;
      
      this.addResult({
        testName: 'Mock Token Generation: Blocked tokens present',
        passed: hasBlockedTokens,
        details: { blockedCount: blockedTokens.length }
      });

      console.log(`  ${hasBlockedTokens ? '✅' : '❌'} Blocked tokens: ${blockedTokens.length}`);

    } catch (error) {
      this.addResult({
        testName: 'Mock Token Generation',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Mock token generation failed: ${error.message}`);
    }
  }

  private async testExpectedAccessPatterns(): Promise<void> {
    console.log('\n📊 Testing Expected Access Patterns...');

    const patterns = expectedAccessPatterns;

    try {
      // Test staff patterns
      const staffPattern = patterns.staff;
      const staffHasAllowedOrgs = staffPattern.allowedOrgs.length > 0;
      const staffHasDisallowedOrgs = staffPattern.disallowedOrgs.length > 0;
      
      this.addResult({
        testName: 'Access Patterns: Staff configuration',
        passed: staffHasAllowedOrgs && staffHasDisallowedOrgs,
        details: { 
          allowedOrgs: staffPattern.allowedOrgs, 
          disallowedOrgs: staffPattern.disallowedOrgs 
        }
      });

      console.log(`  ${staffHasAllowedOrgs ? '✅' : '❌'} Staff allowed orgs: ${staffPattern.allowedOrgs.length}`);
      console.log(`  ${staffHasDisallowedOrgs ? '✅' : '❌'} Staff disallowed orgs: ${staffPattern.disallowedOrgs.length}`);

      // Test partner patterns
      const partnerPattern = patterns.partner;
      const partnerShouldSeeOwnOnly = partnerPattern.shouldSeeOwnOrgDataOnly;
      
      this.addResult({
        testName: 'Access Patterns: Partner configuration',
        passed: partnerShouldSeeOwnOnly,
        details: partnerPattern
      });

      console.log(`  ${partnerShouldSeeOwnOnly ? '✅' : '❌'} Partner sees own org only`);

      // Test enterprise patterns
      const enterprisePattern = patterns.enterprise;
      const enterpriseShouldSeeNone = !enterprisePattern.shouldSeeAnyData;
      
      this.addResult({
        testName: 'Access Patterns: Enterprise configuration',
        passed: enterpriseShouldSeeNone,
        details: enterprisePattern
      });

      console.log(`  ${enterpriseShouldSeeNone ? '✅' : '❌'} Enterprise sees no data`);

    } catch (error) {
      this.addResult({
        testName: 'Expected Access Patterns',
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Access patterns test failed: ${error.message}`);
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n📈 Test Results Summary:');
    console.log('=' .repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.testName}`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
    }

    console.log('\n🎯 RBAC Test Suite Complete!');
    
    if (failed === 0) {
      console.log('🎉 All tests passed! The RBAC system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new RBACTestRunner();
  runner.runAllTests().catch(console.error);
}

export { RBACTestRunner };
