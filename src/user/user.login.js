let bcrypt = require('bcryptjs');
let userService = require('./user.service.js');
let userSanitizer = require('./user.sanitizer.js');
let tokenGenerator = require('./token.generator.js');
const log = require('../logger/logger.instance').getLogger('UserLogin');

exports.login = (ctx) => {
  const userBody = userSanitizer.getNormalizedUserIfValid(ctx.request.body);
  if (!userBody) {
    ctx.response.body = {key: 'invalid_request'};
    ctx.response.status = 400;
    log.warn('got invalid request', userBody);
    return false;
  }
  log.debug('login', {userName: userBody.userName, mailAddress: userBody.mailAddress});
  return userService.findUserByNameMailOrId(userBody)
    .then(user => user ? user : Promise.reject(new Error('user_not_found')))
    .then(user => checkPassword(user, userBody.password))
    .then(user => {
      const token = tokenGenerator.generateToken(user, ctx);
      ctx.response.body = {token, userName: user.userName};
      ctx.response.status = 200;
    })
    .catch(error => handleError(error, ctx));
};

function handleError(error, ctx) {
  switch(error.message) {
    case 'user_not_found':
    case 'wrong_password':
      ctx.response.status = 401;
      ctx.response.body = {key: error.message};
      break;
    case 'gen_token_failed':
      ctx.response.status = 500;
      ctx.response.body = {key: error.message};
      log.error('could not generate token');
      break;
    default:
      ctx.response.status = 500;
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
