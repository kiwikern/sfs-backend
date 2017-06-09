const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../database/user-service.js');
const jwtSecret = require('../secrets.js').jwt;
const userSanitizer = require('./user-sanitizer.js');

exports.login = (ctx) => {
  const userBody = userSanitizer.getNormalizedUserIfValid(ctx.request.body);
  if (!userBody) {
    ctx.response.body = {key: 'invalid_request'};
    ctx.response.status = 400;
    return false;
  }
  return userService.findUser(getSearchCond(userBody))
    .then(user => user ? user : Promise.reject(new Error('user_not_found')))
    .then(user => checkPassword(user, userBody.password))
    .then(user => generateToken(user, ctx))
    .catch(error => handleError(error, ctx));
}

function handleError(error, ctx) {
  switch(error.message) {
    case 'user_not_found':
      ctx.response.status = 404;
      ctx.response.body = {key: error.message};
      break;
    case 'wrong_password':
      ctx.response.status = 301;
      ctx.response.body = {key: error.message};
      break;
    case 'gen_token_failed':
      ctx.response.status = 500;
      ctx.response.body = {key: error.message};
      break;
    default:
      ctx.response.status = 500;
    };
}

function getSearchCond(user) {
  if (user._id) {
    return user;
  }
    const userName = user.userName ? user.userName.toLowerCase() : null;
    return {$or: [
      {mailAddress: user.mailAddress || 'NONE_GIVEN'},
      {userName}
    ]};
}

function generateToken(user, ctx) {
  const content = {id: user._id, username: user.userName};
  try {
    const jwtOptions = {algorithm: 'HS256', expiresIn: '1h'};
    const token =  jwt.sign(content, jwtSecret.privateKey, jwtOptions);
    ctx.response.body = {token, userName: user.userName};
    ctx.response.status = 201;
  } catch (error) {
    throw new Error('gen_token_failed');
  }
}

function checkPassword(user, requestPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(requestPassword, user.password, (err, isValid) => {
      if (isValid) {
        return resolve(user);
      } else {
        return reject(new Error('wrong_password'));
      }
    });
  });
}
