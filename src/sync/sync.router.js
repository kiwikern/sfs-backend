const router = require('koa-router')();
const jwt = require('koa-jwt');
const jwtSecret = require('../secrets.js').jwt;
const syncGetter = require('./sync.getter.js');
const syncSetter = require('./sync.setter.js');


exports.routes = () => router.routes();

router.use(jwt({secret: jwtSecret.privateKey}));
router.get('/', ctx => syncGetter.getSyncStatus(ctx));
router.post('/', ctx => syncSetter.postSyncStatus(ctx));
