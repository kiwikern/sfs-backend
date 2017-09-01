const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;
const classMapping = require('../config').classMapping;
const ObjectId = require('mongodb').ObjectID;
const stepNumber = 1;
const log = require('../logger/logger.instance').getLogger(`UpdateStep${stepNumber}`);

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

module.exports.run = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        log.error('could not connect to database', err);
        return reject('could not connect to database');
      } else {
        log.info(`Updatestep${stepNumber} started`);
        return getUpdateStepNumber(db)
          .then(number => {
            log.debug('found stepNumber', {number});
            number = number || -1;
            if (number < stepNumber) {
              return Promise.resolve();
            } else {
              log.error('UpdateStep already executed.');
              return Promise.reject('UpdateStep already executed.');
            }
          })
          .then(() => updateStep(db))
          .then(() => incrementUpdateStepNumber(db))
          .then(() => resolve())
          .catch(err => reject(err));
      }
    });
  });
};

function getUpdateStepNumber(db) {
  return db.collection('properties').findOne({name: 'updateStepNumber'})
    .then(prop => prop && prop.value ? prop.value : -1)
    .catch(err => {
      log.error('Could not fetch updatestep number', err);
      return Promise.reject('Could not fetch UpdateStep number.');
    });
}

function incrementUpdateStepNumber(db) {
  log.silly('incrementUpdateStepNumer()');
  return db.collection('properties').updateOne({name: 'updateStepNumber'}, {
    $set: {value: stepNumber}
  }, {upsert: true})
    .catch(err => {
      log.error('Could not update updatestep number', err);
      throw new Error('fetching_updatestepnumber_failed');
    });
}


function updateStep(db) {
  const promises = [];
  db.collection('workout').find({course: {$in: classes}})
    .toArray()
    .then(workouts => {
      workouts.forEach(workout => {
        log.silly('found workout', workout);
        const name = workout.course;
        const slicedName = name.slice(13);
        const mappedName = classMapping[slicedName];
        log.silly('found workout', mappedName);
        const updatePromise = db.collection('workout').update({_id: new ObjectId(workout._id)}, {
          $set: {
            course: mappedName,
            type: 'teamtraining'
          }
        });
        promises.push(updatePromise);
      });
    });
  log.silly('updated number of workouts:', promises.length);
  return Promise.all(promises);
}

