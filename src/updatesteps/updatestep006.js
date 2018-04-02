const workoutUpdater = require('./workout.updater');

/**
 * Added new workout types to workout mapping.
 */
exports.run = db => {
  const classes = [
    "tone",
    "tone express",
    "trx mobility"
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

