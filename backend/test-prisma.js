import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

console.log('Testing Prisma Client...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? (process.env.DATABASE_URL.substring(0, 20) + '...') : 'undefined');

try {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });
} catch (error) {
    console.error('Error initializing Prisma Client:');
    console.error('Error Message:', error.message);
}
