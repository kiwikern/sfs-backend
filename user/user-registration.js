const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../database/user-service.js');
const jwtSecret = require('../secrets.js').jwt;

exports.register = (ctx) => {
  const userBody = ctx.request.body;
  if (!isValidUser(userBody)) {
    ctx.response.body = {key: 'invalid_request'};
    ctx.response.status = 400;
    return false;
  }
  return userService.findUser({userName: userBody.userName})
    .then(user => user ? Promise.reject(new Error('username_exists')) : null)
    .then(() => userService.findUser({mailAddress: userBody.mailAddress || 'n/a'}))
    .then(user => user ? Promise.reject(new Error('mailaddress_exists')) : null)
    .then(() => createUser(userBody))
    .then(user => userService.addUser(user))
    .then(result => userService.findUser({_id: result.insertedId}))
    .then(user => generateToken(user, ctx))
    .catch(error => handleError(error, ctx));
}

function handleError(error, ctx) {
  switch(error.message) {
    case 'mailaddress_exists':
    case 'username_exists':
      ctx.response.status = 400;
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

function isValidUser(user) {
  if (!user) {
    return false;
  }
  if (!user.userName && typeof user.userName == 'string') {
    return false;
  }
  if (user.mailAddress && !user.mailAddress.includes('@')) {
    return false;
  }
  if (!user.password || user.password.length < 6 && typeof user.password == 'string') {
    return false;
  }
  return true;
}

function createUser(user) {
  return hashPassword(user.password).then((password) => ({
    userName: user.userName,
    mailAddress: user.mailAddress,
    password: password
  }));
}

function generateToken(user, ctx) {
  const content = {id: user._id, username: user.userName};
  try {
    const jwtOptions = {algorithm: 'HS256', expiresIn: '1h'};
    const token =  jwt.sign(content, jwtSecret.privateKey, jwtOptions);
    ctx.response.body = {token};
    ctx.response.status = 201;
  } catch (error) {
    throw new Error('gen_token_failed');
  }
}


function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (!err) {
          return resolve(hash);
        } else {
          return reject(err);
        }
      });
    });
  });
}
