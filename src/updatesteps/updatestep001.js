const classMapping = require('../config').classMapping;
const ObjectId = require('mongodb').ObjectID;
const log = require('../logger/logger.instance').getLogger(`UpdateStep001`);

exports.run = db => {
  const classes = [
    "teamtraining trx",
    "teamtraining circuit",
    "teamtraining po",
    "teamtraining queenax cardio",
    "teamtraining skilletic",
    "teamtraining rücken",
    "teamtraining bauch",
    "teamtraining queenax strong",
    "teamtraining trainingsstart",
    "teamtraining faszientraining",
    "teamtraining queenax burn",
    "teamtraining stretch",
    "teamtraining functional",
    "teamtraining trx bauch",
    "teamtraining hiit",
    "teamtraining fullbody workout",
    "teamtraining cellulite killer"
  ];

  const promises = [];
  return db.collection('workout').find({course: {$in: classes}})
    .toArray()
    .then(workouts => {
      log.silly('found workouts', workouts.length);
      workouts.forEach(workout => {
        log.silly('found workout', workout);
        const name = workout.course;
        const slicedName = name.slice(13);
        const mappedName = classMapping[slicedName];
        log.silly('found mapped workout', mappedName);
        const updatePromise = db.collection('workout').update({_id: new ObjectId(workout._id)}, {
          $set: {
            course: mappedName,
            type: 'teamtraining'
          }
        });
        promises.push(updatePromise);
      });
    })
    .then(() => log.silly('updated number of workouts:', promises.length))
    .then(() => Promise.all(promises));
};
