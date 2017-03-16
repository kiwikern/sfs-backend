const coursesParser = require('./courses-parser.js');
const scheduleReader = require('./schedule-reader.js');
const koa = require('koa');
const app = new koa();

let schedule = {};
scheduleReader.getJSON()
  .then(json => schedule = json);

app.use(ctx => {
  ctx.body = schedule;
});

app.listen(3000);

//coursesParser.parseCourses();
