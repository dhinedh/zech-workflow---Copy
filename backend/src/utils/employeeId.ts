import prisma from '../config/database.js';

export const generateEmployeeId = async (): Promise<string> => {
    const year = new Date().getFullYear();

    // Find or create sequence for current year
    const sequence = await prisma.employeeIdSequence.upsert({
        where: { year },
        update: {},
        create: { year, lastSequence: 0 }
    });

    // Increment sequence
    const nextSequence = sequence.lastSequence + 1;

    // Update sequence in DB
    await prisma.employeeIdSequence.update({
        where: { year },
        data: { lastSequence: nextSequence }
    });

    // Format: MJZ-YYYY-XXX
    const paddedSequence = nextSequence.toString().padStart(3, '0');
    return `MJZ-${year}-${paddedSequence}`;
};
