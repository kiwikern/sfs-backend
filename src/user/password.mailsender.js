let mailSender = require('../mail/mail.sender');

exports.sendPasswordMail = (recipient, token) => {
  const mailOptions = {
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
      <a href="https://sfs.kimkern.de/auth/change-password?token=${token}">Passwort zurücksetzen</a>
    </p>`
  };
  return mailSender.sendMail(mailOptions);
};