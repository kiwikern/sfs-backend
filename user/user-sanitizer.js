const validator = require('validator')

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
      console.log(user);
    }
  }
  if (!user.password || user.password.length < 6) {
    return false;
  }
  return normalizeUser(user);
}

function isInvalidUserName(userName) {
  return !userName || !validator.matches(userName.trim(), /[\w\d]+/i);
}

function isInvalidMailAddress(mail) {
  console.log(mail + validator.isEmail(mail));
  return !mail || !validator.isEmail(mail);
}

function normalizeUser(user) {
  console.log('normalize: ' + user);
  const userName = user.userName ? user.userName.trim() : null;
  const mailAddress = user.mailAddress ? validator.normalizeEmail(user.mailAddress.trim()) : null;
  const password = user.password;
  return {userName, mailAddress, password};
}
