const userService = require('./user.service.js');
const userSanitizer = require('./user.sanitizer.js');
const tokenGenerator = require('./token.generator.js');
const log = require('../logger/logger.instance').getLogger('UserRegistration');

exports.register = (ctx) => {
  const userBody = userSanitizer.getNormalizedUserIfValid(ctx.request.body);
  if (!userBody || !userBody.userName) {
    ctx.response.body = {key: 'invalid_request'};
    ctx.response.status = 400;
    log.warn('got invalid request', userBody);
    return false;
  }
  return userService.findUser({userName: new RegExp(userBody.userName, "i")})
    .then(user => user ? Promise.reject(new Error('username_exists')) : null)
    .then(() => userService.findUser({mailAddress: userBody.mailAddress || 'n/a'}))
    .then(user => user ? Promise.reject(new Error('mailaddress_exists')) : null)
    .then(() => createUser(userBody))
    .then(user => userService.addUser(user))
    .then(result => userService.findUser({_id: result.insertedId}))
    .then(user => {
      const token = tokenGenerator.generateToken(user);
      ctx.response.body = {token, userName: user.userName, userId: user._id};
      ctx.response.status = 201;
    })
    .catch(error => handleError(error, ctx));
};

function handleError(error, ctx) {
  switch(error.message) {
    case 'mailaddress_exists':
    case 'username_exists':
      ctx.response.status = 400;
      ctx.response.body = {key: error.message};
      break;
    case 'gen_token_failed':
      log.error('could not get token');
      ctx.response.status = 500;
      ctx.response.body = {key: error.message};
      break;
    default:
      ctx.response.status = 500;
    }
}

function createUser(user) {
  log.info('create user: ', user.userName);
  return userSanitizer.hashPassword(user.password).then((password) => ({
    userName: user.userName,
    mailAddress: user.mailAddress,
    password: password
  }));
}