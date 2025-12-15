/**
 * Test Data Seeding Script
 * 
 * Seeds the database with test organizations and data for RBAC validation.
 */

import { Pool } from 'pg';
import { testOrganizations, testContents, testServices, testBusinessDirectory, testZones, testGrowthAreas } from '../fixtures/testData';

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/test_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  try {
    await dbClient.query('BEGIN');

    // Seed organizations
    console.log('📊 Seeding organizations...');
    for (const org of testOrganizations) {
      await dbClient.query(
        `INSERT INTO organisations (name, display_name, description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, now(), now())
         ON CONFLICT (name) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           updated_at = now()`,
        [org.name, org.display_name, org.description, org.status]
      );
      console.log(`✅ Seeded organization: ${org.name}`);
    }

    // Get organization IDs for foreign key references
    const orgResults = await dbClient.query('SELECT id, name FROM organisations WHERE name = ANY($1)', [
      testOrganizations.map(org => org.name)
    ]);
    
    const orgIdMap = new Map(orgResults.rows.map(row => [row.name, row.id]));

    // Create a test user for each organization
    console.log('👥 Seeding test users...');
    const testUsers = [
      { email: 'staff.admin@stafforg.com', name: 'Staff Admin', role: 'admin', orgName: 'stafforg' },
      { email: 'staff.approver@stafforg.com', name: 'Staff Approver', role: 'approver', orgName: 'stafforg' },
      { email: 'staff.creator@stafforg2.com', name: 'Staff Creator', role: 'creator', orgName: 'stafforg2' },
      { email: 'partner1.admin@partner1org.com', name: 'Partner1 Admin', role: 'admin', orgName: 'partner1org' },
      { email: 'partner1.creator@partner1org.com', name: 'Partner1 Creator', role: 'creator', orgName: 'partner1org' },
      { email: 'partner2.admin@partner2org.com', name: 'Partner2 Admin', role: 'admin', orgName: 'partner2org' },
      { email: 'enterprise.admin@enterpriseorg.com', name: 'Enterprise Admin', role: 'admin', orgName: 'enterpriseorg' }
    ];

    for (const user of testUsers) {
      const orgId = orgIdMap.get(user.orgName);
      if (!orgId) {
        console.warn(`⚠️ Organization not found for user: ${user.email}`);
        continue;
      }

      await dbClient.query(
        `INSERT INTO users (email, name, role, organisation_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, now(), now())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           organisation_id = EXCLUDED.organisation_id,
           updated_at = now()`,
        [user.email, user.name, user.role, orgId]
      );

      // Create user profile
      const userResult = await dbClient.query('SELECT id FROM users WHERE email = $1', [user.email]);
      const userId = userResult.rows[0].id;

      await dbClient.query(
        `INSERT INTO user_profiles (user_id, organisation_id, organisation_name, customer_type, user_role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET
           organisation_id = EXCLUDED.organisation_id,
           organisation_name = EXCLUDED.organisation_name,
           customer_type = EXCLUDED.customer_type,
           user_role = EXCLUDED.user_role,
           updated_at = now()`,
        [userId, orgId, user.orgName, user.orgName.startsWith('staff') ? 'staff' : user.orgName.startsWith('partner') ? 'partner' : 'enterprise', user.role]
      );

      console.log(`✅ Seeded user: ${user.email}`);
    }

    // Seed contents
    console.log('📝 Seeding contents...');
    for (const content of testContents) {
      const orgId = orgIdMap.get(content.organisation_name);
      if (!orgId) continue;

      await dbClient.query(
        `INSERT INTO contents (title, content_type, content, status, organisation_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         ON CONFLICT (title) DO UPDATE SET
           content = EXCLUDED.content,
           updated_at = now()`,
        [content.title, content.content_type, content.content, content.status, orgId]
      );
      console.log(`✅ Seeded content: ${content.title}`);
    }

    // Seed services
    console.log('🔧 Seeding services...');
    for (const service of testServices) {
      const orgId = orgIdMap.get(service.organisation_name);
      if (!orgId) continue;

      await dbClient.query(
        `INSERT INTO services (title, type, category, status, organisation_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         ON CONFLICT (title) DO UPDATE SET
           type = EXCLUDED.type,
           category = EXCLUDED.category,
           updated_at = now()`,
        [service.title, service.type, service.category, service.status, orgId]
      );
      console.log(`✅ Seeded service: ${service.title}`);
    }

    // Seed business directory
    console.log('🏢 Seeding business directory...');
    for (const business of testBusinessDirectory) {
      const orgId = orgIdMap.get(business.organisation_name);
      if (!orgId) continue;

      await dbClient.query(
        `INSERT INTO business_directory (name, type, industry, status, organisation_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         ON CONFLICT (name) DO UPDATE SET
           type = EXCLUDED.type,
           industry = EXCLUDED.industry,
           updated_at = now()`,
        [business.name, business.type, business.industry, business.status, orgId]
      );
      console.log(`✅ Seeded business: ${business.name}`);
    }

    // Seed zones
    console.log('🗺️ Seeding zones...');
    for (const zone of testZones) {
      const orgId = orgIdMap.get(zone.organisation_name);
      if (!orgId) continue;

      await dbClient.query(
        `INSERT INTO zones (name, zone_type, status, organisation_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, now(), now())
         ON CONFLICT (name) DO UPDATE SET
           zone_type = EXCLUDED.zone_type,
           updated_at = now()`,
        [zone.name, zone.zone_type, zone.status, orgId]
      );
      console.log(`✅ Seeded zone: ${zone.name}`);
    }

    // Seed growth areas
    console.log('📈 Seeding growth areas...');
    for (const growthArea of testGrowthAreas) {
      const orgId = orgIdMap.get(growthArea.organisation_name);
      if (!orgId) continue;

      await dbClient.query(
        `INSERT INTO growth_areas (name, growth_type, status, organisation_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, now(), now())
         ON CONFLICT (name) DO UPDATE SET
           growth_type = EXCLUDED.growth_type,
           updated_at = now()`,
        [growthArea.name, growthArea.growth_type, growthArea.status, orgId]
      );
      console.log(`✅ Seeded growth area: ${growthArea.name}`);
    }

    await dbClient.query('COMMIT');
    console.log('🎉 Test data seeding completed successfully!');

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    await dbClient.query('BEGIN');

    // Clean up in reverse order due to foreign key constraints
    await dbClient.query('DELETE FROM growth_areas WHERE name LIKE $1', ['%Growth Area%']);
    await dbClient.query('DELETE FROM zones WHERE name LIKE $1', ['%Zone%']);
    await dbClient.query('DELETE FROM business_directory WHERE name LIKE $1', ['%Business%']);
    await dbClient.query('DELETE FROM services WHERE title LIKE $1', ['%Service%']);
    await dbClient.query('DELETE FROM contents WHERE title LIKE $1', ['%Content%']);
    await dbClient.query('DELETE FROM user_profiles WHERE organisation_name IN ($1)', [
      testOrganizations.map(org => org.name)
    ]);
    await dbClient.query('DELETE FROM users WHERE email LIKE $1', ['%@%.com']);
    await dbClient.query('DELETE FROM organisations WHERE name IN ($1)', [
      testOrganizations.map(org => org.name)
    ]);

    await dbClient.query('COMMIT');
    console.log('✅ Test data cleanup completed!');

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      await seedTestData();
      break;
    case 'cleanup':
      await cleanupTestData();
      break;
    case 'reset':
      await cleanupTestData();
      await seedTestData();
      break;
    default:
      console.log('Usage: npm run test:seed [seed|cleanup|reset]');
      console.log('  seed    - Seed test data');
      console.log('  cleanup - Remove test data');
      console.log('  reset   - Clean up and reseed test data');
  }

  await dbClient.end();
}

if (require.main === module) {
  main().catch(console.error);
}

export { seedTestData, cleanupTestData };
