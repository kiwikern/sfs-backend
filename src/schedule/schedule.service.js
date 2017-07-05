const log = require('../logger/logger.instance').getLogger('ScheduleService');
let schedules = {};

exports.init = (dbInstance) => {
  schedules = dbInstance.collection('schedules');
};

exports.addSchedule = schedule => {
  return new Promise((resolve, reject) => {
    schedules.insertOne({
      schedule,
      insertDate: new Date()
    }, (err, result) => {
      if (err) {
        log.error('could not add schedule', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.getLatestUpdateDate = () => {
  return getLatestScheduleObject()
    .then(res => (res && res.insertDate) ? res.insertDate : null);
};

exports.getLatestSchedule = () => {
  return getLatestScheduleObject()
    .then(res => (res && res.schedule) ? res.schedule : []);
};

function getLatestScheduleObject() {
  return new Promise((resolve, reject) => {
    schedules.findOne({}, {
      sort: {
        insertDate: -1
      }
    }, (err, result) => {
      if (err) {
        log.error('could not get schedule from db', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
