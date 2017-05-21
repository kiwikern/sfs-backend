const coursesParser = require('./courses-parser.js');
const scheduleReader = require('./schedule-reader.js');
const subscriptionSaver = require('./subscription-saver.js')
const notificationSender = require('./push-notification-sender.js')
const cron = require('node-cron');
const router = require('koa-router')();
const koa = require('koa');
const bodyParser = require('koa-json-body');
const app = new koa();

let schedule = {};
scheduleReader.getJSON()
  .then(json => schedule = json);


app.use(bodyParser({fallback: true}));
app.use(router.routes());

router.get('/schedule', ctx => {
  ctx.body = schedule;
});

router.get('/reload', reload);

notificationSender.init();
router.get('/send', () => notificationSender.sendPush());

router.post('/subscription', (ctx) => {
  subscriptionSaver.saveSubscription(ctx);
});

app.listen(3000);

/**
 * Reload schedule every day at 4 am.
 */
cron.schedule('0 4 * * *', reload);

function reload() {
  coursesParser.parseCourses()
    .then(scheduleReader.getJSON)
    .then(json => schedule = json);
}
