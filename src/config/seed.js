const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Reset database safely (delete relations first)
  await prisma.financialRecord.deleteMany();
  console.log('Cleared existing records...');
  await prisma.user.deleteMany();
  console.log('Cleared existing users...');

  // Hash standard demo password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Role Users
  const admin = await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@zorvyn.com', password: passwordHash, role: 'admin' }
  });

  const analyst = await prisma.user.create({
    data: { name: 'Finance Analyst', email: 'analyst@zorvyn.com', password: passwordHash, role: 'analyst' }
  });

  const viewer = await prisma.user.create({
    data: { name: 'Readonly Viewer', email: 'viewer@zorvyn.com', password: passwordHash, role: 'viewer' }
  });

  console.log('✅ Base users seeded successfully.');

  // 2. Create Realistic Financial Data
  const now = new Date();
  
  // Helper to subtract days
  const daysAgo = (days) => new Date(new Date().setDate(now.getDate() - days));

  const demoRecords = [
    { amount: 5000, type: 'income', category: 'Salary', date: daysAgo(30), notes: 'Monthly salary', createdById: admin.id },
    { amount: 200, type: 'expense', category: 'Utilities', date: daysAgo(25), notes: 'Electric/Water bill', createdById: admin.id },
    { amount: 1200, type: 'income', category: 'Freelance', date: daysAgo(15), notes: 'Consulting gig', createdById: admin.id },
    { amount: 50, type: 'expense', category: 'Food', date: daysAgo(12), notes: 'Dinner Out', createdById: admin.id },
    { amount: 300, type: 'expense', category: 'Software', date: daysAgo(10), notes: 'Cloud hosting / SaaS', createdById: admin.id },
    { amount: 4500, type: 'income', category: 'Salary', date: daysAgo(2), notes: 'Monthly salary', createdById: admin.id },
    { amount: 1500, type: 'expense', category: 'Rent', date: daysAgo(1), notes: 'Office lease', createdById: admin.id },
  ];

  await prisma.financialRecord.createMany({
    data: demoRecords
  });

  console.log('✅ Pre-populated financial records seeded successfully.');

  console.log('\n=============================================');
  console.log('🎉 Seeding Complete! You can login with:\n');
  console.log('   Admin:   admin@zorvyn.com   / password123');
  console.log('   Analyst: analyst@zorvyn.com / password123');
  console.log('   Viewer:  viewer@zorvyn.com  / password123');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed database:\n', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
