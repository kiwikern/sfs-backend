const classMapping = require('../config').classMapping;
const ObjectId = require('mongodb').ObjectID;
const log = require('../logger/logger.instance').getLogger(`UpdateStep003`);

/**
 * Added new workout type cx worx to workout mapping.
 */
exports.run = db => {
  const classes = [
    "cx worx",
  ];

  const promises = [];
  return db.collection('workout').find({course: {$in: classes}})
    .toArray()
    .then(workouts => {
      log.silly('found workouts', workouts.length);
      workouts.forEach(workout => {
        log.silly('found workout', workout);
        const name = workout.course;
        const mappedName = classMapping[name];
        log.silly('found workout', mappedName);
        const updatePromise = db.collection('workout').update({_id: new ObjectId(workout._id)}, {
          $set: {
            course: mappedName
          }
        });
        promises.push(updatePromise);
      });
    })
    .then(() => log.info('updated number of workouts:', promises.length))
    .then(() => Promise.all(promises));
};

