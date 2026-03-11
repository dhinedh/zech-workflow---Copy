import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'mugil9451@gmail.com'
    const password = 'Password@123'
    const name = 'Mugil Super Admin'
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    console.log(`Creating Super Admin: ${email}...`)

    // 1. Ensure a Company exists (required for User creation)
    let company = await prisma.company.findFirst()
    if (!company) {
        company = await prisma.company.create({
            data: {
                name: "Zech Tech",
                domain: "zech.tech",
                subscriptionStatus: "ACTIVE"
            }
        })
    }

    // 2. Create the Super Admin
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: Role.SUPER_ADMIN,
        },
        create: {
            email,
            passwordHash: hashedPassword,
            name,
            role: Role.SUPER_ADMIN,
            employeeId: 'EMP-0001',
            companyId: company.id,
            isActive: true,
            isFirstLogin: false,
        },
    })

    console.log('-------------------------------')
    console.log('SUPER ADMIN CREATED SUCCESSFULLY')
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${password}`)
    console.log(`Employee ID: ${user.employeeId}`)
    console.log(`Role: ${user.role}`)
    console.log('-------------------------------')
}

main()
    .catch((e) => {
        console.error('Error creating super admin:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
