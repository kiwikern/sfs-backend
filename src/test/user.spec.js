const request = require('supertest');
const app = require('../index.js');
const dbHelper = require('./db.helper.js');

describe('User registration and login', () => {
  let agent;
  beforeAll((done) => {
    app.init.then(() => agent = request.agent(app.listen()))
      .then(() => dbHelper.init())
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
    agent
      .post('/user')
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('invalid_request');
        done();
      });
  });

  it('should accept registration', (done) => {
    agent
      .post('/user')
      .send(user)
      .then(response => {
        expect(response.status).toBe(201);
        expect(response.body.userName).toBe(user.userName);
        expect(response.body.token).not.toBe(null);
      })
      .then(() => agent.post('/user').send(user))
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('username_exists');
        done();
      });
  });

  it('should accept login', (done) => {
    agent
      .post('/user')
      .send(user)
      .then(() => agent.post('/user/session').send(user))
      .then(response => {
        expect(response.status).toBe(201);
        expect(response.body.userName).toBe(user.userName);
        expect(response.body.token).not.toBe(null);
        done();
      });
  });

  it('should deny login', (done) => {
    agent.post('/user/session').send(user)
      .then(response => {
        expect(response.status).toBe(404);
        expect(response.body.key).toBe('user_not_found');
        done();
      });
  });

});
