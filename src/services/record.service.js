const prisma = require('../config/prisma');

class RecordService {
  async createRecord(data, userId) {
    return prisma.financialRecord.create({
      data: {
        ...data,
        date: new Date(data.date),
        createdById: userId
      }
    });
  }

  async getRecords(query) {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const whereParams = { deletedAt: null };
    if (type) whereParams.type = type;
    if (category) whereParams.category = category;
    if (startDate || endDate) {
      whereParams.date = {};
      if (startDate) whereParams.date.gte = new Date(startDate);
      if (endDate) whereParams.date.lte = new Date(endDate);
    }
    const [total, records] = await Promise.all([
      prisma.financialRecord.count({ where: whereParams }),
      prisma.financialRecord.findMany({
        where: whereParams, skip, take, orderBy: { date: 'desc' }, include: { createdBy: { select: { name: true, email: true } } }
      })
    ]);
    return { pagination: { total, page: parseInt(page), pages: Math.ceil(total / take) }, records };
  }

  async getRecordById(id) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null }, include: { createdBy: { select: { name: true, email: true } } }
    });
    if (!record) { const err = new Error('Record not found'); err.statusCode = 404; throw err; }
    return record;
  }

  async updateRecord(id, updates) {
    if (updates.date) updates.date = new Date(updates.date);
    const existing = await prisma.financialRecord.findFirst({ where: { id, deletedAt: null } });
    if (!existing) { const err = new Error('Record not found'); err.statusCode = 404; throw err; }
    return prisma.financialRecord.update({ where: { id }, data: updates });
  }

  async deleteRecord(id) {
    const existing = await prisma.financialRecord.findFirst({ where: { id, deletedAt: null } });
    if (!existing) { const err = new Error('Record not found'); err.statusCode = 404; throw err; }
    await prisma.financialRecord.update({ where: { id }, data: { deletedAt: new Date() } });
    return null;
  }
}

module.exports = new RecordService();
