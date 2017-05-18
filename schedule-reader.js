const Promise = require('bluebird');
const readFile = Promise.promisify(require("fs").readFile);

exports.getJSON = () => {
  return readFile('./schedule.json')
    .then(content => JSON.parse(content))
    .catch(error => {
      console.log(new Date().toUTCString())
      console.log('Reading file failed.') 
      console.log(error)
    });
}
