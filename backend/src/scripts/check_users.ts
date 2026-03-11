
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function check() {
    const userCount = await prisma.user.count();
    console.log(`Total users in public.User: ${userCount}`);

    const targetUserId = '7c177e97-de62-4978-80c5-389d84438f76';
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (user) {
        console.log('Target user found:', user);
    } else {
        console.log(`Target user ${targetUserId} NOT found.`);
        const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
        console.log('Available users:', allUsers);
    }

    await prisma.$disconnect();
}

check();
