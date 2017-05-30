const jsdom = require("jsdom");
const fetch = require("node-fetch");
const config = require("./config.js");
const jQuery = require('jquery');
const fs = require('fs');
const _ = require('lodash');
const scheduleService = require('./database/schedule-service.js');

/**
 * Returns true, if parsed schedule differs from previously
 * persisted schedule.
 */
exports.parseCourses = () => {
  return getCourseInfosForAllStudios()
    .then(json => persist(json));
}

function persist(scheduleJSON) {
  return scheduleService.getLatestSchedule()
    .then(json => {
      const isValid = scheduleJSON && scheduleJSON.length > 0;
      if (isValid && isScheduleDifferent(json, scheduleJSON)) {
          scheduleService.addSchedule(scheduleJSON);
          return true;
      }
      return false;
    });
}

function isScheduleDifferent(schedule1, schedule2) {
  _(schedule1).differenceWith(schedule2, _.isEqual).isEmpty();
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
