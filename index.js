const jsdom = require("jsdom");
const fetch = require("node-fetch");
const config = require("./config.js");
const jQuery = require('jquery');


const studioPath = config.studios[0];
const studioUrl = config.baseUrl + '/' + studioPath;
const dayPath = config.days.tuesday;
let dayUrl = studioUrl
if (dayPath.length > 0) {
  dayUrl = dayUrl + '/' + dayPath;
}

getCourseInfosForOneDay(dayUrl);

function getCourseInfosForOneDay(url) {
  fetch(url)
    .then(res => res.text())
    .then(parse);
}

function parse(body) {
  return new Promise(resolve => {
    jsdom.env(
      body,
      (err, window) => {
        let $ = jQuery(window);
        let tables = $('#content table');
        let courseInfos = $.map(tables, t => getCourseInfo($(t)));
        console.dir(courseInfos)
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
