const request = require('supertest');
const app = require('../../index.js');
const dbHelper = require('../db.helper.js');
const userHelper = require('../user/user.helper.js');
const syncHelper = require('./sync.helper.js');

describe('Sync', () => {
  beforeAll((done) => {
    let agent;
    app.init.then(() => agent = request.agent(app.listen()))
      .then(() => dbHelper.init())
      .then(() => userHelper.init(agent))
      .then(() => syncHelper.init(agent))
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
      .then(() => userHelper.register(user))
      .then(response => token = response.body.token)
      .then(() => done());
  });


  it('should reject GET without auth', (done) => {
    syncHelper.getSync(null)
      .then(response => {
        expect(response.status).toBe(401);
        done();
      });
  });

  it('should reject POST without auth', (done) => {
    syncHelper.getSync({})
    .then(response => {
      expect(response.status).toBe(401);
      done();
    });
  });

  it('should GET sync status', (done) => {
    syncHelper.getSync(token)
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.key).toBe('no_sync_status_found');
        done();
      });
  });

  it('should save (POST) sync status and return it (GET) with new lastUpdate', (done) => {
    const date = Date.now();
    const syncState = {lastUpdate: 2, state: {favorites: 10}};
    syncHelper.postSync(token, syncState)
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.lastUpdate).toBeGreaterThan(date);
        expect(response.body.token).not.toBe(null);
      })
      .then(() => syncHelper.getSync(token))
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.lastUpdate).toBeGreaterThan(date);
        expect(response.body.state.favorites).not.toBe(null);
        done();
      });
  });

});
