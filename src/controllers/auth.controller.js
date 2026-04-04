const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email already in use', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Allowing role assignment during registration for assignment simplicity
    const userRole = role || 'viewer';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole
      }
    });

    const token = signToken({ id: user.id, role: user.role });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return sendSuccess(res, { user: safeUser, token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Your account is deactivated', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = signToken({ id: user.id, role: user.role });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    
    return sendSuccess(res, { user: safeUser, token }, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
