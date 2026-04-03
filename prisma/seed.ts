import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Admin@1234', 12);

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Jane Analyst',
      email: 'analyst@finance.com',
      password: await bcrypt.hash('Analyst@1234', 12),
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Bob Viewer',
      email: 'viewer@finance.com',
      password: await bcrypt.hash('Viewer@1234', 12),
      role: 'VIEWER',
    },
  });

  // Create sample financial records
  const categories = ['Salary', 'Freelance', 'Food', 'Rent', 'Transport', 'Entertainment', 'Utilities'];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = i % 3 === 0;
    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? ('INCOME' as const) : ('EXPENSE' as const),
      category: categories[Math.floor(Math.random() * categories.length)],
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      note: isIncome ? 'Monthly credit' : 'Regular expense',
      userId: [admin.id, analyst.id, viewer.id][i % 3],
    });
  }

  await prisma.record.createMany({ data: records });

  console.log('✅ Seed completed');
  console.log('👤 Admin:   admin@finance.com    / Admin@1234');
  console.log('📊 Analyst: analyst@finance.com  / Analyst@1234');
  console.log('👁️  Viewer:  viewer@finance.com   / Viewer@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
