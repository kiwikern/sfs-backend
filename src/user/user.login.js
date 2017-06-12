const bcrypt = require('bcryptjs');
const userService = require('./user.service.js');
const userSanitizer = require('./user.sanitizer.js');
const tokenGenerator = require('./token.generator.js');

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
    .then(user => tokenGenerator.generateToken(user, ctx))
    .catch(error => handleError(error, ctx));
}

function handleError(error, ctx) {
  switch(error.message) {
    case 'user_not_found':
      ctx.response.status = 404;
      ctx.response.body = {key: error.message};
      break;
    case 'wrong_password':
      ctx.response.status = 401;
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
