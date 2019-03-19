const moment = require('moment');
const {google} = require('googleapis');
const calendar = google.calendar('v3');
const credentials = require('../secrets.js').googleCredentials;
const classMapping = require('../config').classMapping;
const calendars = require('../config').calendars;
const log = require('../logger/logger.instance').getLogger('CalendarParser', 'debug');

exports.getWorkouts = async () => {
  const jwtClient = await getGoogleAuth();
  let workouts = [];
  const promises = [];
  for (let i = 0; i < 7; i++) {
    const timeMin = moment().startOf('day').add(i, 'day').utc().format();
    const timeMax = moment().startOf('day').add(i + 1, 'day').utc().format();
    const promise = getWorkoutsForDay(jwtClient, timeMin, timeMax);
    promise.then(w => {
      log.debug(w.length + ' workouts found within range: ' + timeMin + ' - ' + timeMax);
      workouts = workouts.concat(w)
    })
      .catch(err => log.error('could not add workouts', err));
    promises.push(promise);
  }
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => resolve(workouts))
      .catch(err => reject(err));
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
        timeMax,
        singleEvents: true
      };
      const promise = getWorkoutsForStudio(options, cal.gym);
      promise.then(studioWorkouts => workouts = workouts.concat(studioWorkouts))
        .catch(err => reject(err));
      promises.push(promise);
    }
    Promise.all(promises)
      .then(() => resolve(workouts))
      .catch(err => reject(err));
  });
}

async function getGoogleAuth() {
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']);

  await jwtClient.authorize();
  return jwtClient;
}

function getWorkoutsForStudio(options, gym) {
  return new Promise((resolve, reject) => {
    calendar.events.list(options, function (err, response) {
      if (err) {
        log.error('could not parse calendar', {gym, err});
        return reject(err);
      }
      const events = response.data.items;
      if (events.length === 0) {
        log.warn('No events found for ' + gym);
        return resolve([]);
      } else {
        const workouts = events.filter(event => isValidEvent(event, gym))
          .map(event => getWorkout(event, gym));
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
  let name = event.summary.trim().toLowerCase();
  if (isTeamTraining(name)) {
    return 'teamtraining';
  } else {
    return 'class';
  }
}

function getWorkoutId(event) {
  let name = event.summary.trim().toLowerCase();
  if (isTeamTraining(name)) {
    name = name.slice(13);
  }
  if (classMapping.hasOwnProperty(name)) {
    return classMapping[name];
  } else {
    log.error('No mapping for: ' + name, event);
    return name;
  }
}

function isTeamTraining(name) {
  return name.startsWith('teamtraining') || name.startsWith('tematraining') || name.startsWith('teamtrainign');
}

function getWeekday(event) {
  return moment(event.start.dateTime).format('dddd').toLowerCase();
}

function isValidEvent(event, gym) {
  if (event.status === 'cancelled') {
    return false;
  }
  if (!event.summary) {
    log.warn('Skipping event without name:', {event, gym});
  }
  return !!event.summary;
}
