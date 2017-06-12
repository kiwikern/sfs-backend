const rewire = require('rewire');
const syncGetter = rewire('../../../src/sync/sync.getter.js');

describe(`SyncGetter`, () => {
  let ctx;
  beforeEach(() => {
    ctx = {response: {}, state: {}};
  });

  it('should return 400 without userid', () => {
    ctx.state.user = {};
    syncGetter.getSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('no_userid_given');
  });

  it('should return 200 when no state is found', (done) => {
    syncGetter.__set__(getServiceMock(null));
    ctx.state.user = {id: 100};
    syncGetter.getSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      expect(ctx.response.body.key).toBe('no_sync_status_found');
      done();
    });
  });

  it('should return 200 when state is found', (done) => {
    const state = {state: 1};
    syncGetter.__set__(getServiceMock(state));
    ctx.state.user = {id: 100};
    syncGetter.getSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      expect(ctx.response.body).toBe(state);
      done();
    });
  });

  it('should return 500 on database error', (done) => {
    let logResult;
    const log = result => logResult = result;
    syncGetter.__set__(getServiceErrorMock('error', log));
    ctx.state.user = {id: 100};
    syncGetter.getSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(500);
      expect(ctx.response.body).toBe(undefined);
      expect(logResult).toBe('error');
      done();
    });
  });

  function getServiceMock(result) {
    return {
      syncService: {findState: () => Promise.resolve(result)}
    };
  }

  function getServiceErrorMock(error, log) {
    return {
      syncService: {findState: () => Promise.reject(error)},
      console: {log}
    };
  }

});
