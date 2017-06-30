const _ = require('lodash');
let scheduleService = require('./schedule.service.js');
let workoutService = require('./workout.service.js');
let changesService = require('./changes.service.js');
let calendarParser = require('./calendar.parser');

/**
 * Returns true, if parsed schedule differs from previously
 * persisted schedule.
 */
exports.parseCourses = () => {
  return calendarParser.getWorkouts()
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
