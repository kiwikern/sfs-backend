const fs = require('fs');
const padStart = require('string.prototype.padstart');
const MongoClient = require('mongodb').MongoClient;
const mongoSecrets = require('../secrets.js').mongo;
const url = `mongodb://${mongoSecrets.user}:${mongoSecrets.password}@localhost:${mongoSecrets.port}/${mongoSecrets.dbname}`;
const log = require('../logger/logger.instance').getLogger(`UpdateStepRunner`);
let db = null;

function connectToDatabase() {
  log.silly('connectToDatabase()');
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, dbConnection) => {
      if (err) {
        log.error('could not connect to database', err);
        return reject('could not connect to database');
      } else {
        db = dbConnection;
        return resolve();
      }
    });
  });
}

module.exports.runAll = () => {
  log.silly('runAll()');
  let dbPromise = Promise.resolve();
  if (!db) {
    dbPromise = connectToDatabase();
  }
  const usPromises = [];
  return dbPromise
    .then(() => Promise.all([getUpdateStepNumber(), findMaxUpdateStep()]))
    .then(stepNumbers => ({latestStep: stepNumbers[0], maxStepNumber: stepNumbers[1]}))
    .then(({latestStep, maxStepNumber}) => range(latestStep + 1, maxStepNumber))
    .then(steps => steps.forEach(step => usPromises.push(module.exports.run(step))))
    .then(() => Promise.all(usPromises));
};

function range(start, end) {
  log.silly(`range(${start}, ${end})`);
  const updateStepsToRun = [...new Array(end - start + 1).keys()].map(step => step + start);
  log.silly('updateSteps to be run', updateStepsToRun);
  return updateStepsToRun;
}

/**
 * Run updatestep with: node -e "require('./src/updatesteps/updatestep.runner').run(1)"
 */
module.exports.run = stepNumber => {
  log.info(`Updatestep${stepNumber} started`);
  let dbPromise = Promise.resolve();
  if (!db) {
    dbPromise = connectToDatabase();
  }
  return dbPromise
    .then(() => getUpdateStepNumber())
    .then(lastExecutedStep => hasNotAlreadyBeenExecuted(lastExecutedStep, stepNumber))
    .then(() => runUpdateStep(stepNumber))
    .then(() => incrementUpdateStepNumber(stepNumber));
};

function findMaxUpdateStep() {
  log.silly('findMaxUpdateStep()');
  return new Promise((resolve, reject) => {
    fs.readdir('./src/updatesteps', (err, files) => {
      log.silly(`found files`, files);
      if (err) {
        log.error('could not find max update step number', err);
        return reject(err);
      } else {
        const regex = /updatestep(\d\d\d).js/;
        const steps = files.filter(f => regex.test(f))
          .map(f => regex.exec(f)[1])
          .map(numberString => Number.parseInt(numberString));
        log.silly('found steps', steps);
        const maxStep = Math.max(...steps);
        log.silly('found maxstep', maxStep);
        return resolve(maxStep);
      }
    });
  });
}

function runUpdateStep(stepNumber) {
  log.silly(`runUpdateStep(${stepNumber})`);
  const stepString = padStart(('' + stepNumber), 3, '0');
  const paddedStep = stepString.substr(stepString.length - 3);
  const updateStep = require(`./updatestep${paddedStep}`);
  updateStep.run(db);
}

function hasNotAlreadyBeenExecuted(lastExecutedStep, stepNumber) {
  log.silly(`hasNotAlreadyBeenExecuted(${lastExecutedStep}, ${stepNumber})`);
  stepNumber = stepNumber || -1;
  if (stepNumber > lastExecutedStep) {
    return Promise.resolve();
  } else {
    log.error('UpdateStep already executed.');
    return Promise.reject('UpdateStep already executed.');
  }
}

function getUpdateStepNumber() {
  log.silly(`getUpdateStepNumber()`);
  return db.collection('properties').findOne({name: 'updateStepNumber'})
    .then(prop => prop && prop.value ? prop.value : 0)
    .catch(err => {
      log.error('Could not fetch updatestep number', err);
      return Promise.reject('Could not fetch UpdateStep number.');
    });
}

function incrementUpdateStepNumber(stepNumber) {
  log.silly('incrementUpdateStepNumer()');
  return db.collection('properties').updateOne({name: 'updateStepNumber'}, {
    $set: {value: stepNumber}
  }, {upsert: true})
    .catch(err => {
      log.error('Could not update updatestep number', err);
      throw new Error('fetching_updatestepnumber_failed');
    });
}
