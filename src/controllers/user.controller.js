const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/response');

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Update a user's role
const updateUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    
    return sendSuccess(res, user, 'User role updated successfully');
  } catch (err) {
    // P2025 is Prisma's error code for "Record to update not found"
    if (err.code === "P2025") return sendError(res, 'User not found', 404);
    next(err);
  }
};

// Update a user's status (active/inactive)
const updateUserStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    
    return sendSuccess(res, user, 'User status updated successfully');
  } catch (err) {
    if (err.code === "P2025") return sendError(res, 'User not found', 404);
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateUserStatus };
