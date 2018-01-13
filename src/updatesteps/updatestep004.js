const workoutUpdater = require('./workout.updater');

/**
 * Added new workout type cx worx to workout mapping.
 */
exports.run = db => {
  const classes = [
    "cellulite-killer",
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

