const nameUpdater = require('workoutname.updater');

/**
 * Added new workout type cx worx to workout mapping.
 */
exports.run = db => {
  const classes = [
    "cx worx",
  ];
  return nameUpdater.updateClassNames(db, classes);
};

