// Example script to switch users in mock mode
// Run this in the browser console (F12)

// Get the auth context (this would need to be exposed)
function switchToUser(userType, role, orgName) {
  const mockUsers = {
    staff: {
      admin: {
        id: 'staff-admin-custom',
        email: 'staff.admin@example.com',
        name: 'Staff Admin',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      customerType: 'staff',
      userRole: 'admin',
      organizationName: orgName || 'stafforg'
    },
    partner: {
      admin: {
        id: 'partner-admin-custom',
        email: 'partner.admin@example.com',
        name: 'Partner Admin',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      customerType: 'partner',
      userRole: 'admin',
      organizationName: orgName || 'partner1org'
    },
    enterprise: {
      admin: {
        id: 'enterprise-admin-custom',
        email: 'enterprise.admin@example.com',
        name: 'Enterprise Admin',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      customerType: 'enterprise',
      userRole: 'admin',
      organizationName: orgName || 'enterpriseorg'
    }
  };

  const userConfig = mockUsers[userType]?.[role];
  if (userConfig) {
    console.log(`Switching to ${userType} ${role} user...`);
    
    // This would need to be called with the actual auth context
    // login(userConfig.user, userConfig.customerType, userConfig.userRole, userConfig.organizationName);
    
    console.log('User switched successfully!');
  } else {
    console.error('User type or role not found');
  }
}

// Usage examples:
// switchToUser('staff', 'admin', 'stafforg');
// switchToUser('partner', 'admin', 'partner1org');
// switchToUser('enterprise', 'admin', 'enterpriseorg');

console.log('User switching functions loaded. Use switchToUser(userType, role, orgName)');
