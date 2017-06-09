const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;
const pushService = require('../push/push.service.js');
const scheduleService = require('../schedule/schedule.service.js');
const userService = require('../user/user.service.js');
const syncService = require('../sync/sync.service.js');

exports.init = () => {
  return new Promise((resolve, reject) =>  {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log('DatabaseService: init finished');
        pushService.init(db);
        scheduleService.init(db);
        userService.init(db);
        syncService.init(db);
        resolve();
      }
    });
  });
}
