let feedbackService = require('./feedback.service');
let feedbackMailSender = require('./feedback.mailsender');
const log = require('../logger/logger.instance').getLogger('FeedbackSetter');

exports.saveFeedback = (ctx) => {
  if (!isValidRequest(ctx)) {
    log.warn('got invalid request', ctx.request.body);
    return false;
  }
  log.debug('save feedback', ctx.request.body);
  const feedback = ctx.request.body.feedback;
  feedback.date = new Date();
  feedback.responses = [];
  feedback.isRead = false;
  const userId = ctx.request.body.userId;
  const userName = ctx.request.body.userName;
  const version = ctx.request.body.version;
  return feedbackService.addFeedback({userId, version, feedback})
    .then(insertionResult => {
      feedback.feedbackId = insertionResult.insertedId;
      feedbackMailSender.sendFeedbackMail({userId, userName, version, feedback});
      return Promise.resolve();
    })
    .then(() => ctx.response.status = 204)
    .catch(error => {
      log.error('could not save feedback', error);
      ctx.response.status = 500;
    });
};

function isValidRequest(ctx) {
  const body = ctx.request.body;
  if (!body) {
    ctx.response.body = {key: 'missing_body'};
    ctx.response.status = 400;
    return false
  }
  if (!body.feedback) {
    ctx.response.body = {key: 'missing_feedback'};
    ctx.response.status = 400;
    return false;
  }
  if (!body.userId) {
    ctx.response.body = {key: 'missing_userId'};
    ctx.response.status = 400;
    return false;
  }
  if (!body.feedback.text) {
    ctx.response.body = {key: 'missing_text'};
    ctx.response.status = 400;
    return false;

  }
  return true;
}