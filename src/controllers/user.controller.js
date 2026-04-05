const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(parseInt(req.params.id), req.body.role);
    return sendSuccess(res, user, 'User role updated successfully');
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(parseInt(req.params.id), req.body.status, req.user.id);
    return sendSuccess(res, user, 'User status updated successfully');
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateUserStatus };
