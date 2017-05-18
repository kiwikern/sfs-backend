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

function reload() {
  coursesParser.parseCourses()
    .then(result => console.log('Wurde geändert:' + result))
    .then(scheduleReader.getJSON)
    .then(json => schedule = json);
}
