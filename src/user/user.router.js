const router = require('koa-router')();
const userRegistration = require('./user.registration.js');
const userLogin = require('./user.login.js');

exports.routes = () => router.routes();

router.post('/session', ctx => userLogin.login(ctx));
router.post('/', ctx => userRegistration.register(ctx));
router.put('/:username', ctx => update(ctx));
