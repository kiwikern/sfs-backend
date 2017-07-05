const winston = require('winston');
const level = require('../config').loglevel;
exports.getLogger = (label) => {
  const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        colorize: true,
        timestamp: true,
        label,
        level
      })
    ]
  });
  return logger;
};
