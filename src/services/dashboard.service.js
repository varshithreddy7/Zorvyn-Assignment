const prisma = require('../config/prisma');

class DashboardService {
  async getSummary() {
    // 1. Raw SQL query for aggregation utilizing COALESCE and ::float
    // This perfectly prevents a 'null' break if no records exist
    const [summaryRaw] = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::float as "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::float as "totalExpense"
      FROM "financial_records" 
      WHERE "deletedAt" IS NULL
    `;

    const totalIncome = summaryRaw.totalIncome || 0;
    const totalExpense = summaryRaw.totalExpense || 0;
    const netBalance = totalIncome - totalExpense;

    // 2. Fetch category-wise breakdowns
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

    // 3. Fetch latest activity feed
    const recentActivity = await prisma.financialRecord.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, amount: true, type: true, category: true, date: true, notes: true
      }
    });

    return {
      summary: { totalIncome, totalExpense, netBalance },
      categoryBreakdown,
      recentActivity
    };
  }
}

module.exports = new DashboardService();
