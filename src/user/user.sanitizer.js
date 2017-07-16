const validator = require('validator');
const bcrypt = require('bcryptjs');
const log = require('../logger/logger.instance').getLogger('UserSanitizer');

exports.getNormalizedUserIfValid = (user) => {
  if (!user) {
    return false;
  }
  if (!user.userName) {
    if (isInvalidMailAddress(user.mailAddress)) {
      return false;
    }
  } else if (!user.mailAddress) {
    if (isInvalidUserName(user.userName)) {
      return false;
    }
  } else {
    if (isInvalidUserName(user.userName) || isInvalidMailAddress(user.mailAddress)) {
      return false;
    }
  }
  if (isInvalidPassword(user)) {
    return false;
  }
  return normalizeUser(user);
};

exports.hashPassword = password => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (!err) {
        return resolve(hash);
      } else {
        log.error('could not hash password', err);
        return reject(err);
      }
    });
  });
};

exports.isInvalidPassword = isInvalidPassword;

function isInvalidUserName(userName) {
  return !userName || !validator.matches(userName.trim(), /^[\w\d]+$/i);
}

function isInvalidMailAddress(mail) {
  return !mail || !validator.isEmail(mail);
}

function isInvalidPassword(user) {
  return !user.password || user.password.length < 6;
}

function normalizeUser(user) {
  const userName = user.userName ? user.userName.trim() : null;
  const mailAddress = user.mailAddress ? validator.normalizeEmail(user.mailAddress.trim()) : null;
  const password = user.password;
  return {userName, mailAddress, password};
}