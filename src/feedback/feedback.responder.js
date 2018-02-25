let feedbackService = require('./feedback.service');
let feedbackMailSender = require('./feedback.mailsender');
const log = require('../logger/logger.instance').getLogger('FeedbackResponder');

exports.saveResponse = ctx => {
  if (!isValidRequest(ctx)) {
    log.warn('got invalid request', ctx.request.body);
    return false;
  }
  const response = ctx.request.body;
  const dbResponse = {
    text: response.text,
    userId: getUserId(ctx),
    date: new Date(),
    isRead: false
  };
  log.info('new feedback response', response);
  // TODO: do not send if user === sfs
  feedbackMailSender.sendFeedbackMail(response);
  return feedbackService.addResponse(response.feedbackId, dbResponse)
    .then(() => ctx.response.status = 204)
    .catch(error => {
      log.error('could not save response', error);
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
  if (!body.feedbackId) {
    ctx.response.body = {key: 'missing_feedbackId'};
    ctx.response.status = 400;
    return false;
  }
  if (!body.userId) {
    ctx.response.body = {key: 'missing_userId'};
    ctx.response.status = 400;
    return false;
  }
  if (!body.text) {
    ctx.response.body = {key: 'missing_text'};
    ctx.response.status = 400;
    return false;

  }
  return true;
}

function getUserId(ctx) {
  if (ctx.state && ctx.state.user && ctx.state.user.subject && ctx.state.user.subject.role === 'ADMIN') {
    return 'sfs'
  } else {
    return ctx.request.body.userId;
  }
}