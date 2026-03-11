import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const commonPassword = 'password123'
    const hashedPassword = await bcrypt.hash(commonPassword, 10)

    // 1. Ensure a Company exists
    let company = await prisma.company.findFirst()
    if (!company) {
        company = await prisma.company.create({
            data: {
                name: "Zech Tech",
                domain: "zech.tech",
                subscriptionStatus: "ACTIVE"
            }
        })
        console.log(`Created default company: ${company.name}`)
    } else {
        console.log(`Using existing company: ${company.name}`)
    }

    // 2. Ensure a Department exists
    let department = await prisma.department.findFirst({
        where: { companyId: company.id }
    })
    if (!department) {
        department = await prisma.department.create({
            data: {
                name: "Engineering",
                companyId: company.id
            }
        })
        console.log(`Created default department: ${department.name}`)
    }

    // 3. Upsert Users
    const users = [
        // Super Admins
        {
            email: 'admin@zech.com',
            name: 'Administrative User',
            role: Role.SUPER_ADMIN,
        },
        {
            email: 'admin2@zech.com',
            name: 'Admin Two',
            role: Role.SUPER_ADMIN,
        },
        {
            email: 'boss@zech.com',
            name: 'Big Boss',
            role: Role.SUPER_ADMIN,
        },

        // Managers
        {
            email: 'manager@zech.com',
            name: 'Manager One',
            role: Role.MANAGER,
        },
        {
            email: 'manager2@zech.com',
            name: 'Manager Two',
            role: Role.MANAGER,
        },
        {
            email: 'supervisor@zech.com',
            name: 'Supervisor User',
            role: Role.MANAGER,
        },

        // Employees
        {
            email: 'employee@zech.com',
            name: 'Employee One',
            role: Role.EMPLOYEE,
        },
        {
            email: 'employee2@zech.com',
            name: 'Employee Two',
            role: Role.EMPLOYEE,
        },
        {
            email: 'dev@zech.com',
            name: 'Developer User',
            role: Role.EMPLOYEE,
        },
        {
            email: 'designer@zech.com',
            name: 'Designer User',
            role: Role.EMPLOYEE,
        },

        // Clients
        {
            email: 'client@zech.com',
            name: 'Client One',
            role: Role.CLIENT,
        },
        {
            email: 'client2@zech.com',
            name: 'Client Two',
            role: Role.CLIENT,
        },
        {
            email: 'vip@zech.com',
            name: 'VIP Client',
            role: Role.CLIENT,
        },
    ]

    console.log('Seeding users...')

    for (const user of users) {
        const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                passwordHash: hashedPassword,
                role: user.role,
                // Ensure they belong to the company if not already
                companyId: company.id,
            },
            create: {
                email: user.email,
                passwordHash: hashedPassword,
                name: user.name,
                role: user.role,
                companyId: company.id,
                departmentId: department.id,
                isActive: true,
                isFirstLogin: false,
                workingHoursStart: "09:00",
                workingHoursEnd: "17:00",
                timezone: "UTC"
            },
        })
        console.log(`- ${upsertedUser.email} (${upsertedUser.role})`)
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
