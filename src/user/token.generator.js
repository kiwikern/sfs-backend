const jwt = require('jsonwebtoken');
const jwtSecret = require('../secrets.js').jwt;

exports.generateToken = (user, ctx) => {
  const content = {id: user._id, username: user.userName};
  try {
    const jwtOptions = {algorithm: 'HS256', expiresIn: '30d'};
    const token =  jwt.sign(content, jwtSecret.privateKey, jwtOptions);
    ctx.response.body = {token, userName: user.userName};
    ctx.response.status = 201;
  } catch (error) {
    throw new Error('gen_token_failed');
  }
}
