// src/seed.ts
import { prisma } from './lib/db.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seedAdmin() {
    const email = '13742shyuvraj@gmail.com';
    const password = 'AdminPassword123!';
    const name = 'Super Admin';

    console.log('🌱 Starting admin seed...');
    console.log('📊 Database URL configured:', process.env.DATABASE_URL ? '✓' : '✗');

    try {
        // Test database connection
        await prisma.$connect();
        console.log('✓ Database connected successfully');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin record directly (no User relation needed)
        const admin = await prisma.admin.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                name: name,
                lastLoginAt: new Date(),
            },
            create: {
                email: email,
                password: hashedPassword,
                name: name,
                lastLoginAt: new Date(),
                loginCount: 0,
            },
        });

        console.log('✓ Admin record created/updated:', admin.id);

        console.log('\n✅ Super admin seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Password is now properly hashed in the database!');
        console.log('⚠️  This is the ONLY admin account for the platform!\n');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('✓ Database disconnected');
    }
}

// Run the seed function
seedAdmin()
    .then(() => {
        console.log('✓ Seed completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    });