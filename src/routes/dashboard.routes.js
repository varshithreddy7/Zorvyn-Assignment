const { Router } = require("express");
const { getDashboardSummary } = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth");

const router = Router();

// Everyone who is authenticated (Viewer, Analyst, Admin) can view the dashboard
router.use(authenticate);

router.get("/summary", getDashboardSummary);

module.exports = router;
