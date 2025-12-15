/**
 * Test Data for RBAC Validation
 * 
 * Provides seed data for organizations and test content
 * to validate organization-scoped access.
 */

export const testOrganizations = [
  {
    name: 'stafforg',
    display_name: 'Staff Organization',
    description: 'Allowed staff organization for testing',
    status: 'active'
  },
  {
    name: 'stafforg2',
    display_name: 'Staff Organization 2',
    description: 'Second allowed staff organization',
    status: 'active'
  },
  {
    name: 'randomorg',
    display_name: 'Random Organization',
    description: 'Disallowed organization for staff testing',
    status: 'active'
  },
  {
    name: 'partner1org',
    display_name: 'Partner Organization 1',
    description: 'First partner organization',
    status: 'active'
  },
  {
    name: 'partner2org',
    display_name: 'Partner Organization 2',
    description: 'Second partner organization',
    status: 'active'
  },
  {
    name: 'enterpriseorg',
    display_name: 'Enterprise Organization',
    description: 'Enterprise organization (should be blocked)',
    status: 'active'
  }
];

export const testContents = [
  {
    title: 'Staff Content from StaffOrg',
    content_type: 'Article',
    content: 'This content belongs to stafforg',
    status: 'Published',
    organisation_name: 'stafforg'
  },
  {
    title: 'Staff Content from StaffOrg2',
    content_type: 'Article',
    content: 'This content belongs to stafforg2',
    status: 'Published',
    organisation_name: 'stafforg2'
  },
  {
    title: 'Random Org Content',
    content_type: 'Article',
    content: 'This content belongs to randomorg',
    status: 'Published',
    organisation_name: 'randomorg'
  },
  {
    title: 'Partner1 Content',
    content_type: 'Article',
    content: 'This content belongs to partner1org',
    status: 'Published',
    organisation_name: 'partner1org'
  },
  {
    title: 'Partner2 Content',
    content_type: 'Article',
    content: 'This content belongs to partner2org',
    status: 'Published',
    organisation_name: 'partner2org'
  },
  {
    title: 'Enterprise Content',
    content_type: 'Article',
    content: 'This content belongs to enterpriseorg',
    status: 'Published',
    organisation_name: 'enterpriseorg'
  }
];

export const testServices = [
  {
    title: 'Staff Service from StaffOrg',
    type: 'Non-Financial',
    category: 'Consulting',
    status: 'Published',
    organisation_name: 'stafforg'
  },
  {
    title: 'Staff Service from StaffOrg2',
    type: 'Financial',
    category: 'Funding',
    status: 'Published',
    organisation_name: 'stafforg2'
  },
  {
    title: 'Random Org Service',
    type: 'Non-Financial',
    category: 'Training',
    status: 'Published',
    organisation_name: 'randomorg'
  },
  {
    title: 'Partner1 Service',
    type: 'Non-Financial',
    category: 'Development',
    status: 'Published',
    organisation_name: 'partner1org'
  },
  {
    title: 'Partner2 Service',
    type: 'Financial',
    category: 'Investment',
    status: 'Published',
    organisation_name: 'partner2org'
  },
  {
    title: 'Enterprise Service',
    type: 'Non-Financial',
    category: 'Enterprise',
    status: 'Published',
    organisation_name: 'enterpriseorg'
  }
];

export const testBusinessDirectory = [
  {
    name: 'Staff Business Org',
    type: 'Private',
    industry: 'Technology',
    status: 'Active',
    organisation_name: 'stafforg'
  },
  {
    name: 'Staff Business Org2',
    type: 'Government',
    industry: 'Healthcare',
    status: 'Active',
    organisation_name: 'stafforg2'
  },
  {
    name: 'Random Business',
    type: 'Private',
    industry: 'Manufacturing',
    status: 'Active',
    organisation_name: 'randomorg'
  },
  {
    name: 'Partner1 Business',
    type: 'Private',
    industry: 'Finance',
    status: 'Active',
    organisation_name: 'partner1org'
  },
  {
    name: 'Partner2 Business',
    type: 'Semi-Government',
    industry: 'Education',
    status: 'Active',
    organisation_name: 'partner2org'
  },
  {
    name: 'Enterprise Business',
    type: 'Private',
    industry: 'Enterprise',
    status: 'Active',
    organisation_name: 'enterpriseorg'
  }
];

export const testZones = [
  {
    name: 'Staff Zone',
    zone_type: 'economic_zone',
    status: 'Active',
    organisation_name: 'stafforg'
  },
  {
    name: 'Staff Zone2',
    zone_type: 'office',
    status: 'Active',
    organisation_name: 'stafforg2'
  },
  {
    name: 'Random Zone',
    zone_type: 'attraction',
    status: 'Active',
    organisation_name: 'randomorg'
  },
  {
    name: 'Partner1 Zone',
    zone_type: 'economic_zone',
    status: 'Active',
    organisation_name: 'partner1org'
  },
  {
    name: 'Partner2 Zone',
    zone_type: 'landmark',
    status: 'Active',
    organisation_name: 'partner2org'
  },
  {
    name: 'Enterprise Zone',
    zone_type: 'facility',
    status: 'Active',
    organisation_name: 'enterpriseorg'
  }
];

export const testGrowthAreas = [
  {
    name: 'Staff Growth Area',
    growth_type: 'technology',
    status: 'Active',
    organisation_name: 'stafforg'
  },
  {
    name: 'Staff Growth Area2',
    growth_type: 'innovation',
    status: 'Active',
    organisation_name: 'stafforg2'
  },
  {
    name: 'Random Growth Area',
    growth_type: 'manufacturing',
    status: 'Active',
    organisation_name: 'randomorg'
  },
  {
    name: 'Partner1 Growth Area',
    growth_type: 'finance',
    status: 'Active',
    organisation_name: 'partner1org'
  },
  {
    name: 'Partner2 Growth Area',
    growth_type: 'education',
    status: 'Active',
    organisation_name: 'partner2org'
  },
  {
    name: 'Enterprise Growth Area',
    growth_type: 'enterprise',
    status: 'Active',
    organisation_name: 'enterpriseorg'
  }
];

/**
 * Expected access patterns for validation
 */
export const expectedAccessPatterns = {
  staff: {
    allowedOrgs: ['stafforg', 'stafforg2'],
    disallowedOrgs: ['randomorg', 'partner1org', 'partner2org', 'enterpriseorg'],
    shouldSeeAllAllowedOrgData: true,
    shouldSeeDisallowedOrgData: false
  },
  partner: {
    allowedOrgs: ['partner1org', 'partner2org'],
    disallowedOrgs: ['stafforg', 'stafforg2', 'randomorg', 'enterpriseorg'],
    shouldSeeOwnOrgDataOnly: true,
    shouldSeeOtherOrgData: false
  },
  enterprise: {
    allowedOrgs: [],
    disallowedOrgs: ['stafforg', 'stafforg2', 'randomorg', 'partner1org', 'partner2org', 'enterpriseorg'],
    shouldSeeAnyData: false
  }
};

export default {
  testOrganizations,
  testContents,
  testServices,
  testBusinessDirectory,
  testZones,
  testGrowthAreas,
  expectedAccessPatterns
};
