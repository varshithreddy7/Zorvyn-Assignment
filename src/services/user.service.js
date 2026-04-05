const prisma = require('../config/prisma');

class UserService {
  async getAllUsers() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } });
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } });
    if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
    return user;
  }

  async updateUserRole(id, role) {
    try {
      return await prisma.user.update({
        where: { id }, data: { role }, select: { id: true, name: true, email: true, role: true, status: true }
      });
    } catch(err) {
      if(err.code === 'P2025') { const e = new Error('User not found'); e.statusCode = 404; throw e; }
      throw err;
    }
  }

  async updateUserStatus(id, status, requesterId) {
    if (id === requesterId) { const err = new Error('Cannot modify your own account status'); err.statusCode = 400; throw err; }
    try {
      return await prisma.user.update({
        where: { id }, data: { status }, select: { id: true, name: true, email: true, role: true, status: true }
      });
    } catch(err) {
      if(err.code === 'P2025') { const e = new Error('User not found'); e.statusCode = 404; throw e; }
      throw err;
    }
  }
}

module.exports = new UserService();
