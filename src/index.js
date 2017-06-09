const router = require('koa-router')();
const databaseService = require('./database/database.service.js');
const userRouter = require('./user/user.router.js');
const scheduleRouter = require('./schedule/schedule.router.js');
const syncRouter = require('./sync/sync.router.js');
const pushRouter = require('./push/push.router.js');
const koa = require('koa');
const bodyParser = require('koa-json-body');
const app = new koa();

const init = scheduleRouter.init(databaseService.init());

app.use(bodyParser({fallback: true}));
app.use(router.routes());
router.use('/user', userRouter.routes());
router.use('/schedule', scheduleRouter.routes());
router.use('/sync', syncRouter.routes());
router.use('/subscription', pushRouter.routes());

app.listen(3000);

module.exports = app;
module.exports.init = init;
