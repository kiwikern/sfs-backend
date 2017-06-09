let collection = {};

exports.init = (dbInstance) => {
  collection = dbInstance.collection('sync');
};

exports.addState = (state) => {
  return new Promise((resolve, reject) => {
      collection.updateOne({userid: state.userid}, state, {upsert: true}, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    };

exports.deleteState = (state) => {
  return new Promise((resolve, reject) => {
    collection.deleteMany({userid: state.userid}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
};

exports.findState = (state) => {
  return new Promise((resolve, reject) => {
    collection.findOne({userid: state.userid}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
}
