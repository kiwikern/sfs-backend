const log = require('../logger/logger.instance').getLogger('WorkoutService');
let workouts = {};

exports.init = (dbInstance) => {
  workouts = dbInstance.collection('workout');
};

exports.addWorkouts = workouts => {
  const ids = workouts.map(w => addSingleWorkout(w));
  return Promise.all(ids);
};

exports.getWorkouts = workoutIds => {
  return new Promise((resolve, reject) => {
    workouts.find({'_id': {$in: workoutIds}}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.toArray());
      }
    });
  });
};

function addSingleWorkout(workout) {
  const searchCondition = {
    time: workout.time, course: workout.course, day: workout.day, studio: workout.studio
  };
  return findWorkout(searchCondition)
    .then(foundWorkout => {
      if (!foundWorkout) {
        return saveWorkout(workout);
      } else {
        return updateWorkout(foundWorkout._id, workout);
      }
    });
}

function updateWorkout(_id, workout) {
  return new Promise((resolve, reject) => {
    workouts.updateOne({_id}, {$set: workout}, (err, result) => {
      if (err) {
        log.error('could not update workout', err);
        reject(err);
      } else {
        resolve(_id);
      }
    });
  });
}

function findWorkout(workout) {
  return new Promise((resolve, reject) => {
    workouts.findOne(workout, (err, result) => {
      if (err) {
        log.error('could not find workout', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function saveWorkout(workout) {
  return new Promise((resolve, reject) => {
    workouts.insertOne(workout, (err, result) => {
      if (err) {
        log.error('could not save workout', err);
        reject(err);
      } else {
        resolve(result.insertedId);
      }
    });
  });
}