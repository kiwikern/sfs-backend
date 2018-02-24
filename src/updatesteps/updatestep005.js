const workoutUpdater = require('./workout.updater');

/**
 * Added new workout types to workout mapping.
 */
exports.run = db => {
  const classes = [
    "fullbody cycle",
    "grit"
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

