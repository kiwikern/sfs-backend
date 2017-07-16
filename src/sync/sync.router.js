const router = require('koa-router')();
const auth = require('../user/auth.middlewear');
const syncGetter = require('./sync.getter.js');
const syncSetter = require('./sync.setter.js');


exports.routes = () => router.routes();

router.use(auth.getAuth());
router.get('/', ctx => syncGetter.getSyncStatus(ctx));
router.post('/', ctx => syncSetter.postSyncStatus(ctx));
