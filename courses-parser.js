const jsdom = require("jsdom");
const fetch = require("node-fetch");
const config = require("./config.js");
const jQuery = require('jquery');
const fs = require('fs');
const scheduleReader = require('./schedule-reader.js');
const _ = require('lodash/core');

/**
 * Returns true, if parsed schedule differs from previously
 * persisted schedule.
 */
exports.parseCourses = () => {
  return getCourseInfosForAllStudios()
    .then(json => persist(json));
}

function persist(scheduleJSON) {
  return scheduleReader.getJSON()
    .then(json => {
      fs.writeFile("./schedule.json", scheduleJSON, err => {
        if (err) {
          console.log(new Date().toUTCString());
          console.log('Writing to file failed.');
          console.log(err);
        } else {
          console.log(new Date().toUTCString());
          console.log('file saved');
        }
      });
      try {
        return !_.isEqual(json, JSON.parse(scheduleJSON));
      } catch (err) {
        console.log('CoursesParser#persist: Comparing JSON failed \n' + err);
        return false;
      }
    });
}

function getCourseInfosForAllStudios() {
  let schedule = {};
  let promises = [];
  for (let studio of config.studios) {
    const studioUrl = config.baseUrl + '/' + studio;
    let promise = getCourseInfoForAllDays(studioUrl)
      .then(courses => schedule[studio] = courses)
      .catch(error => console.log(error));
    promises.push(promise);
  }
  return Promise.all(promises)
    .then(() => JSON.stringify(schedule, null, 2));
}

function getCourseInfoForAllDays(studioUrl) {
  let result = {};
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
      .then(courses => result[day] = courses);
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
