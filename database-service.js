const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('./secrets.js').mongo;
const url = `mongodb://localhost:${mongoSecrets.port}/sfs`;
let dbInstance = {};

exports.init = () => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
      return;
    }
    dbInstance = db;
  })
};

exports.addSubscription = (subscription) => {
  return new Promise((resolve, reject) => {
    const subscriptions = dbInstance.collection('subscriptions');
    subscriptions.updateOne(subscription, subscription, {upsert: true}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.deleteSubscription = (subscription) => {
  return new Promise((resolve, reject) => {
    const subscriptions = dbInstance.collection('subscriptions');
    subscriptions.deleteOne(subscription, (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log('deleted subscription');
        resolve(result);
      }
    });
  });
};

exports.getAllSubscriptions = () => {
  return new Promise((resolve, reject) => {
    const subscriptions = dbInstance.collection('subscriptions');
    subscriptions.find({}).toArray((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
