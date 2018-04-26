const workoutUpdater = require('./workout.updater');

/**
 * Added new workout types to workout mapping.
 */
exports.run = db => {
  const classes = [
    "4d pro ® bungee fitness",
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

