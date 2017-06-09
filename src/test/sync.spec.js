const request = require('supertest');
const app = require('../index.js');
const dbHelper = require('./db.helper.js');

describe('Sync', () => {
  let agent;
  beforeAll((done) => {
    app.init.then(() => agent = request.agent(app.listen()))
      .then(() => dbHelper.init())
      .then(() => done());
  });

  let token;
  beforeEach(done => {
    const user = {
      userName: 'test',
      mailAddress: 'test@test.de',
      password: '123456'
    };

    dbHelper.drop()
      .then(() => agent.post('/user').send(user))
      .then(response => token = response.body.token)
      .then(() => done());
  });


  it('should reject GET without auth', (done) => {
    agent
      .get('/sync')
      .then(response => {
        expect(response.status).toBe(401);
        done();
      });
  });

  it('should reject POST without auth', (done) => {
    agent.post('/sync').send({})
    .then(response => {
      expect(response.status).toBe(401);
      done();
    });
  });

  it('should GET sync status', (done) => {
    agent
      .get('/sync')
      .set('Authorization', 'bearer ' + token)
      .send()
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.key).toBe('no_sync_status_found');
        done();
      });
  });

  it('should save (POST) sync status and return it (GET) with new lastUpdate', (done) => {
    const date = Date.now();
    agent
      .post('/sync')
      .set('Authorization', 'bearer ' + token)
      .send({lastUpdate: 2, state: {favorites: 10}})
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.lastUpdate).toBeGreaterThan(date);
        // expect(response.body.token).not.toBe(null);
      })
      .then(() => agent.get('/sync').set('Authorization', 'bearer ' + token).send())
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.lastUpdate).toBeGreaterThan(date);
        expect(response.body.state.favorites).not.toBe(null);
        done();
      });
  });

});
