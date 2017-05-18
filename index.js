const coursesParser = require('./courses-parser.js');
const scheduleReader = require('./schedule-reader.js');
const cron = require('node-cron');
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

/**
 * Reload schedule every day at 4 am.
 */
cron.schedule('0 4 * * *', reload);

function reload() {
  coursesParser.parseCourses()
    .then(scheduleReader.getJSON)
    .then(json => schedule = json);
}
