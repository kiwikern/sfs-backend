const router = require('koa-router')();
const auth = require('../user/auth.middlewear');
const userRegistration = require('./user.registration.js');
const userLogin = require('./user.login.js');
const passwordResetter = require('./user.password-resetter');

exports.routes = () => router.routes();

router.post('/session', ctx => userLogin.login(ctx));
router.post('/', ctx => userRegistration.register(ctx));
router.put('/:username', auth.getAuth(), ctx => update(ctx));
router.post('/request-reset-password', ctx => passwordResetter.getResetToken(ctx));
router.post('/reset-password', auth.getAuth(),  ctx => passwordResetter.resetPassword(ctx));