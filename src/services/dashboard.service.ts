import { prisma } from '../prisma/client';

export const getSummary = async (userId?: string) => {
  // Shared base filter 
  const base = { isDeleted: false, ...(userId && { userId }) };

  const [incomeAgg, expenseAgg, recordCount, recentRecords] = await Promise.all([
    prisma.record.aggregate({
      _sum: { amount: true },
      where: { ...base, type: 'INCOME' },
    }),
    prisma.record.aggregate({
      _sum: { amount: true },
      where: { ...base, type: 'EXPENSE' },
    }),
    prisma.record.count({ where: base }),
    prisma.record.findMany({
      where: base,
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, amount: true, type: true, category: true, date: true, note: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    totalRecords: recordCount,
    recentActivity: recentRecords,
  };
};

export const getCategoryBreakdown = async (userId?: string) => {
  const base = { isDeleted: false, ...(userId && { userId }) };

  const breakdown = await prisma.record.groupBy({
    by: ['category', 'type'],
    _sum: { amount: true },
    _count: { id: true },
    where: base,
    orderBy: { _sum: { amount: 'desc' } },
  });

  return breakdown.map((item) => ({
    category: item.category,
    type: item.type,
    total: item._sum.amount || 0,
    count: item._count.id,
  }));
};

export const getMonthlyTrends = async (userId?: string, months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const base = { isDeleted: false, date: { gte: since }, ...(userId && { userId }) };

  const records = await prisma.record.findMany({
    where: base,
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  });

  // Group by year-month
  const monthMap: Record<string, { income: number; expense: number }> = {};

  for (const r of records) {
    const key = r.date.toISOString().slice(0, 7); // "2024-03"
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    if (r.type === 'INCOME') monthMap[key].income += r.amount;
    else monthMap[key].expense += r.amount;
  }

  return Object.entries(monthMap).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
  }));
};

export const getWeeklyTrends = async (userId?: string) => {
  const since = new Date();
  since.setDate(since.getDate() - 28); // last 4 weeks

  const base = { isDeleted: false, date: { gte: since }, ...(userId && { userId }) };

  const records = await prisma.record.findMany({
    where: base,
    select: { amount: true, type: true, date: true },
  });

  const weekMap: Record<string, { income: number; expense: number }> = {};

  for (const r of records) {
    const d = r.date;
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    if (!weekMap[key]) weekMap[key] = { income: 0, expense: 0 };
    if (r.type === 'INCOME') weekMap[key].income += r.amount;
    else weekMap[key].expense += r.amount;
  }

  return Object.entries(weekMap).map(([week, data]) => ({
    week,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
  }));
};
