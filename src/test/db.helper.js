const MongoClient = require('mongodb').MongoClient
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;

let db;

exports.init = () => {
  return new Promise((resolve, reject) =>  {
    MongoClient.connect(url, (err, connection) => {
      if (err) {
        reject(err);
      } else {
        db = connection;
        resolve();
      }
    });
  });
}

exports.drop = () => {
  return new Promise((resolve, reject) =>  {
    db.collections((error, collections) => {
      Promise.all(collections.map(c => dropCollection(c)))
        .then(() => resolve());
    });
  });
}

function dropCollection(collection) {
  return new Promise((resolve, reject) => {
    if (collection.collectionName.indexOf('system') === 0) return resolve();
    collection.remove(resolve);
  });
}
