const log = require('../logger/logger.instance').getLogger('FeedbackService');
const ObjectID = require('mongodb').ObjectID;
let collection = {};

exports.init = (dbInstance) => {
  collection = dbInstance.collection('feedback');
};

exports.addFeedback = (feedback) => {
  return new Promise((resolve, reject) => {
    collection.insertOne(feedback, (err, result) => {
      if (err) {
        log.error('could not add feedback', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.updateFeedback = (feedbackId, updateValues) => {
  return new Promise((resolve, reject) => {
    collection.updateOne({_id: new ObjectID(feedbackId)}, {$set: updateValues}, (err, result) => {
      if (err) {
        log.error('could not update feedback', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
};

exports.findFeedbackList = userId => {
  return new Promise((resolve, reject) => {
    collection.find({userId}, (err, result) => {
      if (err) {
        log.error('could not find feedback', err);
        reject(err);
      } else {
        resolve(result.toArray());
      }
    });
  })
};
