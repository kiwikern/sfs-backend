const jsdom = require("jsdom");
let fetch = require("node-fetch");
let config = require("../config.js");
const jQuery = require('jquery');
const _ = require('lodash');
let scheduleService = require('./schedule.service.js');
let workoutService = require('./workout.service.js');

/**
 * Returns true, if parsed schedule differs from previously
 * persisted schedule.
 */
exports.parseCourses = () => {
  return getCourseInfosForAllStudios()
    .then(json => workoutService.addWorkouts(json))
    .then(ids => persist(ids));
};

function persist(newIds) {
  return scheduleService.getLatestSchedule()
    .then(oldIds => {
      const isValid = newIds && newIds.length > 0;
      console.log('schedules are different: ' + areSchedulesDifferent(oldIds, newIds));
      if (isValid && areSchedulesDifferent(oldIds, newIds)) {
        console.log('saving new schedule, length: ' + newIds.length);
        scheduleService.addSchedule(newIds);
        return true;
      }
      return false;
    });
}

function areSchedulesDifferent(schedule1, schedule2) {
  return !_.isEqual(schedule1.sort(), schedule2.sort());
}

function getCourseInfosForAllStudios() {
  let schedule = [];
  let promises = [];
  for (let studio of config.studios) {
    const studioUrl = config.baseUrl + '/' + studio;
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
