const prisma = require('../config/prisma');

class DashboardService {
  async getSummary() {
    const [summaryRaw] = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::float as "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::float as "totalExpense",
        COUNT(*)::int as "totalRecords"
      FROM "financial_records" 
      WHERE "deletedAt" IS NULL
    `;

    const totalIncome = summaryRaw.totalIncome || 0;
    const totalExpense = summaryRaw.totalExpense || 0;
    const netBalance = totalIncome - totalExpense;
    const totalRecords = summaryRaw.totalRecords || 0;

    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("date", 'YYYY-MM') as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::float as "income",
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::float as "expense"
      FROM "financial_records"
      WHERE "deletedAt" IS NULL
      GROUP BY TO_CHAR("date", 'YYYY-MM')
      ORDER BY month ASC
    `;

    const categoryAggregations = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: { deletedAt: null },
      _sum: { amount: true }
    });

    const categoryBreakdown = categoryAggregations.map(cat => ({
      category: cat.category,
      type: cat.type,
      total: Number(cat._sum.amount || 0)
    }));

    const recentActivity = await prisma.financialRecord.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, amount: true, type: true, category: true, date: true, notes: true }
    });

    return {
      summary: { totalIncome, totalExpense, netBalance, totalRecords },
      monthlyTrends,
      categoryBreakdown,
      recentActivity
    };
  }
}

module.exports = new DashboardService();
