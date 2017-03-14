const jsdom = require("jsdom");
const fetch = require("node-fetch");
const config = require("./config.js");


const studioPath = config.studios[0];
const studioUrl = config.baseUrl + '/' + studioPath;
const dayPath = config.days.tuesday;
const dayUrl = studioUrl + '/' + dayPath;
console.log(dayUrl);

let fetchPromise = fetch(dayUrl)
.then(res => res.text())
.then(parse)
.then(extractCourseInfos);

function parse(body) {
  return new Promise(resolve => {
    jsdom.env(
      body,
      ["http://code.jquery.com/jquery-3.1.1.slim.min.js"],
      (err, window) => {
        let column = window.$('#content table');
        resolve(column);
      });
    });
  };

  function extractCourseInfos(courses) {
    let courseInfos = [];
    for (let course of courses) {
      getCourseInfo(course)
      .then(courseInfo => courseInfos.push(courseInfo))
      .catch(err => console.log(err));
    }
    console.dir(courseInfos);
  };

  function getCourseInfo(course) {
    console.dir(course.Element);
    return new Promise(resolve => {
      jsdom.env(
        course.rows,
        ["http://code.jquery.com/jquery-3.1.1.slim.min.js"],
        (err, window) => {
          console.dir(err);
          console.dir(window);
          let courseInfo = {};
          //courseInfo.time = window.$('.kpcelltime');
          console.dir(window.$('.kpcelltime'));
          //courseInfo.course = window.$('img').attr('src');
          console.dir(window.$('img').attr('src'));
          console.dir(courseInfo);
          resolve(courseInfo);
        });
      });
    };
