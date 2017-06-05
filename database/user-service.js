let collection = {};

exports.init = (dbInstance) => {
  collection = dbInstance.collection('user');
};

exports.addUser = (user) => {
  return new Promise((resolve, reject) => {
      collection.insertOne(user, (err, result) => {
        if (err) {
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
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
};

exports.findUser = searchCond => findUser(searchCond);
function findUser(searchCond) {
  return new Promise((resolve, reject) => {
    collection.findOne(searchCond, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
}
