const jwt = require('koa-jwt');
const jwtSecret = require('../secrets.js').jwt;

exports.getAuth = () => jwt({secret: jwtSecret.privateKey});
