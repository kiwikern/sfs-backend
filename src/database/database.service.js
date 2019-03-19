const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;
const pushService = require('../push/push.service.js');
const scheduleService = require('../schedule/schedule.service.js');
const workoutService = require('../schedule/workout.service.js');
const changesService = require('../schedule/changes.service.js');
const userService = require('../user/user.service.js');
const syncService = require('../sync/sync.service.js');
const feedbackService = require('../feedback/feedback.service');
const log = require('../logger/logger.instance').getLogger('DatabaseService');

exports.init = () => {
  return new Promise((resolve, reject) =>  {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        log.error('could not connect to database', err);
        reject();
      } else {
        pushService.init(db);
        scheduleService.init(db);
        workoutService.init(db);
        changesService.init(db);
        userService.init(db);
        syncService.init(db);
        feedbackService.init(db);
        resolve();
      }
    });
  }).then(() => log.info('init finished'));
};
