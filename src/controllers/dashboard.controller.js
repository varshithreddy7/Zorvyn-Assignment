const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const getDashboardSummary = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.getSummary();
    
    return sendSuccess(res, dashboardData, 'Dashboard summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
