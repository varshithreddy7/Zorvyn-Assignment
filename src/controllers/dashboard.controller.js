const prisma = require('../config/prisma');
const { sendSuccess } = require('../utils/response');

const getDashboardSummary = async (req, res, next) => {
  try {
    // Only aggregate non-deleted records
    const baseWhere = { deletedAt: null };

    // 1. Calculate overall Income and Expense aggregations
    // Using Prisma groupBy translates to ultra-fast SQL GROUP BY queries
    const aggregations = await prisma.financialRecord.groupBy({
      by: ['type'],
      where: baseWhere,
      _sum: {
        amount: true
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    aggregations.forEach(agg => {
      if (agg.type === 'income') totalIncome = Number(agg._sum.amount || 0);
      if (agg.type === 'expense') totalExpense = Number(agg._sum.amount || 0);
    });

    const netBalance = totalIncome - totalExpense;

    // 2. Fetch category-wise breakdowns
    const categoryAggregations = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: baseWhere,
      _sum: {
        amount: true
      }
    });

    const categoryBreakdown = categoryAggregations.map(cat => ({
      category: cat.category,
      type: cat.type,
      total: Number(cat._sum.amount || 0)
    }));

    // 3. Fetch latest activity feed
    const recentActivity = await prisma.financialRecord.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' }, // Descending by creation time
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        notes: true
      }
    });

    return sendSuccess(res, {
      summary: {
        totalIncome,
        totalExpense,
        netBalance
      },
      categoryBreakdown,
      recentActivity
    }, 'Dashboard summary retrieved successfully');

  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
