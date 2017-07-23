const log = require('../logger/logger.instance').getLogger('PushService');
let subscriptions = {};

exports.init = (dbInstance) => {
  subscriptions = dbInstance.collection('subscriptions');
};

exports.addSubscription = (subscriptionData) => {
  return new Promise((resolve, reject) => {
    subscriptions.updateOne(getSearchCond(subscriptionData), subscriptionData, {upsert: true}, (err, result) => {
      if (err) {
        log.error('could not add subscription', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

function getSearchCond(subscriptionData) {
  const userId = subscriptionData.userId;
  const subscription = subscriptionData.subscription;
  if (userId && userId.length > 0) {
    return {
      $or: [{userId}, {
        'subscription.endpoint': subscription.endpoint,
        'subscription.expirationTime': subscription.expirationTime,
        'subscription.keys.p256dh': subscription.keys.p256dh,
        'subscription.keys.auth': subscription.keys.auth
      }]
    };
  } else {
    return {subscription}
  }
}

exports.deleteSubscription = (subscriptionId) => {
  return new Promise((resolve, reject) => {
    subscriptions.deleteOne({_id: subscriptionId}, (err, result) => {
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
