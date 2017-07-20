let nodemailer = require('nodemailer');
const mailSecret = require('../secrets.js').mailAccount;
const log = require('../logger/logger.instance').getLogger('MailSender');

const transporter = nodemailer.createTransport({
  host: mailSecret.server,
  port: 587,
  secure: false,
  auth: {
    user: mailSecret.user,
    pass: mailSecret.password
  }
});

exports.sendMail = (mailOptions) => {
  log.debug('sending mail', mailOptions.recipient);
  mailOptions.from = `"SFS" <${mailSecret.user}>`;
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, error => {
      if (error) {
        log.error('could not send mail', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};