const request = require('supertest');
const appHelper = require('../app.helper');
const dbHelper = require('../db.helper');
let userHelper = require('./user.helper');

describe('User registration and login', () => {
  beforeAll((done) => {
    let agent;
    appHelper.init()
      .then(() => agent = request.agent(appHelper.listen()))
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
        expect(response.status).toBe(200);
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

  it('should reset password', (done) => {
    const newPassword = '456123';
    const newUser = {userName: 'test', password: newPassword};
    userHelper.register(user)
      .then(() => userHelper.login(newUser))
      .then(response => {
        expect(response.status).toBe(401);
        expect(response.body.key).toBe('wrong_password');
      })
      .then(() => userHelper.requestPasswordReset(user))
      .then(response => {
        expect(response.status).toBe(200);
        expect(appHelper.getLastResetPasswordToken()).not.toBeNull();
      })
      .then(() => userHelper.resetPassword(appHelper.getLastResetPasswordToken(), newPassword))
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.token).not.toBeNull();
      })
      .then(() => userHelper.login(newUser))
      .then(response => {
        expect(response.status).toBe(200);
        done();
      })
  })

});
