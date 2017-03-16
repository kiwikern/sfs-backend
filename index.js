const coursesParser = require('./courses-parser.js');
const koa = require('koa');
const app = new koa();

app.use(ctx => {
  ctx.body = schedule;
});

app.listen(3000);
