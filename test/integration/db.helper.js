const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../../src/secrets.js').mongo;
const ObjectId = require('mongodb').ObjectID;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;

let db;

exports.init = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, connection) => {
      if (err) {
        reject(err);
      } else {
        db = connection;
        resolve();
      }
    });
  });
};

exports.drop = () => {
  return new Promise((resolve, reject) => {
    db.collections((error, collections) => {
      Promise.all(collections.map(c => dropCollection(c)))
        .then(() => resolve());
    });
  });
};

exports.insertSchedule = () => {
  return insertWorkout()
    .then(workoutId => insertSchedule(workoutId));
};

function dropCollection(collection) {
  return new Promise((resolve, reject) => {
    if (collection.collectionName.indexOf('system') === 0) return resolve();
    collection.remove(resolve);
  });
}

exports.insertWorkout = (course = 'bauch', type = 'teamtraining') => {
  const workoutId = new ObjectId();
  return new Promise((resolve, reject) => {
    db.collection('workout').insertOne({
      "_id": workoutId,
      "course": course,
      "studio": "berlin-europa-center",
      "type": type,
      "day": "tuesday",
      "time": "10:30",
      "duration": 20
    }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(workoutId);
      }
    })
  });
};

exports.findWorkout = workoutId => {
  return db.collection('workout').findOne({_id: new ObjectId(workoutId)});
};

function insertSchedule(workoutId) {
  return new Promise((resolve, reject) => {
    db.collection('schedules').insertOne({
      "schedule": [
        ObjectId(workoutId)
      ],
      "insertDate": new Date()
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  });
}