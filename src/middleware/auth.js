const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

// Verification of the JWT and attaches user's info
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith('Bearer')){
    return sendError(res, 'Authorization Token Required!', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch(err) {
    return sendError(res, 'Invalid Token!', 401);
  }
};

/**
 * Role hierarchy: ADMIN | ANALYST | VIEWER
 * ADMIN: only admins
 * ANALYST: analysts and admins
 * VIEWER: all authenticated users
 */
const ROLE_LEVEL = { viewer:1, analyst:2, admin:3 };

const authorize = (...allowedRoles) => (req, res, next) => {
  const userLevel = ROLE_LEVEL[req.user?.role] || 0;
  const requireLevel = Math.min(...allowedRoles.map((r) => ROLE_LEVEL[r] || 99));

  if(userLevel < requireLevel){
    return sendError(res, 'You do not have permission to perform this action.', 403);
  }
  next();
};

module.exports = { authenticate, authorize };