const router = require('koa-router')();
const scheduleService = require('./schedule.service.js');
const cron = require('node-cron');
const scheduleParser = require('./schedule.parser.js');

exports.routes = () => router.routes();

exports.init = (promise) => {
  return promise
    .then(scheduleService.getLatestSchedule)
    .then(json => json ? schedule = json : json)
    .then(scheduleService.getLatestUpdateDate)
    .then(date => latestUpdateDate = date);
}

  router.get('/', ctx => {
    ctx.body = schedule;
  });

  router.get('/latest-update-date', ctx => {
    ctx.body = latestUpdateDate;
  });

  router.get('/reload', reload);

  /**
   * Reload schedule every day at 4 am.
   */
  cron.schedule('0 4 * * *', reload);

  function reload() {
    scheduleParser.parseCourses()
      .then(hasChanged => hasChanged ? notificationSender.sendPush() : false)
      .then(scheduleService.getLatestSchedule)
      .then(json => json ? schedule = json : json)
      .then(scheduleService.getLatestUpdateDate)
      .then(date => latestUpdateDate = date)
      .then(() => console.log('reload done.'));
    }
