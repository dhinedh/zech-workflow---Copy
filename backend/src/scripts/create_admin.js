
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const dbUrl = process.env.DATABASE_URL;

console.log('Credentials loaded:', {
    url: supabaseUrl ? 'YES' : 'NO',
    key: supabaseServiceKey ? 'YES' : 'NO'
});

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const prisma = new PrismaClient({
    datasourceUrl: dbUrl
});

const email = 'makjuz@gmail.com';
const password = 'Password@123';
const name = 'Makjuz CEO';
const companyName = 'Makjuz Corp';

async function main() {
    try {
        console.log(`\n1. Creating/Fetching Supabase Auth User: ${email}`);
        let userId;

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role: 'SUPER_ADMIN' }
        });

        if (authError) {
            console.log('   Auth Error:', authError.message);
            if (authError.message.includes('already has been registered')) {
                console.log('   User exists. Trying direct SQL access to auth.users...');

                try {
                    // Try to query auth.users directly via Prisma Raw Query
                    // This requires the database user to have access to auth schema
                    const users = await prisma.$queryRawUnsafe(`SELECT id FROM auth.users WHERE email = '${email}'`);
                    // Note: using Unsafe string interpolation here for simplicity in raw SQL, 
                    // typically use parameterized $queryRaw`...` but string literal is safer with specific value.
                    // Cast result to array.

                    if (Array.isArray(users) && users.length > 0) {
                        userId = users[0].id;
                        console.log(`   Found ID via Direct SQL: ${userId}`);
                    } else {
                        console.log('   Direct SQL returned no results.');
                    }
                } catch (sqlError) {
                    console.log('   Direct SQL failed:', sqlError.message);

                    // Fallback to signIn if SQL failed
                    console.log('   Trying login (fallback)...');
                    const { data: loginData } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                    if (loginData.user) {
                        userId = loginData.user.id;
                        console.log(`   Login successful. ID: ${userId}`);
                    }
                }
            }
        } else {
            userId = authData.user.id;
            console.log(`   Created new user. ID: ${userId}`);
        }

        if (!userId) {
            console.error('Failed to get user ID. Cannot proceed with DB Sync.');
            return;
        }

        console.log('\n2. Ensuring Company Exists...');
        let company = await prisma.company.findFirst();
        if (!company) {
            console.log(`   Creating default company: ${companyName}`);
            try {
                company = await prisma.company.create({
                    data: {
                        name: companyName,
                        subscriptionStatus: 'ACTIVE'
                    }
                });
                console.log(`   Created Company ID: ${company.id}`);
            } catch (companyError) {
                console.error('   Error creating company:', companyError);
                return;
            }
        } else {
            console.log(`   Using existing company: ${company.name} (${company.id})`);
        }

        console.log('\n3. Syncing to Public Database...');
        try {
            // Check if user exists in public DB first to decide update vs create
            // Upsert handles this, but let's be explicit with logging
            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    role: 'SUPER_ADMIN',
                    companyId: company.id,
                    name: name
                    // We do NOT update ID.
                },
                create: {
                    id: userId,
                    email,
                    name,
                    passwordHash: 'managed_by_supabase_auth',
                    role: 'SUPER_ADMIN',
                    companyId: company.id,
                    isActive: true
                }
            });
            console.log(`   User synced! ID: ${user.id}`);

            console.log('   ---------------------------------------------------');
            console.log(`   Login Credentials:`);
            console.log(`   Email:    ${email}`);
            console.log(`   Password: ${password}`);
            console.log('   ---------------------------------------------------');
        } catch (dbError) {
            console.error('   Database Sync Error:', dbError);
        }

    } catch (e) {
        console.error('Unexpected Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
