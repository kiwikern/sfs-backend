const router = require('koa-router')();
const jwt = require('koa-jwt');
const jwtSecret = require('../secrets.js').jwt;
const pushSaver = require('./push.saver.js');
const pushSender = require('./push.sender.js');

exports.routes = () => router.routes();

pushSender.init();
router.post('/', (ctx) => pushSaver.saveSubscription(ctx));

// protected routes
// router.use(jwt({secret: jwtSecret.privateKey}));
router.get('/send', pushSender.sendPush);
