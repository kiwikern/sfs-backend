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

exports.addResponse = (feedbackId, response) => {
  return new Promise((resolve, reject) => {
    collection.updateOne({_id: new ObjectID(feedbackId)}, {$push: {"feedback.responses": response}}, (err, result) => {
      if (err) {
        log.error('could not add response', err);
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
    collection.find({userId}, {sort: {"feedback.date": -1}}, (err, result) => {
      if (err) {
        log.error('could not find feedback', err);
        reject(err);
      } else {
        resolve(result.toArray());
      }
    });
  })
};

exports.findAllFeedback = () => {
  return new Promise((resolve, reject) => {
    collection.find({}, {sort: {"feedback.date": -1}}, (err, result) => {
      if (err) {
        log.error('could not find feedback', err);
        reject(err);
      } else {
        resolve(result.toArray());
      }
    });
  })
};

exports.markRead = (feedbackId, isAdmin) => {
  if (isAdmin) {
    markFeedbackRead(feedbackId);
  }
  return findFeedbackById(feedbackId)
    .then(result => {
      if (result && result.feedback && Array.isArray(result.feedback.responses)) {
        const responses = result.feedback.responses.map(r => {
          if (r && (r.userId === 'sfs') !== isAdmin) {
            r.isRead = true;
          }
          return r;
        });
        return updateResponses(feedbackId, responses)
      } else {
        log.warn('no feedback found to mark read', feedbackId);
        return true;
      }
    });
};

function findFeedbackById(feedbackId) {
  return new Promise((resolve, reject) => {
    collection.findOne({_id: new ObjectID(feedbackId)}, (err, result) => {
      if (err) {
        log.error('could not find feedback', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function updateResponses(feedbackId, responses) {
  return new Promise((resolve, reject) => {
    collection.updateOne({_id: new ObjectID(feedbackId)}, {$set: {"feedback.responses": responses}}, (err, result) => {
      if (err) {
        log.error('could not update responses', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function markFeedbackRead(feedbackId) {
  return new Promise((resolve, reject) => {
    collection.updateOne({_id: new ObjectID(feedbackId)}, {$set: {'feedback.isRead': true}}, (err, result) => {
      if (err) {
        log.error('could not update responses', err);
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
}