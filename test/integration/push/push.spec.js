const request = require('supertest');
const app = require('../../../src/index.js');
const dbHelper = require('../db.helper.js');
const pushHelper = require('./push.helper.js');

describe('Sync', () => {
  const subscription = {
    endpoint: 'endpoint',
    expirationTime: 'expirationTime',
    keys: {
      p256dh: 'p256dh',
      auth: 'auth'
    }
  };
  beforeAll((done) => {
    let agent;
    app.init.then(() => agent = request.agent(app.listen()))
      .then(() => dbHelper.init())
      .then(() => pushHelper.init(agent))
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  it('should reject empty POST', (done) => {
    pushHelper.savePushSubscription(null)
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('no-endpoint');
        done();
      });
  });

  it('should accept POST with full subscription data', (done) => {
    pushHelper.savePushSubscription(subscription)
      .then(response => {
        expect(response.status).toBe(200);
        done();
      });
  });

});
