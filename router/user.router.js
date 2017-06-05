const router = require('koa-router')();
const userRegistration = require('../user/user-registration.js')

exports.routes = () => router.routes();
exports.allowedMethods = () => router.allowedMethods();

router.get('/', ctx => login(ctx));
router.post('/', ctx => userRegistration.register(ctx));
router.put('/:username', ctx => update(ctx));

function login(ctx) {
  if (ctx.request.body.password === '123456') {
    ctx.body = {
      token: 'jwtToken'
    };
  } else {
    ctx.response.status = 401;
    ctx.response.body = {
      invalidPassword: true,
      unknownMail: false,
      unknownUsername: false
    };
  }
}
