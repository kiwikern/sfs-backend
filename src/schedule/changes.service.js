let changes = {};

exports.init = (dbInstance) => {
  changes = dbInstance.collection('schedule.changes');
};

exports.addChange = (scheduleId, added, removed) => {
  const timestamp = Date.now();
  const change = {scheduleId, timestamp, added, removed};
  return saveChange(change);
};

exports.getRecentChanges = () => {
  return new Promise((resolve, reject) => {
    changes.find({})
      .sort({timestamp: -1})
      .limit(3)
      .toArray((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  });
};

function saveChange(change) {
  return new Promise((resolve, reject) => {
    changes.insertOne(change, (err, result) => {
      if (err) {
        console.log('could not save change');
        reject(err);
      } else {
        resolve(result.insertedId);
      }
    });
  });
}