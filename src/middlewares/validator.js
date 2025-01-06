const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const error = new ApiError(400, 'Validation error', false);
    error.errors = errors.array();
    next(error);
  };
};

module.exports = {
  validate
};