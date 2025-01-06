const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');
const User = require('../models/user.model');

const createUser = async (userBody) => {
  if (await User.findOne({ email: userBody.email })) {
    throw new ApiError(400, 'Email already taken');
  }
  return User.create(userBody);
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  return user;
};

module.exports = {
  createUser,
  loginUser
};
