const jwt = require('jsonwebtoken');
const moment = require('moment');

const generateToken = (userId, expires, type, secret = process.env.JWT_SECRET) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION || '1d', 'days');
  const accessToken = generateToken(user.id, accessTokenExpires, 'ACCESS');

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    }
  };
};

module.exports = {
  generateToken,
  generateAuthTokens,
};