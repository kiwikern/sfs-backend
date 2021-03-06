let userService = require('./user.service');
let userSanitizer = require('./user.sanitizer');
let tokenGenerator = require('./token.generator');
let passwordSender = require('./password.mailsender');
const captchaVerifier = require('../captcha/captcha.verifier');
const log = require('../logger/logger.instance').getLogger('PasswordResetter');

const resetPasswordSubject = 'reset-password';

exports.resetPassword = ctx => {
  const userId = ctx.state.user.id;
  log.debug('resetting password for:', userId);
  if (userId && ctx.state.user.subject === resetPasswordSubject) {
    if (userSanitizer.isInvalidPassword(ctx.request.body)) {
      log.warn('tried to set invalid password', userId);
      handleError(new Error('invalid_password'), ctx);
      return;
    }
    return userService.findUserByNameMailOrId({_id: userId})
      .then(user => user ? user : Promise.reject(new Error('user_not_found')))
      .then(() => userSanitizer.hashPassword(ctx.request.body.password))
      .then(password => userService.updateUser(userId, {password}))
      .then(() => userService.findUserByNameMailOrId({_id: userId}))
      .then(user => {
        const token = tokenGenerator.generateToken(user);
        ctx.response.body = {token, userName: user.userName, userId: user._id};
        ctx.response.status = 200;
      })
      .catch(error => handleError(error, ctx));
  } else {
    log.warn('was not authorized to reset password', userId);
    handleError(new Error('unauthorized'), ctx);
  }
};

exports.getResetToken = ctx => {
  log.debug('request password reset mail', ctx.request.body);
  let user;
  return userService.findUserByNameMailOrId(ctx.request.body)
    .then(result => result ? user = result : Promise.reject(new Error('user_not_found')))
    .then(() => captchaVerifier.verify(ctx.request.body.captcha))
    .then(() => ({
      token: tokenGenerator.generateToken(user, resetPasswordSubject, '1h'),
      mailAddress: user.mailAddress
    }))
    .then(result => passwordSender.sendPasswordMail(result.mailAddress, result.token))
    .then(() => ctx.response.body = 'Mail was successfully sent')
    .catch(error => handleError(error, ctx));
};

function handleError(error, ctx) {
  switch (error.message) {
    case 'user_not_found':
      ctx.response.status = 404;
      ctx.response.body = {key: error.message};
      break;
    case 'unauthorized':
      ctx.response.status = 401;
      ctx.response.body = {key: error.message};
      break;
    case 'invalid_password':
    case 'captcha_failed':
      ctx.response.status = 400;
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