const router = require('koa-router')();
const cron = require('node-cron');
const scheduleService = require('./schedule.service.js');
const workoutService = require('./workout.service');
const changesService = require('./changes.service');
const scheduleParser = require('./schedule.parser.js');
const notificationSender = require('../push/push.sender');
const commentSetter = require('./comment.setter');
const auth = require('../user/auth.middlewear');
const log = require('../logger/logger.instance').getLogger('ScheduleRouter');

let changes = [];

exports.routes = () => router.routes();

exports.init = (promise) => {
  return promise
    .then(changesService.getRecentChanges)
    .then(changes => loadChangesWorkouts(changes))
    .then(c => changes = c);
};

router.get('/', ctx => {
 return scheduleService.getLatestSchedule()
    .then(ids => workoutService.getWorkouts(ids))
    .then(schedule => ctx.body = schedule)
});

router.get('/latest-update-date', ctx => {
  return scheduleService.getLatestUpdateDate
    .then(latestUpdateDate => ctx.body = latestUpdateDate);
});

router.get('/changes', ctx => {
  ctx.body = changes;
});

router.get('/reload', ctx => {
  reload();
  ctx.body = 'reload done';
});

router.post('/comment', auth.getAuth(), ctx => commentSetter.addComment(ctx));

router.get('/comment', ctx => commentGetter.getComments(ctx));

/**
 * Reload schedule every day at 4 am.
 */
cron.schedule('0 4 * * *', reload);

function reload() {
  log.info('reload started');
  scheduleParser.parseCourses()
    .then(hasChanged => hasChanged ? notificationSender.sendPush() : false)
    .then(changesService.getRecentChanges)
    .then(changes => loadChangesWorkouts(changes))
    .then(c => changes = c)
    .then(() => log.info('reload done.'))
    .catch(() => log.error('could not reload schedule.'));
}

function loadChangesWorkouts(changes) {
  return new Promise(resolve => {
    const promises = [];
    const populatedChanges = [];
    changes.forEach((c, index) => {
      const addedPromise = workoutService.getWorkouts(c.added);
      const removedPromise = workoutService.getWorkouts(c.removed);
      const replacedPromises = Promise.all([addedPromise, removedPromise])
        .then(w => populatedChanges[index] = {
          timestamp: c.timestamp,
          scheduleId: c.scheduleId,
          added: w[0],
          removed: w[1]
        });
      promises.push(replacedPromises);
    });
    return Promise.all(promises).then(() => resolve(populatedChanges));
  });
}
