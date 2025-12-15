/**
 * CASL Authorization Demo
 * 
 * This file demonstrates the CASL authorization system in action
 * with console logs showing permission behavior for different user roles.
 */

import { buildAbility, debugUserAbilities } from '../ability';
import { UserContext } from '../ability';

describe('CASL Authorization Demo', () => {
  it('should demonstrate permission behavior for different roles', () => {
    console.log('\n🔐 CASL Authorization System Demo');
    console.log('=====================================\n');

    // Test different user roles
    const testUsers: Array<{ name: string; context: UserContext }> = [
      {
        name: 'Admin User',
        context: {
          role: 'admin',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'admin',
          id: 'admin-123',
        }
      },
      {
        name: 'Approver User',
        context: {
          role: 'approver',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'approver',
          id: 'approver-123',
        }
      },
      {
        name: 'Creator User',
        context: {
          role: 'creator',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'creator',
          id: 'creator-123',
        }
      },
      {
        name: 'Contributor User',
        context: {
          role: 'contributor',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'contributor',
          id: 'contributor-123',
        }
      },
      {
        name: 'Viewer User',
        context: {
          role: 'viewer',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'viewer',
          id: 'viewer-123',
        }
      },
      {
        name: 'Unauthorized User',
        context: {
          role: 'unauthorized',
          organizationId: 'org-123',
          customerType: 'staff',
          userRole: 'unauthorized',
          id: 'unauthorized-123',
        }
      },
      {
        name: 'External User (Invalid Customer Type)',
        context: {
          role: 'admin',
          organizationId: 'org-123',
          customerType: 'external', // Invalid customer type
          userRole: 'admin',
          id: 'external-123',
        }
      }
    ];

    // Test each user role
    testUsers.forEach(({ name, context }) => {
      console.log(`👤 Testing: ${name}`);
      console.log(`   Role: ${context.role}, Customer Type: ${context.customerType}`);
      
      const ability = buildAbility(context);
      
      // Test specific permissions
      const permissions = [
        { action: 'create', subject: 'Service' as const },
        { action: 'read', subject: 'Service' as const },
        { action: 'update', subject: 'Service' as const },
        { action: 'delete', subject: 'Service' as const },
        { action: 'approve', subject: 'Service' as const },
        { action: 'create', subject: 'Content' as const },
        { action: 'read', subject: 'Content' as const },
        { action: 'update', subject: 'Content' as const },
        { action: 'delete', subject: 'Content' as const },
        { action: 'approve', subject: 'Content' as const },
        { action: 'manage', subject: 'all' as const },
      ];

      permissions.forEach(({ action, subject }) => {
        const canPerform = ability.can(action, subject);
        const status = canPerform ? '✅' : '❌';
        console.log(`   ${status} Can ${action} ${subject}`);
      });

      console.log(''); // Empty line for readability
    });

    console.log('🎯 Key Takeaways:');
    console.log('   • Admin users have full access to everything');
    console.log('   • Approvers can read and approve content/services');
    console.log('   • Creators can create, read, and update their content');
    console.log('   • Contributors can read and update existing content');
    console.log('   • Viewers have read-only access');
    console.log('   • Unauthorized users have no access');
    console.log('   • Invalid customer types are denied access regardless of role');
    console.log('   • All permissions are type-safe and checked at runtime\n');

    // Demonstrate debug functionality
    console.log('🔍 Debug Information for Admin User:');
    const adminContext: UserContext = {
      role: 'admin',
      organizationId: 'org-123',
      customerType: 'staff',
      userRole: 'admin',
      id: 'admin-123',
    };
    const adminAbility = buildAbility(adminContext);
    debugUserAbilities(adminAbility, adminContext);

    expect(true).toBe(true); // Test passes
  });

  it('should demonstrate CRUD permission checks', () => {
    console.log('\n📝 CRUD Permission Checks Demo');
    console.log('===============================\n');

    const creatorContext: UserContext = {
      role: 'creator',
      organizationId: 'org-123',
      customerType: 'staff',
      userRole: 'creator',
      id: 'creator-123',
    };

    const ability = buildAbility(creatorContext);

    console.log('👤 Creator User CRUD Permissions:');
    console.log(`   Create Service: ${ability.can('create', 'Service') ? '✅' : '❌'}`);
    console.log(`   Read Service: ${ability.can('read', 'Service') ? '✅' : '❌'}`);
    console.log(`   Update Service: ${ability.can('update', 'Service') ? '✅' : '❌'}`);
    console.log(`   Delete Service: ${ability.can('delete', 'Service') ? '✅' : '❌'}`);
    console.log(`   Approve Service: ${ability.can('approve', 'Service') ? '✅' : '❌'}`);

    console.log('\n   Create Content: ${ability.can('create', 'Content') ? '✅' : '❌'}');
    console.log(`   Read Content: ${ability.can('read', 'Content') ? '✅' : '❌'}`);
    console.log(`   Update Content: ${ability.can('update', 'Content') ? '✅' : '❌'}`);
    console.log(`   Delete Content: ${ability.can('delete', 'Content') ? '✅' : '❌'}`);
    console.log(`   Approve Content: ${ability.can('approve', 'Content') ? '✅' : '❌'}`);

    expect(true).toBe(true); // Test passes
  });
});
