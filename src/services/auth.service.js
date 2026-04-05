const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

class AuthService {
  async register({ name, email, password, role }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const err = new Error('Email already in use');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role || 'viewer';

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole }
    });

    const token = signToken({ id: user.id, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    if (user.status !== 'active') {
      const err = new Error('Your account is deactivated');
      err.statusCode = 403;
      throw err;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const token = signToken({ id: user.id, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    };
  }
}

module.exports = new AuthService();
