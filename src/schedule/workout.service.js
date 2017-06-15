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
  return findWorkout(workout)
    .then(foundWorkout => {
      if (!foundWorkout) {
        return saveWorkout(workout);
      } else {
        return foundWorkout._id;
      }
    });
}

function findWorkout(workout) {
  return new Promise((resolve, reject) => {
    workouts.findOne(workout, (err, result) => {
      if (err) {
        console.log('could not find workout');
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
        console.log('could not save workout');
        reject(err);
      } else {
        resolve(result.insertedId);
      }
    });
  });
}