const bcrypt = require('bcryptjs');
const userService = require('./user.service.js');
const userSanitizer = require('./user.sanitizer.js');
const tokenGenerator = require('./token.generator.js');

exports.register = (ctx) => {
  const userBody = userSanitizer.getNormalizedUserIfValid(ctx.request.body);
  if (!userBody || !userBody.userName) {
    ctx.response.body = {key: 'invalid_request'};
    ctx.response.status = 400;
    return false;
  }
  return userService.findUser({userName: userBody.userName.toLowerCase()})
    .then(user => user ? Promise.reject(new Error('username_exists')) : null)
    .then(() => userService.findUser({mailAddress: userBody.mailAddress || 'n/a'}))
    .then(user => user ? Promise.reject(new Error('mailaddress_exists')) : null)
    .then(() => createUser(userBody))
    .then(user => userService.addUser(user))
    .then(result => userService.findUser({_id: result.insertedId}))
    .then(user => tokenGenerator.generateToken(user, ctx))
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

function createUser(user) {
  return hashPassword(user.password).then((password) => ({
    userName: user.userName,
    mailAddress: user.mailAddress,
    password: password
  }));
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (!err) {
        return resolve(hash);
      } else {
        return reject(err);
      }
    });
  });
}
