import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up users...')
    const deletedCount = await prisma.user.deleteMany({})
    console.log(`Successfully deleted ${deletedCount.count} users.`)
}

main()
    .catch((e) => {
        console.error('Error during cleanup:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
