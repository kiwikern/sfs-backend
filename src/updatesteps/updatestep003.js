const workoutUpdater = require('./workout.updater');

/**
 * Added new workout type cx worx to workout mapping.
 */
exports.run = db => {
  const classes = [
    "cx worx",
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

