const recordService = require('../services/record.service');
const { sendSuccess } = require('../utils/response');

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user.id);
    return sendSuccess(res, record, 'Financial record created successfully', 201);
  } catch (error) { next(error); }
};

const getRecords = async (req, res, next) => {
  try {
    const data = await recordService.getRecords(req.query);
    return sendSuccess(res, data, 'Records retrieved successfully');
  } catch (error) { next(error); }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(parseInt(req.params.id));
    return sendSuccess(res, record, 'Record retrieved successfully');
  } catch (error) { next(error); }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(parseInt(req.params.id), req.body);
    return sendSuccess(res, record, 'Record updated successfully');
  } catch (error) { next(error); }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(parseInt(req.params.id));
    return sendSuccess(res, null, 'Record deleted successfully');
  } catch (error) { next(error); }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
