const request = require('request');
const secret = require('../secrets.js').captcha;
const log = require('../logger/logger.instance').getLogger('CaptchaVerifier');


exports.verify = response => {
  const form = {
    secret,
    response
  };
  return new Promise((resolve, reject) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form}, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        const body = JSON.parse(resp.body);
        if (!body.success) {
          log.warn('captcha failed', {error_codes: body['error-codes'], response});
          reject(new Error('captcha_failed'));
        } else {
          resolve();
        }
      }
    });
  });
};