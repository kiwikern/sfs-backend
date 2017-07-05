const log = require('../logger/logger.instance').getLogger('PushService');
let subscriptions = {};

exports.init = (dbInstance) => {
  subscriptions = dbInstance.collection('subscriptions');
};

exports.addSubscription = (subscription) => {
  return new Promise((resolve, reject) => {
    subscriptions.updateOne(subscription, subscription, {upsert: true}, (err, result) => {
      if (err) {
        log.error('could not add subscription', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.deleteSubscription = (subscription) => {
  return new Promise((resolve, reject) => {
    subscriptions.deleteOne(subscription, (err, result) => {
      if (err) {
        log.error('could not delete subscription', err);
        reject(err);
      } else {
        log.debug('deleted subscription');
        resolve(result);
      }
    });
  });
};

exports.getAllSubscriptions = () => {
  return new Promise((resolve, reject) => {
    subscriptions.find({}).toArray((err, result) => {
      if (err) {
        log.error('could not get all subscriptions', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
