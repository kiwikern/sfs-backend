const request = require('supertest');
const app = require('../../../src/index.js');
const dbHelper = require('../db.helper.js');
let userHelper = require('./user.helper.js');

describe('User registration and login', () => {
  beforeAll((done) => {
    let agent;
    app.init.then(() => agent = request.agent(app.listen()))
      .then(() => dbHelper.init())
      .then(() => userHelper.init(agent))
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  const user = {
    userName: 'test',
    mailAddress: 'test@test.de',
    password: '123456'
  };

  it('should reject empty registration', (done) => {
    userHelper.register(null)
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('invalid_request');
        done();
      });
  });

  it('should accept registration but deny double', (done) => {
    userHelper.register(user)
      .then(response => {
        expect(response.status).toBe(201);
        expect(response.body.userName).toBe(user.userName);
        expect(response.body.token).not.toBe(null);
      })
      .then(() => userHelper.register(user))
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('username_exists');
        done();
      });
  });

  it('should accept login', (done) => {
    userHelper.register(user)
      .then(() => userHelper.login(user))
      .then(response => {
        expect(response.status).toBe(201);
        expect(response.body.userName).toBe(user.userName);
        expect(response.body.token).not.toBe(null);
        done();
      });
  });

  it('should deny login', (done) => {
    userHelper.login(user)
      .then(response => {
        expect(response.status).toBe(401);
        expect(response.body.key).toBe('user_not_found');
        done();
      });
  });

});
