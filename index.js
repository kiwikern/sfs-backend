const coursesParser = require('./courses-parser.js');
const subscriptionSaver = require('./subscription-saver.js');
const notificationSender = require('./push-notification-sender.js');
const databaseService = require('./database/database-service.js');
const scheduleService = require('./database/schedule-service.js');
const cron = require('node-cron');
const router = require('koa-router')();
const koa = require('koa');
const bodyParser = require('koa-json-body');
const app = new koa();
let schedule = {};
let latestUpdateDate = 'n/a';

databaseService.init()
  .then(scheduleService.getLatestSchedule)
  .then(json => json ? schedule = json : json)
  .then(scheduleService.getLatestUpdateDate)
  .then(date => latestUpdateDate = date);


app.use(bodyParser({fallback: true}));
app.use(router.routes());

router.get('/schedule', ctx => {
  ctx.body = schedule;
});

router.get('/latest-update-date', ctx => {
  ctx.body = latestUpdateDate;
});

router.get('/reload', reload);

notificationSender.init();
router.get('/send', notificationSender.sendPush);

router.post('/subscription', (ctx) => subscriptionSaver.saveSubscription(ctx));

app.listen(3000);

/**
 * Reload schedule every day at 4 am.
 */
cron.schedule('0 4 * * *', reload);

function reload() {
  coursesParser.parseCourses()
    .then(hasChanged => hasChanged ? notificationSender.sendPush() : false)
    .then(scheduleService.getLatestSchedule)
    .then(json => json ? schedule = json : json)
    .then(scheduleService.getLatestUpdateDate)
    .then(date => latestUpdateDate = date)
    .then(() => console.log('reload done.'));
}
