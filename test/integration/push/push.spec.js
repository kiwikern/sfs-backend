const request = require('supertest');
const appHelper = require('../app.helper');
const dbHelper = require('../db.helper.js');
const pushHelper = require('./push.helper.js');

describe('Push', () => {
  const subscriptionData = {
    userId: 'blabl', subscription: {
      endpoint: 'endpoint',
      expirationTime: 'expirationTime',
      keys: {
        p256dh: 'p256dh',
        auth: 'auth'
      }
    }
  };
  beforeAll((done) => {
    let agent;
    appHelper.init()
      .then(() => agent = request.agent(appHelper.listen()))
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
    pushHelper.savePushSubscription(subscriptionData)
      .then(response => {
        expect(response.status).toBe(200);
        done();
      });
  });

});
