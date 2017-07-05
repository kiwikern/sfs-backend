const moment = require('moment');
const google = require('googleapis');
const calendar = google.calendar('v3');
const credentials = require('../secrets.js').googleCredentials;
const classMapping = require('../config').classMapping;
const calendars = require('../config').calendars;

exports.getWorkouts = () => {
  const jwtClient = getGoogleAuth();
  let workouts = [];
  const promises = [];
  for (let i = 0; i < 7; i++) {
    const timeMin = moment().startOf('day').add(i, 'day').utc().format();
    const timeMax = moment().startOf('day').add(i+1, 'day').utc().format();
    const promise = getWorkoutsForDay(jwtClient, timeMin, timeMax);
    promise.then(w => {
      console.log(w.length + ' workouts found within range: ' + timeMin + ' - ' + timeMax);
      workouts = workouts.concat(w)
    });
    promises.push(promise);
  }
  return new Promise(resolve => {
    Promise.all(promises).then(() => resolve(workouts));
  });
};

function getWorkoutsForDay(jwtClient, timeMin, timeMax) {
  return new Promise((resolve, reject) => {
    let workouts = [];
    const promises = [];
    for (const cal of calendars) {
      const options = {
        auth: jwtClient,
        calendarId: cal.id,
        timeMin,
        timeMax
      };
      const promise = getWorkoutsForStudio(options, cal.gym);
      promise.then(studioWorkouts => workouts = workouts.concat(studioWorkouts));
      promises.push(promise);
    }
    Promise.all(promises).then(() => resolve(workouts));
  });
}

function getGoogleAuth() {
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']);

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
    }
  });
  return jwtClient;
}

function getWorkoutsForStudio(options, gym) {
  return new Promise((resolve, reject) => {
    calendar.events.list(options, function (err, response) {
      if (err) {
        console.log('error for gym: ' + gym);
        console.log('The API returned an error: ' + err);
        return reject([]);
      }
      const events = response.items;
      if (events.length === 0) {
        console.log('No events found for ' + gym);
        return resolve([]);
      } else {
        const workouts = [];
        for (const event of events) {
          workouts.push(getWorkout(event, gym));
        }
        return resolve(workouts);
      }
    });
  });
}

function getWorkout(event, gym) {
  return {
    course: getWorkoutId(event),
    studio: gym,
    type: getType(event),
    day: getWeekday(event),
    time: getStartHour(event),
    duration: getDuration(event)
  };
}

function getStartHour(event) {
  const date = event.start.dateTime;
  return moment(date).format('HH:mm');
}

function getDuration(event) {
  const start = event.start.dateTime;
  const end = moment(event.end.dateTime);
  const diff = end.diff(start);
  const duration = moment.duration(diff).asMinutes();
  return Math.floor(duration);
}

function getType(event) {
  if (isTeamTraining(event)) {
    return 'teamtraining';
  } else {
    return 'class';
  }
}

function getWorkoutId(event) {
  let name = event.summary.trim().toLowerCase();
  if (isTeamTraining(event)) {
    name = name.slice(13);
  }
  if (classMapping.hasOwnProperty(name)) {
    return classMapping[name];
  } else {
    console.log('No mapping for: ' + name);
    return name;
  }
}

function isTeamTraining(event) {
  return event.summary.startsWith('TeamTraining') || event.summary.startsWith('TemaTraining');
}

function getWeekday(event) {
  return moment(event.start.dateTime).format('dddd').toLowerCase();
}
