const jwt = require('jsonwebtoken');
const jwtSecret = require('../secrets.js').jwt;
const log = require('../logger/logger.instance').getLogger('TokenGenerator');

exports.generateToken = (user, subject, duration = '30d') => {
  const content = {id: user._id, username: user.userName, subject};
  try {
    const jwtOptions = {algorithm: 'HS256', expiresIn: duration};
    return jwt.sign(content, jwtSecret.privateKey, jwtOptions);
  } catch (error) {
    log.error('could not generate token', error);
    throw new Error('gen_token_failed');
  }
};
