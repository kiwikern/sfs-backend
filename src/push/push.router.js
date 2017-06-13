const router = require('koa-router')();
const pushSaver = require('./push.saver.js');
const pushSender = require('./push.sender.js');

exports.routes = () => router.routes();

pushSender.init();
router.post('/', (ctx) => pushSaver.saveSubscription(ctx));
router.get('/send', pushSender.sendPush);
