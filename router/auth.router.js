const router = require('koa-router')();

exports.routes = () => router.routes();
exports.allowedMethods = () => router.allowedMethods();

router.post('/login', ctx => login(ctx));
router.post('/register', ctx => ctx.body = {
  token: 'jwtToken'
});

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
