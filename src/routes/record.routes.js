const { Router } = require("express");
const { body, param, query } = require('express-validator');
const { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } = require("../controllers/record.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

router.use(authenticate); // Require login for all record routes

// Shared Access (Viewers, Analysts, Admins) 

router.get(
  "/",
  authorize('viewer', 'analyst', 'admin'),
  [
    query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format'),
    query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit between 1 and 100'),
    validate
  ],
  getRecords
);

router.get(
  "/:id",
  authorize('viewer', 'analyst', 'admin'),
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    validate
  ],
  getRecordById
);

// Manage Access (Analysts and Admins) 
router.post(
  "/",
  authorize('analyst', 'admin'),
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
    validate
  ],
  createRecord
);

router.patch(
  "/:id",
  authorize('analyst', 'admin'),
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    validate
  ],
  updateRecord
);

router.delete(
  "/:id",
  authorize('admin'),
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    validate
  ],
  deleteRecord
);

module.exports = router;
