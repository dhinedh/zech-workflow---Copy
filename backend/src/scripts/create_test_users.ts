import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function createTestUsers() {
    try {
        console.log('\n🚀 Creating test users...\n');

        // 1. Ensure Company Exists
        console.log('1. Ensuring Company Exists...');
        let company = await prisma.company.findFirst();
        if (!company) {
            console.log('   Creating default company: Makjuz Corp');
            company = await prisma.company.create({
                data: {
                    name: 'Makjuz Corp',
                    subscriptionStatus: 'ACTIVE'
                }
            });
            console.log(`   ✅ Created Company ID: ${company.id}`);
        } else {
            console.log(`   ✅ Using existing company: ${company.name} (${company.id})`);
        }

        const companyId = company.id;

        // 2. Create users with bcrypt hashed passwords
        const users = [
            {
                email: 'admin@makjuz.com',
                password: 'Password@123',
                name: 'Admin User',
                role: 'SUPER_ADMIN',
                employeeId: 'EMP-2024-001'
            },
            {
                email: 'manager@makjuz.com',
                password: 'Password@123',
                name: 'Manager User',
                role: 'MANAGER',
                employeeId: 'EMP-2024-002'
            },
            {
                email: 'employee@makjuz.com',
                password: 'Password@123',
                name: 'Employee User',
                role: 'EMPLOYEE',
                employeeId: 'EMP-2024-003'
            }
        ];

        console.log('\n2. Creating Users...');
        const credentials = [];

        for (const userData of users) {
            const passwordHash = await bcrypt.hash(userData.password, 10);

            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    passwordHash,
                    name: userData.name,
                    role: userData.role as any,
                    companyId,
                    isActive: true
                },
                create: {
                    email: userData.email,
                    passwordHash,
                    name: userData.name,
                    role: userData.role as any,
                    employeeId: userData.employeeId,
                    companyId,
                    isActive: true,
                    isFirstLogin: false
                }
            });

            console.log(`   ✅ ${userData.role}: ${user.email} (ID: ${user.id})`);
            credentials.push({
                email: userData.email,
                password: userData.password,
                role: userData.role
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TEST USERS CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nLogin Credentials:\n');
        credentials.forEach(cred => {
            console.log(`${cred.role.padEnd(15)} | ${cred.email.padEnd(25)} | ${cred.password}`);
        });
        console.log('\n' + '='.repeat(60));
        console.log('You can now login at: http://localhost:3000/login');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
