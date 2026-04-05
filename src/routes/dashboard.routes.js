const { Router } = require("express");
const { getDashboardSummary } = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

// Everyone must be authenticated
router.use(authenticate);

// Only Analyst and Admin roles can view the dashboard
router.get("/summary", authorize('analyst', 'admin'), getDashboardSummary);

module.exports = router;
