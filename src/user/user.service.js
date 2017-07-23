const log = require('../logger/logger.instance').getLogger('UserService');
const ObjectID = require('mongodb').ObjectID;
let collection = {};

exports.init = (dbInstance) => {
  collection = dbInstance.collection('user');
  collection.createIndex({userName: 1}, {unique: true});
  collection.createIndex({mailAddress: 1}, {unique: true, partialFilterExpression: {mailAddress: {$type: "string"}}});
};

exports.addUser = (user) => {
  return new Promise((resolve, reject) => {
    collection.insertOne(user, (err, result) => {
      if (err) {
        log.error('could not add user', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.deleteUser = (searchCond) => {
  return new Promise((resolve, reject) => {
    collection.deleteOne(searchCond, (err, result) => {
      if (err) {
        log.error('could not delete user', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
};

exports.updateUser = (userId, updateValues) => {
  return new Promise((resolve, reject) => {
    if (userId && !ObjectID.isValid(userId)) {
      log.warn('userId is invalid', userId);
      return reject('userId is invalid' + userId);
    }
    collection.updateOne({_id: new ObjectID(userId)}, {$set: updateValues}, (err, result) => {
      if (err) {
        log.error('could not update user', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
};

exports.findUser = searchCond => findUser(searchCond);

exports.findUserByNameMailOrId = user => findUser(getSearchCondition(user));

function getSearchCondition(user) {
  if (user._id && ObjectID.isValid(user._id)) {
    return {_id: new ObjectID(user._id)};
  }
  const userName = user.userName ? new RegExp(user.userName, "i") : null;
  return {
    $or: [
      {mailAddress: user.mailAddress || 'NONE_GIVEN'},
      {userName}
    ]
  };
}

function findUser(searchCond) {
  return new Promise((resolve, reject) => {
    collection.findOne(searchCond, (err, result) => {
      if (err) {
        log.error('could not find user', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
}
