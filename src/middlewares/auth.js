const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');

const auth = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Please authenticate');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, 'Please authenticate');
  }

  req.user = user;
  next();
});

module.exports = auth;