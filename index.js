const coursesParser = require('./courses-parser.js');
const scheduleReader = require('./schedule-reader.js');
const route = require('koa-route');
const koa = require('koa');
const app = new koa();

let schedule = {};
scheduleReader.getJSON()
  .then(json => schedule = json);

app.use(route.get('/', ctx => {
  ctx.body = schedule;
}));

app.use(route.get('/reload', reload));
app.use(route.get('/courses', (ctx) => ctx.body = getCourses()));

app.listen(3000);

function getCourses() {
  let courses = [];
  for (let studio in schedule) {
    studio = schedule[studio]
    for (let day in studio) {
      courses = courses.concat(studio[day].map(c => c.course));
    }
  }
  // return [...new Set(courses)];
  let courseCount = courses.reduce(function (acc, curr) {
  if (typeof acc[curr] == 'undefined') {
    acc[curr] = 1;
  } else {
    acc[curr] += 1;
  }

  return acc;
}, {});
let sorted = Object.keys(courseCount).sort();
return JSON.stringify(courseCount, sorted, 4);
}

function reload(ctx) {
  coursesParser.parseCourses()
    .then(scheduleReader.getJSON)
    .then(json => schedule = json);
  ctx.body = 'Is refreshing.';
}
