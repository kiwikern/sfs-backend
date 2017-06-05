let collection = {};

exports.init = (dbInstance) => {
  collection = dbInstance.collection('user');
};

exports.addUser = (user) => {
  console.log('trying to add user');
  console.log(user);
  return new Promise((resolve, reject) => {
      collection.insertOne(user, (err, result) => {
        if (err) {
          console.log('creating user failed')
          console.log(err)
          reject(err);
        } else {
          console.log('created user')
          console.log(result.insertedId);
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
  console.log('searchCond')
  console.log(searchCond)
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

function getSearchCond(user) {
  if (user._id) {
    return user;
  }
    return {$or: [
      {mailAddress: user.mailAddress || 'NONE_GIVEN'},
      {userName: user.userName}
    ]};
}
