const { Router } = require("express");
const { body } = require('express-validator');
const { register, login } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");

const router = Router();

router.post(
  "/register",
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role, must be viewer, analyst or admin'),
    validate
  ],
  register
);

router.post(
  "/login",
  [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

module.exports = router;
