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

exports.sendMail = (recipient, token) => {
  log.debug('sending mail', recipient);
  const mailOptions = getMailOptions(recipient, token);
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

function getMailOptions(recipient, token) {
  return {
    from: `"SFS" <${mailSecret.user}>`,
    to: recipient,
    subject: 'Dein SFS-Passwort zurücksetzen',
    text: `Setze dein Passwort zurück, indem du auf den folgenden Link klickst.
    Der Link ist 60 Minuten gültig.
    https://sfs.kimkern.de/auth/change-password?token=${token}`,
    html: `
    <p>
      Setze dein Passwort zurück, indem du auf den folgenden Link klickst.
      Der Link ist 60 Minuten gültig.
    </p>
    <p>
      <a href="https://sfs.kimkern.de/auth/reset-password?token=${token}">Passwort zurücksetzen</a>
    </p>`
  };
}

