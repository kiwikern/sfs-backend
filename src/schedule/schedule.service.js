let schedules = {};

exports.init = (dbInstance) => {
  schedules = dbInstance.collection('schedules');
};

exports.addSchedule = (schedule) => {
  return new Promise((resolve, reject) => {
    schedules.insert({
      schedule,
      insertDate: new Date()
    }, (err, result) => {
      if (err) {
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
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
