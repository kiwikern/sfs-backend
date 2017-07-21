let feedbackService = require('./feedback.service');
const log = require('../logger/logger.instance').getLogger('FeedbackResponder');

exports.saveResponse = ctx => {
  if (!isValidRequest(ctx)) {
    log.warn('got invalid request', ctx.request.body);
    return false;
  }
  const response = ctx.request.body;
  const dbResponse = {
    text: response.text,
    userId: response.userId,
    date: new Date(),
    isRead: response.userId !== 'sfs'
  };
  return feedbackService.addResponse(response.feedbackId, dbResponse)
    .then(() => ctx.response.status = 200)
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