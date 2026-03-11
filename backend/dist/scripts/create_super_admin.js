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
if (!supabaseUrl || !supabaseServiceKey || !dbUrl) {
    console.error('Missing credentials in .env');
    process.exit(1);
}
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
async function createOrUpdateUser(email, password, name, role, companyId) {
    try {
        console.log(`\nProcessing User: ${email} (${role})`);
        let userId;
        // Attempt Creation
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role: role }
        });
        if (authError) {
            if (authError.message.includes('already has been registered')) {
                console.log('   User already exists. Fetching ID...');
                // Fetch ID via Admin List
                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                if (listError || !users) {
                    console.error('   Failed to list users to find ID:', listError?.message);
                    return;
                }
                const existingUser = users.find(u => u.email === email);
                if (existingUser) {
                    userId = existingUser.id;
                    console.log(`   Found Auth ID: ${userId}`);
                    // Optional: Update password just in case
                    await supabase.auth.admin.updateUserById(userId, { password, user_metadata: { full_name: name, role: role } });
                    console.log('   Password/Metadata updated.');
                }
                else {
                    console.error('   User claims to exist but not found in list.');
                    return;
                }
            }
            else {
                console.error('   Auth Error:', authError.message);
                return;
            }
        }
        else {
            userId = authData.user.id;
            console.log(`   Success! New Auth User ID: ${userId}`);
        }
        if (!userId)
            return;
        console.log('   Syncing to Public Database...');
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: role,
                companyId: companyId,
                name: name,
            },
            create: {
                id: userId, // CRITICAL: This links the public ID to Auth ID
                email,
                name,
                passwordHash: 'managed_by_supabase_auth',
                role: role,
                companyId: companyId,
                isActive: true
            }
        });
        console.log(`   User synced! ID: ${user.id}`);
        return { email, password, role };
    }
    catch (e) {
        console.error(`Error creating user ${email}:`, e);
    }
}
async function main() {
    try {
        // 1. Ensure Company Exists
        console.log('\n1. Ensuring Company Exists...');
        let company = await prisma.company.findFirst();
        if (!company) {
            console.log(`   Creating default company: ${companyName}`);
            company = await prisma.company.create({
                data: {
                    name: companyName,
                    subscriptionStatus: 'ACTIVE'
                }
            });
            console.log(`   Created Company ID: ${company.id}`);
        }
        else {
            console.log(`   Using existing company: ${company.name} (${company.id})`);
        }
        const companyId = company.id;
        // 2. Create Super Admin
        const adminCreds = await createOrUpdateUser('makjuz@gmail.com', 'Password@123', 'Makjuz CEO', 'SUPER_ADMIN', companyId);
        // 3. Create Freelancer
        const freelancerCreds = await createOrUpdateUser('freelancer@makjuz.com', 'Password@123', 'Makjuz Freelancer', 'FREELANCER', // This will work once schema is updated and client generated
        companyId);
        console.log('\n   ---------------------------------------------------');
        console.log(`   Login Credentials:`);
        if (adminCreds) {
            console.log(`   SUPER ADMIN: ${adminCreds.email} / ${adminCreds.password}`);
        }
        if (freelancerCreds) {
            console.log(`   FREELANCER:  ${freelancerCreds.email} / ${freelancerCreds.password}`);
        }
        console.log('   ---------------------------------------------------');
    }
    catch (e) {
        console.error('Unexpected Error in main:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=create_super_admin.js.map