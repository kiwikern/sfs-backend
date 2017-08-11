const workoutService = require('./workout.service');
const log = require('../logger/logger.instance').getLogger('CommentSetter');

exports.addComment = ctx => {
  const requestData = getValidComment(ctx);
  if (!requestData) {
    ctx.response.status = 400;
    log.warn('invalid request for adding comment', {request: ctx.request.body, reason: ctx.response.body});
    return;
  }
  return workoutService.addComment(requestData.workoutId, requestData.comment)
    .then(response => {
      ctx.response.body = {key: 'added_comment'};
      ctx.response.status = 200;
      log.debug('added new comment', requestData);
    });
};

function getValidComment(ctx) {
  let requestData = false;
  const body = ctx.request.body;
  let comment;
  if (!body) {
    ctx.response.body = {key: 'missing_body'};
    return false;
  } else {
    comment = body.comment;
  }
  if (!comment) {
    ctx.response.body = {key: 'missing_comment'};
  } else if (!comment.text) {
    ctx.response.body = {key: 'missing_text'};
  } else if (!comment.userId) {
    ctx.response.body = {key: 'missing_userId'};
  } else if (!comment.workoutId) {
    ctx.response.body = {key: 'missing_workoutId'};
  } else {
    requestData = {
      comment: {
        text: comment.text,
        userId: comment.userId,
        userName: comment.userName,
        date: new Date(),
        instructors: comment.instructors || [],
        highlights: comment.highlights || [],
        attendance: comment.attendance
      },
      workoutId: comment.workoutId
    }
  }
  return requestData
}