const jsdom = require("jsdom");
let fetch = require("node-fetch");
let config = require("../config.js");
const jQuery = require('jquery');
const _ = require('lodash');
let scheduleService = require('./schedule.service.js');
let workoutService = require('./workout.service.js');
let changesService = require('./changes.service.js');

/**
 * Returns true, if parsed schedule differs from previously
 * persisted schedule.
 */
exports.parseCourses = () => {
  return getCourseInfosForAllStudiosForAllTypes()
    .then(json => workoutService.addWorkouts(json))
    .then(ids => persist(ids));
};

function persist(newIds) {
  return scheduleService.getLatestSchedule()
    .then(oldIds => {
      return new Promise(resolve => {
        const isValid = newIds && newIds.length > 0;
        console.log('schedules are different: ' + areSchedulesDifferent(oldIds, newIds));
        if (isValid && areSchedulesDifferent(oldIds, newIds)) {
          console.log('saving new schedule, length: ' + newIds.length);
          scheduleService.addSchedule(newIds)
            .then(result => {
              saveChanges(result.insertedId, oldIds, newIds)
                .then(() => resolve(true));
            });
        } else {
          resolve(false);
        }
      });
    });
}

function saveChanges(scheduleId, oldIds, newIds) {
  const removed = _.differenceWith(oldIds, newIds, _.isEqual);
  const added = _.differenceWith(newIds, oldIds, _.isEqual);
  return new Promise(resolve => {
    changesService.addChange(scheduleId, added, removed)
      .then(resolve);
  });
}

function areSchedulesDifferent(schedule1, schedule2) {
  return !_.isEqual(schedule1.sort(), schedule2.sort());
}

function getCourseInfosForAllStudiosForAllTypes() {
  let schedule = [];
  let promises = [];
  for (let type of config.types) {
    const typeName = type === 'kursplaene' ? 'class' : 'teamtraining';
    let promise = getCourseInfosForAllStudios(type)
      .then(courses => courses.map(c => {
        c.type = typeName;
        return c;
      }))
      .then(courses => schedule = schedule.concat(courses))
      .catch(error => console.log(error));
    promises.push(promise);
  }
  return Promise.all(promises)
    .then(() => schedule);
}

function getCourseInfosForAllStudios(type) {
  let schedule = [];
  let promises = [];
  for (let studio of config.studios) {
    const studioUrl = config.baseUrl + type + '/' + studio;
    let promise = getCourseInfoForAllDays(studioUrl)
      .then(courses => courses.map(c => {
        c.studio = studio;
        return c;
      }))
      .then(courses => schedule = schedule.concat(courses))
      .catch(error => console.log(error));
    promises.push(promise);
  }
  return Promise.all(promises)
    .then(() => schedule);
}

function getCourseInfoForAllDays(studioUrl) {
  let result = [];
  let promises = [];
  for (let day in config.days) {
    let dayPath = config.days[day];
    let dayUrl;
    if (dayPath.length > 0) {
      dayUrl = studioUrl + '/' + dayPath;
    } else {
      dayUrl = studioUrl;
    }
    let promise = getCourseInfosForOneDay(dayUrl)
      .then(courses => courses.map(c => {
        c.day = day;
        return c;
      }))
      .then(courses => result = result.concat(courses));
    promises.push(promise);
  }
  return Promise.all(promises)
    .then(() => result);
}


function getCourseInfosForOneDay(url) {
  return fetch(url)
    .then(res => res.text())
    .then(parseWebsite);
}

function parseWebsite(body) {
  return new Promise(resolve => {
    jsdom.env(
      body,
      (err, window) => {
        let $ = jQuery(window);
        let tables = $('#content table');
        let courseInfos = $.map(tables, t => getCourseInfo($(t)));
        resolve(courseInfos);
      });
  });
};

function getCourseInfo(course) {
  let courseInfo = {};
  courseInfo.time = course.find('.kpcelltime').first().text().slice(0, -4);
  courseInfo.course = course.find('img').attr('src').slice(21, -4);
  return courseInfo
};
