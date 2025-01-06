const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
const { ApiError } = require('../utils/apiError');

const register = catchAsync(async (req, res) => {
  const user = await authService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(201).json({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.json({ user, tokens });
});

module.exports = {
  register,
  login
};