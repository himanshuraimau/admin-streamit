import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Admin user credentials
  const adminEmail = 'admin@streamit.com';
  const adminPassword = 'Admin@123456';
  const adminUsername = 'admin';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Username: ${adminUsername}`);
    console.log(`🔑 Password: ${adminPassword}\n`);
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user with account
  const adminUser = await prisma.user.create({
    data: {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Super Admin',
      email: adminEmail,
      username: adminUsername,
      emailVerified: true,
      role: 'SUPER_ADMIN',
      bio: 'System Administrator',
      accounts: {
        create: {
          id: `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          accountId: adminEmail,
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  });

  console.log('✅ Admin user created successfully!\n');
  console.log('📋 Admin Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email:    ${adminEmail}`);
  console.log(`👤 Username: ${adminUsername}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log(`👑 Role:     SUPER_ADMIN`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  Please change the password after first login!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✨ Seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

