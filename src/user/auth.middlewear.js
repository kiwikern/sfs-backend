const jwt = require('koa-jwt');
const jwtSecret = require('../secrets.js').jwt;

exports.getAuth = () => jwt({secret: jwtSecret.privateKey});

exports.getTokenWithoutAuth = () => jwt({secret: jwtSecret.privateKey, passthrough: true});