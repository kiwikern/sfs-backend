const coursesParser = require('./courses-parser.js');
const scheduleReader = require('./schedule-reader.js');
const route = require('koa-route');
const koa = require('koa');
const app = new koa();

let schedule = {};
scheduleReader.getJSON()
  .then(json => schedule = json);

app.use(route.get('/schedule', ctx => {
  ctx.body = schedule;
}));

app.use(route.get('/reload', reload));

app.listen(3000);

function reload(ctx) {
  coursesParser.parseCourses()
    .then(scheduleReader.getJSON)
    .then(json => schedule = json);
  ctx.body = 'Is refreshing.';
}
