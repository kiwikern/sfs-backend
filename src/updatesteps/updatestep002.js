const workoutUpdater = require('./workout.updater');

/**
 * Added new workout types BodyPump 45 and TwerkOut to workout mapping.
 */
exports.run = db => {
  const classes = [
    "twerkout",
    "bodypump 45"
  ];
  return workoutUpdater.updateClassNames(db, classes);
};

