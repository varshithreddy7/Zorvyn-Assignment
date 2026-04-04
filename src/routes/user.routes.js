const { Router } = require("express");
const { body, param } = require('express-validator');
const { getAllUsers, getUserById, updateUserRole, updateUserStatus } = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// Require user to be authenticated first
router.use(authenticate);

// Require user to be an admin for all routes in this file
router.use(authorize('admin'));

router.get("/", getAllUsers);

router.get(
  "/:id", 
  [
    param('id').isInt().withMessage('User ID must be an integer'),
    validate
  ], 
  getUserById
);

router.put(
  "/:id/role", 
  [
    param('id').isInt().withMessage('User ID must be an integer'),
    body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role provided'),
    validate
  ], 
  updateUserRole
);

router.put(
  "/:id/status", 
  [
    param('id').isInt().withMessage('User ID must be an integer'),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
    validate
  ], 
  updateUserStatus
);

module.exports = router;
