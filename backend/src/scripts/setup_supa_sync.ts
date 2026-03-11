
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

async function setupTrigger() {
    console.log('Setting up Database Triggers...');

    // We need to use Raw SQL because Prisma Migration is not set up for this ad-hoc task
    // and we need to interact with `auth.users` which is outside public schema.

    const displayRoleCast = `(new.raw_user_meta_data->>'role')::"Role"`;

    // Note: We use "User" (quoted) because Prisma likely created it as "User" (case sensitive) or we assume standard Prisma naming.
    // If Prisma used lowercase 'user', we might need to adjust. Standard Prisma with Postgres uses "User".

    const query = `
    create or replace function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer set search_path = public
    as $$
    begin
      insert into public."User" (id, email, name, role, "passwordHash", "isActive", "updatedAt")
      values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        coalesce(${displayRoleCast}, 'EMPLOYEE'),
        'managed_by_supabase_auth',
        true,
        now()
      );
      return new;
    end;
    $$;
    
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    `;

    try {
        // We cannot run multi-statement queries easily with $executeRaw in some drivers, 
        // but let's try splitting them or using a transaction.
        await prisma.$executeRawUnsafe(`
            create or replace function public.handle_new_user()
            returns trigger
            language plpgsql
            security definer set search_path = public
            as $$
            begin
              insert into public."User" (id, email, name, role, "passwordHash", "isActive", "updatedAt")
              values (
                new.id,
                new.email,
                coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
                coalesce((new.raw_user_meta_data->>'role')::"Role", 'EMPLOYEE'),
                'managed_by_supabase_auth',
                true,
                now()
              );
              return new;
            end;
            $$;
        `);
        console.log(' - Function handle_new_user created/updated.');

        await prisma.$executeRawUnsafe(`drop trigger if exists on_auth_user_created on auth.users;`);
        await prisma.$executeRawUnsafe(`
            create trigger on_auth_user_created
              after insert on auth.users
              for each row execute procedure public.handle_new_user();
        `);
        console.log(' - Trigger on_auth_user_created created.');

    } catch (e) {
        console.error('Error creating trigger:', e);
    }
}

async function backfillUsers() {
    console.log('\nBackfilling existing Auth users to public.User...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error || !users) {
        console.error('Failed to list users:', error);
        return;
    }

    let createdCount = 0;

    for (const user of users) {
        const exists = await prisma.user.findUnique({ where: { id: user.id } });
        if (!exists) {
            console.log(` - Creating public user for: ${user.email}`);
            const role = user.user_metadata?.role || 'EMPLOYEE';
            const name = user.user_metadata?.full_name || 'No Name';

            try {
                await prisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email!,
                        name: name,
                        role: role,
                        passwordHash: 'managed_by_supabase_auth',
                        isActive: true
                    }
                });
                createdCount++;
            } catch (e) {
                console.error(`   Failed to create user ${user.email}:`, e);
            }
        }
    }
    console.log(`Backfill complete. Created ${createdCount} users.`);
}

async function main() {
    await setupTrigger();
    await backfillUsers();
    await prisma.$disconnect();
}

main();
