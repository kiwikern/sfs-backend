const workoutUpdater = require('./workout.updater');

/**
 * Added new workout types to workout mapping.
 */
exports.run = db => {
  const classes = [
    "fullbody strength", "defense"
  ];
  return workoutUpdater.updateClassNames(db, classes);
};
