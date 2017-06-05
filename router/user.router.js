const router = require('koa-router')();
const userRegistration = require('../user/user-registration.js');
const userLogin = require('../user/user-login.js');

exports.routes = () => router.routes();
exports.allowedMethods = () => router.allowedMethods();

router.post('/session', ctx => userLogin.login(ctx));
router.post('/', ctx => userRegistration.register(ctx));
router.put('/:username', ctx => update(ctx));
