let feedbackService = require('./feedback.service');
const log = require('../logger/logger.instance').getLogger('FeedbackMarker');

exports.markRead = ctx => {
  if (!isValidRequest(ctx)) {
    log.warn('got invalid request', ctx.request.body);
    return false;
  }
  return feedbackService.markRead(ctx.request.body.feedbackId)
    .then(() => ctx.response.status = 200)
    .catch(error => {
      log.error('could not mark read', error);
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
  return true;
}