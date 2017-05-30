const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/sfs`;
const subscriptionService = require('./subscription-service.js');
const scheduleService = require('./schedule-service.js');

exports.init = () => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      console.log('DatabaseService: init finished');
      subscriptionService.init(db);
    }
  });
}
