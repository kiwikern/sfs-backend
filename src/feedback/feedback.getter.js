let feedbackService = require('./feedback.service');
const log = require('../logger/logger.instance').getLogger('FeedbackGetter');

exports.getFeedback = (ctx) => {
  return feedbackService.findFeedbackList(ctx.params.userId)
    .then(feedback => {
      if (feedback) {
        ctx.response.status = 200;
        ctx.response.body = {feedbackList: feedback.map(f => {
          const fb = f.feedback;
          fb.id = f._id;
          return fb;
        })};
      } else {
        ctx.response.status = 200;
        ctx.response.body = {feedbackList: []};
      }
    })
    .catch(error => {
      log.error('could not get feedback list', error);
      ctx.response.status = 500;
    });
};
