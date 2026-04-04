const { validationResult } = require('express-validator');
const { sendError } = require("../utils/response");

// Runs after express-validation chains and collects all errors and returns them in a consistent shape
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const details = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg
    }));

    return sendError(res, "Validation failed!", 422, details);
  }
  next();
};

module.exports = { validate };