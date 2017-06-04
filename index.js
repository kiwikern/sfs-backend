const subscriptionSaver = require('./subscription-saver.js');
const notificationSender = require('./push-notification-sender.js');
const router = require('koa-router')();
const authRouter = require('./router/auth.router.js');
const scheduleRouter = require('./router/schedule.router.js');
const koa = require('koa');
const bodyParser = require('koa-json-body');
const app = new koa();
let schedule = {};
let latestUpdateDate = 'n/a';



app.use(bodyParser({fallback: true}));
app.use(router.routes());
router.use('/auth', authRouter.routes(), authRouter.allowedMethods());
router.use('/schedule', scheduleRouter.routes());

notificationSender.init();
router.get('/send', notificationSender.sendPush);

router.post('/subscription', (ctx) => subscriptionSaver.saveSubscription(ctx));

app.listen(3000);
