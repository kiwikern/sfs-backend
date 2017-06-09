let subscriptions = {};

exports.init = (dbInstance) => {
  subscriptions = dbInstance.collection('subscriptions');
};

exports.addSubscription = (subscription) => {
  return new Promise((resolve, reject) => {
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
    subscriptions.find({}).toArray((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
