const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/response');

const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await prisma.financialRecord.create({
      data: {
        amount,
        type, 
        category,
        date: new Date(date),
        notes,
        createdById: req.user.id
      }
    });

    return sendSuccess(res, record, 'Financial record created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter map dynamically
    const whereParams = { deletedAt: null }; // Exclude soft-deleted

    if (type) whereParams.type = type;
    if (category) whereParams.category = category;
    
    // Date range filter map
    if (startDate || endDate) {
      whereParams.date = {};
      if (startDate) whereParams.date.gte = new Date(startDate);
      if (endDate) whereParams.date.lte = new Date(endDate);
    }

    const [total, records] = await prisma.$transaction([
      prisma.financialRecord.count({ where: whereParams }),
      prisma.financialRecord.findMany({
        where: whereParams,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { name: true, email: true } } }
      })
    ]);

    return sendSuccess(res, {
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / take)
      },
      records
    }, 'Records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);

    const record = await prisma.financialRecord.findFirst({
      where: { id: recordId, deletedAt: null },
      include: { createdBy: { select: { name: true, email: true } } }
    });

    if (!record) return sendError(res, 'Record not found', 404);

    return sendSuccess(res, record, 'Record retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);
    const updates = req.body;

    if (updates.date) updates.date = new Date(updates.date);

    // Make sure record exists and is not softly deleted first
    const existing = await prisma.financialRecord.findFirst({ where: { id: recordId, deletedAt: null } });
    if (!existing) return sendError(res, 'Record not found', 404);

    const record = await prisma.financialRecord.update({
      where: { id: recordId },
      data: updates
    });
    
    return sendSuccess(res, record, 'Record updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);

    const existing = await prisma.financialRecord.findFirst({ where: { id: recordId, deletedAt: null } });
    if (!existing) return sendError(res, 'Record not found', 404);

    // Soft delete
    await prisma.financialRecord.update({
      where: { id: recordId },
      data: { deletedAt: new Date() }
    });

    return sendSuccess(res, null, 'Record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
