let lastToken;
const mockery = require('mockery');

mockery.enable({
  warnOnUnregistered: false
});

mockery.registerMock('../mail/mail.sender', {
  sendMail: (recipient, token) => {
    lastToken = token;
    return Promise.resolve()
  }
});

mockery.registerMock('../captcha/captcha.verifier', {
  verify: () => {
    return Promise.resolve()
  }
});

const app = require('../../src/index');
exports.init = () => {
  return app.init;
};

exports.listen = () => {
  return app.listen();
};

exports.getLastResetPasswordToken = () => lastToken;