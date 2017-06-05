const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/sfs`;
const subscriptionService = require('./subscription-service.js');
const scheduleService = require('./schedule-service.js');
const userService = require('./user-service.js');
const syncService = require('../sync/sync-service.js');

exports.init = () => {
  return new Promise((resolve, reject) =>  {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log('DatabaseService: init finished');
        subscriptionService.init(db);
        scheduleService.init(db);
        userService.init(db);
        syncService.init(db);
        resolve();
      }
    });
  });
}
