let mailSender = require('../mail/mail.sender');

exports.sendFeedbackMail = (feedback) => {
  feedback.date = new Date().toLocaleString();
  const mailOptions = {
    to: 'sfs-feedback@kimkern.de',
    subject: 'Neues Feedback von ',
    text: JSON.stringify(feedback, null, 2),
    html: `
    <pre>
      ${JSON.stringify(feedback, null, 2)}
    </pre>`
  };
  return mailSender.sendMail(mailOptions);
};