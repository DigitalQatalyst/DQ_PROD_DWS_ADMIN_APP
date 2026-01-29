import { createClient } from '@supabase/supabase-js';

// Native Node 20+ handles --env-file, so we just use process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    console.log('Ensure you run this with: npx tsx --env-file=.env scripts/seed-users.ts');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const DEFAULT_PASSWORD = 'Password123!';

const testUsers = [
    {
        email: 'admin@test.com',
        password: DEFAULT_PASSWORD,
        metadata: {
            full_name: 'Super Admin',
            role: 'admin',
            user_segment: 'internal'
        }
    },
    {
        email: 'hr.admin@test.com',
        password: DEFAULT_PASSWORD,
        metadata: {
            full_name: 'HR Administrator',
            role: 'hr_admin',
            user_segment: 'internal'
        }
    },
    {
        email: 'hr.member@test.com',
        password: DEFAULT_PASSWORD,
        metadata: {
            full_name: 'HR Team Member',
            role: 'hr_member',
            user_segment: 'internal'
        }
    },
    {
        email: 'content.admin@test.com',
        password: DEFAULT_PASSWORD,
        metadata: {
            full_name: 'Content Administrator',
            role: 'content_admin',
            user_segment: 'internal'
        }
    },
    {
        email: 'content.member@test.com',
        password: DEFAULT_PASSWORD,
        metadata: {
            full_name: 'Content Team Member',
            role: 'content_member',
            user_segment: 'internal'
        }
    }
];

async function seedUsers() {
    console.log('🚀 Starting user seeding process on: ' + supabaseUrl);

    for (const user of testUsers) {
        console.log(`\nProcessing: ${user.email}...`);

        // Check if user exists
        const { data: searchData, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error(`❌ Failed to list users: ${listError.message}`);
            return;
        }

        const existingUser = searchData?.users.find(u => u.email === user.email);

        if (existingUser) {
            console.log(`⚠️ User exists. Updating metadata for role: ${user.metadata.role}...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    user_metadata: user.metadata,
                    email_confirm: true
                }
            );
            if (updateError) console.error(`❌ Update failed: ${updateError.message}`);
            else console.log(`✅ Updated successfully.`);
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: user.metadata
            });

            if (error) {
                console.error(`❌ Creation failed: ${error.message}`);
            } else {
                console.log(`✅ Created user ${user.email} with ID: ${data.user?.id}`);
            }
        }
    }

    console.log('\n✨ Seeding process complete!');
    console.log('Login Password for all: ' + DEFAULT_PASSWORD);
}

seedUsers();
